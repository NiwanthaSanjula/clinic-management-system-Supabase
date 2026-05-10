// lib/services/billingService.ts
// All billing related DB operations
// Invoice is auto-created when appointment → COMPLETED

import { prisma } from "../prisma";
import { deductStock } from "./inventoryService";

// Auto-generate invoice when appointment is completed
// Called from appointmentService.updateAppointmentStatus
export async function generateInvoice(appointmentId: string) {

    // Check invoice doesn't already exist
    const existing = await prisma.invoice.findUnique({
        where: { appointmentId }
    })
    if (existing) return existing // already generated — skip

    // Get clinic settings for consultation fee
    const settings = await prisma.clinicSettings.findFirst()
    const consultationFee = settings?.consultFee ?? 1000

    // Get appointment + patient + prescription items
    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
            patient: true,
            consultation: {
                include: {
                    prescription: {
                        include: {
                            items: {
                                include: {
                                    // Need price from medicine
                                    medicine: {
                                        select: {
                                            name: true,
                                            genericName: true,
                                            unit: true,
                                            price: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    if (!appointment) throw new Error("Appointment not found")

    // Build invoice items list
    const invoiceItems: {
        description: string
        quantity: number
        unitPrice: number,
        total: number
    }[] = []

    // Line 1 - always: consultation fee
    invoiceItems.push({
        description: "Consultation Fee",
        quantity: 1,
        unitPrice: consultationFee,
        total: consultationFee,
    })

    // Lines 2+ - medicines from prescription (if any)
    const prescriptionItems = appointment.consultation?.prescription?.items ?? []

    for (const item of prescriptionItems) {
        const lineTotal = item.quantity * item.medicine.price
        invoiceItems.push({
            description: `${item.medicine.name} (${item.medicine.genericName}) x ${item.quantity} ${item.medicine.unit}}`,
            quantity: item.quantity,
            unitPrice: item.medicine.price,
            total: lineTotal,
        })
    }

    // Calculate totals
    const medicineTotal = invoiceItems
        .slice(1) // skip consultation fee line
        .reduce((sum, item) => sum + item.total, 0)

    const totalAmount = consultationFee + medicineTotal

    // Create invoice + items in one transaction
    const invoice = await prisma.$transaction(async (tx) => {
        const invoice = await tx.invoice.create({
            data: {
                patientId: appointment.patientId,
                appointmentId,
                consultationFee,
                medicineTotal,
                totalAmount,
                status: "UNPAID"
            }
        })

        await tx.invoiceItem.createMany({
            data: invoiceItems.map(item => ({
                invoiceId: invoice.id,
                ...item
            }))
        })

        await tx.auditLog.create({
            data: {
                userId: "system", // auto-generated, no user actor
                action: "GENERATE_INVOICE",
                entityType: "invoice",
                entityId: invoice.id,
                newValue: {
                    totalAmount,
                    appointmentId,
                    consultationFee,
                    medicineTotal,
                }
            }
        })
        return invoice
    })

    // Deduct stock for each prescribed medicine using FEFO
    for (const item of prescriptionItems) {
        const result = await deductStock({
            medicineId: item.medicineId,
            quantityNeeded: item.quantity,
            reason: "prescription_dispensed",
            referenceId: invoice.id,
            createdBy: "system"
        })

        if (!result.success) {
            console.warn(
                `Low stock: ${item.medicine.name} - ` +
                `need ${item.quantity}, short by ${result.shortfall}`
            )
        }
    }

    return invoice
}

// Get all unpaid invoices for a patient
export async function getUnpaidInvoices() {
    return prisma.invoice.findMany({
        where: { status: "UNPAID" },
        include: {
            patient: {
                include: { profile: { select: { name: true } } }
            },
            appointment: {
                select: { date: true, timeSlot: true }
            },
            items: true
        },
        orderBy: { createdAt: "asc" } // Olderst first
    })
}

// Get single invoice with fulll details
export async function getInvoiceByAppointmentId(appointmentId: string) {
    return prisma.invoice.findUnique({
        where: { appointmentId },
        include: {
            items: true,
            patient: {
                include: {
                    profile: { select: { name: true } }
                }
            }
        }
    })
}

// Mark invoice as paid
export async function markInvoicePaid(
    invoiceId: string,
    paymentMethod: "CASH" | "CARD"
) {
    return prisma.invoice.update({
        where: { id: invoiceId },
        data: {
            status: "PAID",
            paymentMethod,
            paidAt: new Date()
        }
    })
}

// Get all invoices for a patient - for patient portal
export async function getPatientInvoices(patientId: string) {
    return prisma.invoice.findMany({
        where: { patientId },
        include: {
            items: true,
            appointment: {
                select: {
                    date: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    })

}
