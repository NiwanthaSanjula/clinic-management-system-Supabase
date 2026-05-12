// app/assistant/appointments/walkin/action.ts
"use server"

import { addWalkIn } from "@/lib/services/appointmentService"
import { requireAssistant } from "@/lib/services/authService"
import { ActionState, getErrorMessage } from "@/lib/utils/actionError"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import z from "zod"

const walkInSchema = z.object({
    patientId: z.string().min(1, "Please select a patient"),
    notes: z.string().optional(),
})

export async function addWalkInAction(
    prevState: { error: string } | null,
    formData: FormData
): Promise<ActionState> {

    const result = walkInSchema.safeParse({
        patientId: formData.get("patientId"),
        notes: formData.get("notes"),
    })

    if (!result.success) return { error: result.error.issues[0].message }

    try {

        const assistant = await requireAssistant()

        await addWalkIn({
            patientId: result.data.patientId,
            notes: result.data.notes,
            createdBy: assistant.id,
        })

    } catch (error) {
        return { error: getErrorMessage(error) }
    }

    revalidatePath("/assistant/appointments")
    redirect("/assistant/appointments")
}