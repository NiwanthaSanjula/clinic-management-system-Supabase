// lib/services/appointmentService.ts

import { prisma } from "../prisma";
import { generateInvoice } from "./billingService";

// Get clinic setting - cached since it rarely changes
export async function getClinicSettings() {
    return prisma.clinicSettings.findFirst()
}

// Generate all possible time slots for a day
// Based on clinic open/close time and slot duration
export function generateTimeSlots(setting: {
    openTime: string
    closeTime: string
    slotDuration: number
    lunchStart: string
    lunchEnd: string
}): string[] {

    const slots: string[] = []

    // Convert "HH:MM" to total minutes from midnight
    function toMinutes(time: string) {
        const [h, m] = time.split(":").map(Number)
        return h * 60 + m
    }

    // Covert minutes back to "HH:MM"
    function toTimeString(minutes: number) {
        const h = Math.floor(minutes / 60).toString().padStart(2, "0")
        const m = (minutes % 60).toString().padStart(2, "0")
        return `${h}:${m}`
    }

    const open = toMinutes(setting.openTime)
    const close = toMinutes(setting.closeTime)
    const lunch1 = toMinutes(setting.lunchStart)
    const lunch2 = toMinutes(setting.lunchEnd)
    const duration = setting.slotDuration

    let current = open
    while (current + duration <= close) {
        // Skip lunch break slots
        const isLunch = current >= lunch1 && current < lunch2
        if (!isLunch) {
            slots.push(toTimeString(current))
        }
        current += duration
    }
    return slots
}

// Get all booked slots for a specific date
export async function getBookedSlots(date: string) {
    const appointments = await prisma.appointment.findMany({
        where: {
            date,
            status: { not: 'CANCELLED' }, // cancelled slots are free again
        },
        select: { timeSlot: true }
    })

    return appointments.map(a => a.timeSlot).filter(Boolean) as string[]
}

// Get available slots for a date
// Returns all slots minus alrady booked ones
export async function getAvailableSlots(date: string) {
    const settings = await getClinicSettings()
    if (!settings) return []

    const allSlots = generateTimeSlots(settings)
    const bookedSlots = await getBookedSlots(date)

    const today = new Date().toISOString().split("T")[0]
    const isToday = date === today

    // If viewing today, filter out slots that have already passed
    // Add 20 min buffer - no point booking a slot that starts 5 minutes
    const BUFFER_MINUTES = 20

    const nowMinutes = isToday
        ? new Date().getHours() * 60 + new Date().getMinutes() + BUFFER_MINUTES
        : 0; // future dates keep all slots

    // Filter out already booked slots
    return allSlots.filter(slot => {
        // Filter booked slots
        if (bookedSlots.includes(slot)) return false

        // Filter past slots only when viewing today
        if (isToday) {
            const [h, m] = slot.split(":").map(Number)
            const slotMinutes = h * 60 + m
            if (slotMinutes <= nowMinutes) return false
        }

        return true

    })
}

// Get all appointments for a specific date (for queue board)
export async function getAppointmentsByDate(date: string) {
    return prisma.appointment.findMany({
        where: { date },
        include: {
            patient: {
                include: {
                    profile: { select: { name: true } }
                }
            }
        },
        orderBy: [
            { timeSlot: "asc" }, // booked patients in time order
            { createdAt: "asc" }, // walk-ins in arrival order
        ]
    })
}

// Book a new appointment
export async function createAppointment(data: {
    patientId: string
    date: string
    timeSlot?: string
    type: "BOOKED" | "WALKIN"
    notes?: string
    createdBy: string
}) {
    // Double check slot is still available ( race condition protection )
    if (data.timeSlot) {
        const existing = await prisma.appointment.findUnique({
            where: {
                date_timeSlot: {
                    date: data.date,
                    timeSlot: data.timeSlot,
                }
            }
        })
        if (existing) throw new Error("This slot was just booked.Please choose another")
    }

    return prisma.appointment.create({ data })
}

// Update appointment status
// Validates allowed trasition
export async function updateAppointmentStatus(
    id: string,
    newStatus: "WAITING" | "IN_CONSULTATION" | "COMPLETED" | "CANCELLED"
) {
    const appointment = await prisma.appointment.findUnique({ where: { id } })
    if (!appointment) throw new Error("Appointment now found")

    // State machine - only allow valid transitions
    const allowed: Record<string, string[]> = {
        SCHEDULED: ["WAITING", "CANCELLED"],
        WAITING: ["IN_CONSULTATION", "CANCELLED"],
        IN_CONSULTATION: ["COMPLETED", "CANCELLED"],
        COMPLETED: [], // terminal state - cannot go back
        CANCELLED: [], // terminal state - cannot go back
    }

    if (!allowed[appointment.status].includes(newStatus)) {
        throw new Error(`Canot transition from ${appointment.status} to ${newStatus}`)
    }

    const updated = await prisma.appointment.update({
        where: { id },
        data: { status: newStatus }
    })

    // Auto generate invoice when appointment is completed
    // Only if a consultation exists (doctor must have seen the patient)
    if (newStatus === "COMPLETED") {
        const consultation = await prisma.consultation.findUnique({
            where: { appointmentId: id }
        })
        if (consultation) {
            // generateInvoice handle the case where invoice already exists
            await generateInvoice(id)
        }
    }

    await prisma.auditLog.create({
        data: {
            userId: "system",
            action: "UPDATE_APPOINTMENT_STATUS",
            entityType: "appointment",
            entityId: id,
            oldValue: { status: appointment.status },
            newValue: { status: newStatus }
        }
    })

    return updated
}


// Add walk-in patient to queue
export async function addWalkIn(data: {
    patientId: string
    notes?: string
    createdBy: string
}) {
    const today = new Date().toISOString().split("T")[0]

    return prisma.appointment.create({
        data: {
            patientId: data.patientId,
            date: today,
            timeSlot: null,
            type: "WALKIN",
            status: "WAITING",
            notes: data.notes,
            createdBy: data.createdBy,
        }
    })
}

// Get today's appointments for doctor - only WAITING and IN_CONSULTATION
// Doctor only sees patients ready for or in consultation
export async function getDoctorQueue(date: string) {
    return prisma.appointment.findMany({
        where: {
            date,
            status: { in: ["WAITING", "IN_CONSULTATION"] }
        },
        include: {
            patient: {
                include: {
                    profile: { select: { name: true } },
                    // Latest vitals recoreded by assistant
                    vitals: {
                        orderBy: { recordedAt: "desc" },
                        take: 1 // only most recent
                    }
                }
            },
            // Check if consultation ready started for this appointment
            consultation: {
                select: { id: true }
            }
        },
        orderBy: [
            { timeSlot: "asc" },
            { createdAt: "asc" }
        ]
    })
}