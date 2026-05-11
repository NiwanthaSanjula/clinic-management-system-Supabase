// action.ts
"use server"

import { prisma } from "@/lib/prisma"
import { requireDoctor } from "@/lib/services/authService"
import { ActionState, getErrorMessage } from "@/lib/utils/actionError"
import { revalidatePath } from "next/cache"
import z from "zod"

const settingsSchema = z.object({
    clinicName: z.string().min(1, "Clinic name is required"),
    openTime: z.string().min(1, "Open time is required"),
    closeTime: z.string().min(1, "Close time is required"),
    slotDuration: z.string().transform(Number),
    lunchStart: z.string().min(1),
    lunchEnd: z.string().min(1),
    consultFee: z.string().transform(Number),
})

export async function updateSettingsAction(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const result = settingsSchema.safeParse({
        clinicName: formData.get("clinicName"),
        openTime: formData.get("openTime"),
        closeTime: formData.get("closeTime"),
        slotDuration: formData.get("slotDuration"),
        lunchStart: formData.get("lunchStart"),
        lunchEnd: formData.get("lunchEnd"),
        consultFee: formData.get("consultFee"),
    })

    if (!result.success) return { error: result.error.issues[0].message }

    try {
        await requireDoctor()

        const existing = await prisma.clinicSettings.findFirst()

        if (existing) {
            await prisma.clinicSettings.update({
                where: { id: existing.id },
                data: result.data,
            })
        } else {
            await prisma.clinicSettings.create({ data: result.data })
        }

        revalidatePath("/doctor/settings")
        revalidatePath("/assistant/appointments")

    } catch (error) {
        return { error: getErrorMessage(error) }
    }

    return null
}