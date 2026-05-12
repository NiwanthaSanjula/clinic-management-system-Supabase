// action.ts
"use server"

import { requirePatient } from "@/lib/services/authService"
import { prisma } from "@/lib/prisma"
import { getErrorMessage } from "@/lib/utils/actionError"
import { revalidatePath } from "next/cache"

export async function cancelAppointmentAction(appointmentId: string) {
    try {
        const profile = await requirePatient()

        // Find appointment and verify it belongs to this patient
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId }
        })

        if (!appointment) return { error: "Appointment not found" }

        // Security — patient can only cancel their own
        if (appointment.patientId !== profile.id) {
            return { error: "Not authorised" }
        }

        // Can only cancel SCHEDULED appointments
        if (appointment.status !== "SCHEDULED") {
            return { error: "This appointment cannot be cancelled" }
        }

        await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: "CANCELLED" }
        })

        revalidatePath("/portal/appointments")
        return null

    } catch (error) {
        return { error: getErrorMessage(error) }
    }
}