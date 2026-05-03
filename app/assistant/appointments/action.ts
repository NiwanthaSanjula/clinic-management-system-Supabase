"use server"

import { updateAppointmentStatus } from "@/lib/services/appointmentService"
import { requireAssistant } from "@/lib/services/authService"
import { revalidatePath } from "next/cache"

export async function updateStatusAction(
    appointmentId: string,
    newStatus: string
) {
    try {
        await requireAssistant()

        await updateAppointmentStatus(
            appointmentId,
            newStatus as "WAITING" | "IN_CONSULTATION" | "COMPLETED" | "CANCELLED"
        )
        revalidatePath("/assistant/appointments")

        return { success: true }
    } catch (error) {
        console.error("Update status error:", error)
        return { error: "Failed to update status" }
    }
}