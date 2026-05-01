// app/assistant/patients/new/action.ts

"use server"

import { prisma } from "@/lib/prisma"
import { requireAssistant } from "@/lib/services/authService"
import { createPatientSchema } from "@/lib/validation/patient"
import { redirect } from "next/navigation"
import { createId } from "@paralleldrive/cuid2"

export async function createPatientAction(
    prevState: { error: string } | null,
    formData: FormData
) {
    // Only assistant can create new patients
    const assistant = await requireAssistant()

    const raw = {
        name: formData.get("name"),
        nic: formData.get("nic"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        dateOfBirth: formData.get("dateOfBirth"),
        gender: formData.get("gender"),
        bloodGroup: formData.get("bloodGroup"),
        address: formData.get("address"),
        knownAllergies: formData.get("knownAllergies")
    }

    const result = createPatientSchema.safeParse(raw)
    if (!result.success) {
        return { error: result.error.issues[0].message }
    }

    const d = result.data

    // Check NIC not already exists
    const existing = await prisma.patient.findUnique({ where: { nic: d.nic } })
    if (existing) return { error: "A patient with this NIC already exists" }

    // Assistant created patient have no auth account yet
    // They get a profile row with a generated ID (not from auth)
    const newId = createId()

    await prisma.$transaction(async (tx) => {
        // create a profile row so relations work
        await tx.profile.create({
            data: {
                id: newId,
                role: "PATIENT",
                name: d.name
            }
        })

        await tx.patient.create({
            data: {
                id: newId,
                nic: d.nic,
                phone: d.phone,
                email: d.email || null,
                dateOfBirth: d.dateOfBirth ? new Date(d.dateOfBirth) : null,
                gender: d.gender || null,
                address: d.address || null,
                bloodGroup: d.bloodGroup || null,
                knownAllergies: d.knownAllergies || null,
            }
        })

        // Audit log - who create this patient
        await tx.auditLog.create({
            data: {
                userId: assistant.id,
                action: "CREATE_PATIENT",
                entityType: "patient",
                entityId: newId,
                newValue: { name: d.name, nic: d.nic }
            }
        })
    })
    redirect("/assistant/patients")
}