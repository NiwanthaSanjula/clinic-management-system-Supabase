// lib/services/consultationService.ts
// All DB operations for consultation and prescriptions

import { prisma } from "../prisma";

// Get full consultation by appointment ID
// Return null if consultation not started yet
export async function getConsultationByAppointmentId(appointmentId: string) {
    return prisma.consultation.findUnique({
        where: { appointmentId },
        include: {
            prescription: {
                include: {
                    items: {
                        include: {
                            medicine: true // Get medicines name/unit
                        }
                    }
                }

            }
        }
    })
}

// Get medicines for the prescription picker dropdown
export async function getMedicines() {
    return prisma.medicine.findMany({
        where: { isActive: true },
        orderBy: [
            { category: "asc" },
            { name: "asc" }
        ]
    })
}

// Create or update a consultation
// Called when doctor saves their notes
export async function saveConsultation(data: {
    appointmentId: string
    patientId: string
    doctorId: string
    chiefComplaint: string
    symptoms?: string
    clinicalNotes?: string
    diagnosis: string
}) {
    // upsert - create if first save, update if doctor edit
    return prisma.consultation.upsert({
        where: { appointmentId: data.appointmentId },
        create: data,
        update: {
            chiefComplaint: data.chiefComplaint,
            symptoms: data.symptoms,
            clinicalNotes: data.clinicalNotes,
            diagnosis: data.diagnosis
        }
    })
}


// Save prescription items
// Replace all existing items - simpler than diffing
export async function savePrescription(data: {
    consultationId: string
    patientId: string
    doctorId: string
    notes?: string
    items: {
        medicineId: string
        dosage: string
        frequency: string
        duration: string
        quantity: number
        instructions?: string
    }[]
}) {
    // upsert prescription header
    const prescription = await prisma.prescription.upsert({
        where: { consultationId: data.consultationId },
        create: {
            consultationId: data.consultationId,
            patientId: data.patientId,
            doctorId: data.doctorId,
            notes: data.notes,
        },
        update: { notes: data.notes }

    })

    // Delete existing items and recreate
    // Simple approach - no complex diffing needed
    await prisma.prescriptionItem.deleteMany({
        where: { prescriptionId: prescription.id }
    })

    if (data.items.length > 0) {
        await prisma.prescriptionItem.createMany({
            data: data.items.map(item => ({
                prescriptionId: prescription.id,
                ...item
            }))
        })
    }

    return prescription
}


// Get full visit history for a patient
// Used in the timeline on patient profile page
export async function getPatientVisitHistory(patientId: string) {
    return prisma.appointment.findMany({
        where: {
            patientId,
            status: "COMPLETED"
        },
        include: {
            consultation: {
                include: {
                    prescription: {
                        include: {
                            items: {
                                include: {
                                    medicine: true
                                }
                            }
                        }
                    }
                }
            },
            // Vital recorded during this appointment
        },
        orderBy: { date: "desc" }
    })
}