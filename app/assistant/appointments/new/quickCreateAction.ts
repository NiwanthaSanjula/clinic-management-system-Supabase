// app/assistant/appointments/new/quickCreateAction.ts
// Minimal patient creation used ONLY from the booking form modal
// Returns the created patient so the form can auto-select them

"use server"

import { prisma } from "@/lib/prisma"
import { requireAssistant } from "@/lib/services/authService"
import { createId } from "@paralleldrive/cuid2"
import z from "zod"


// Minimal schema - just enough to book an appointment
const quickCreateSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    nic: z.string().min(12, "Invalid NIC").max(12, "Invalid NIC"),
    phone: z.string().min(10, "Invalid phone number").max(10, "Invalid phone number"),
})

type Result =
    | { success: true, patient: { id: string; name: string; nic: string } }
    | { success: false, error: string }

export async function quickCreatePatientAction(
    formData: FormData
): Promise<Result> {
    try {
        const assistant = await requireAssistant();

        const result = quickCreateSchema.safeParse({
            name: formData.get("name"),
            nic: formData.get("nic"),
            phone: formData.get("phone"),
        })

        if (!result.success) {
            return { success: false, error: result.error.issues[0].message }
        }

        const d = result.data

        // Check NIC uniqueness
        const existing = await prisma.patient.findUnique({
            where: { nic: d.nic }
        })
        if (existing) {
            return { success: false, error: "Patient with this NIC already exists" }
        }

        const newId = createId()

        await prisma.$transaction(async (tx) => {
            await tx.profile.create({
                data: { id: newId, role: "PATIENT", name: d.name }
            })

            await tx.patient.create({
                data: { id: newId, nic: d.nic, phone: d.phone }
            })

            // Audit who created this quick patient
            await tx.auditLog.create({
                data: {
                    userId: assistant.id,
                    action: "QUICK_CREATE_PATIENT",
                    entityType: "patient",
                    entityId: newId,
                    newValue: { name: d.name, nic: d.nic, source: "booking_form" }
                }
            })
        })

        // return patient data so model can auto-select them
        return {
            success: true,
            patient: { id: newId, name: d.name, nic: d.nic }
        }

    } catch (error) {
        console.log("Quick create error:", error)
        return { success: false, error: "Failed to create patient" }
    }
}