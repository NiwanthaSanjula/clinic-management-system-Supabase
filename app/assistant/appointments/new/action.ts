"use server"

import { createAppointment } from "@/lib/services/appointmentService"
import { requireAssistant } from "@/lib/services/authService"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import z from "zod"

const bookingSchema = z.object({
    patientId: z.string().min(1, "Please select a patient"),
    date: z.string().min(1, "Please select a date"),
    timeSlot: z.string().min(1, "Please select a time slot"),
    notes: z.string().optional(),
})

export async function bookingAppointmentAction(
    prevState: { error: string } | null,
    formData: FormData
) {
    const assistant = await requireAssistant()

    const raw = {
        patientId: formData.get("patientId"),
        date: formData.get("date"),
        timeSlot: formData.get("timeSlot"),
        notes: formData.get("notes"),
    }

    const result = bookingSchema.safeParse(raw)
    if (!result.success) {
        return { error: result.error.issues[0].message }
    }

    const d = result.data

    // Dont allow booking in the past
    const today = new Date().toISOString().split("T")[0]
    if (d.date < today) return { error: "Cannot book appointment in the past" }

    try {
        await createAppointment({
            patientId: d.patientId,
            date: d.date,
            timeSlot: d.timeSlot,
            type: "BOOKED",
            notes: d.notes,
            createdBy: assistant.id
        })
    } catch (e: any) {
        return { error: e.message }
    }

    revalidatePath("/assistant/appointments")
    redirect("/assistant/appointments")
}