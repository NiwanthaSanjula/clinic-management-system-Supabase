// action.ts
"use server"

import { requirePatient } from "@/lib/services/authService"
import { createPortalAppointment } from "@/lib/services/appointmentService"
import { ActionState, getErrorMessage } from "@/lib/utils/actionError"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import z from "zod"

const bookingSchema = z.object({
    date: z.string().min(1, "Please select a date"),
    timeSlot: z.string().min(1, "Please select a time slot"),
    notes: z.string().optional(),
})

export async function portalBookAppointmentAction(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const result = bookingSchema.safeParse({
        date: formData.get("date"),
        timeSlot: formData.get("timeSlot"),
        notes: formData.get("notes"),
    })

    if (!result.success) {
        return { error: result.error.issues[0].message }
    }

    const d = result.data
    const today = new Date().toISOString().split("T")[0]
    if (d.date < today) return { error: "Cannot book in the past" }

    try {
        const profile = await requirePatient()

        await createPortalAppointment({
            patientId: profile.id,
            date: d.date,
            timeSlot: d.timeSlot,
            notes: d.notes,
        })

        revalidatePath("/portal/appointments")

    } catch (error) {
        return { error: getErrorMessage(error) }
    }

    redirect("/portal/appointments")
}