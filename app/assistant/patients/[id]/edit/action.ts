// app/assistant/patients/[id]/edit/action.ts

"use server"

import { prisma } from "@/lib/prisma"
import { requireAssistant } from "@/lib/services/authService"
import { updatePatient } from "@/lib/services/patientService"
import { ActionState, getErrorMessage } from "@/lib/utils/actionError"
import { createPatientSchema } from "@/lib/validation/patient"
import { redirect } from "next/navigation"

export async function updatePatientAction(
    id: string,
    prevState: { error: string } | null,
    formData: FormData
): Promise<ActionState> {


    const raw = {
        name: formData.get("name"),
        nic: formData.get("nic"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        dateOfBirth: formData.get("dateOfBirth"),
        gender: formData.get("gender"),
        address: formData.get("address"),
        bloodGroup: formData.get("bloodGroup"),
        knownAllergies: formData.get("knownAllergies"),
    }

    const result = createPatientSchema.safeParse(raw)
    if (!result.success) return { error: result.error.issues[0].message }

    const d = result.data

    try {
        const assistant = await requireAssistant()

        const old = await prisma.patient.findUnique({ where: { id } })

        await prisma.$transaction(async (tx) => {
            await tx.profile.update({
                where: { id },
                data: { name: d.name }
            })

            await updatePatient(id, {
                phone: d.phone,
                email: d.email || null,
                dateOfBirth: d.dateOfBirth ? new Date(d.dateOfBirth) : null,
                gender: d.gender || null,
                address: d.address || null,
                bloodGroup: d.bloodGroup || null,
                knownAllergies: d.knownAllergies || null,
            })

            await tx.auditLog.create({
                data: {
                    userId: assistant.id,
                    action: "UPDATE_PATIENT",
                    entityType: "patient",
                    entityId: id,
                    oldValue: old as object,
                    newValue: d as object,
                }
            })
        })

    } catch (error) {
        return { error: getErrorMessage(error) }
    }



    redirect(`/assistant/patients/${id}`)
}