// action.ts
"use server"

import { requirePatient } from "@/lib/services/authService"
import { prisma } from "@/lib/prisma"
import { ActionState, getErrorMessage } from "@/lib/utils/actionError"
import { revalidatePath } from "next/cache"
import z from "zod"

const profileSchema = z.object({
    phone: z.string().min(10, "Invalid phone").max(10, "Invalid phone"),
    address: z.string().optional(),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
})

export async function updatePortalProfileAction(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const result = profileSchema.safeParse({
        phone: formData.get("phone"),
        address: formData.get("address"),
        email: formData.get("email"),
    })

    if (!result.success) return { error: result.error.issues[0].message }

    try {
        const profile = await requirePatient()

        await prisma.patient.update({
            where: { id: profile.id },
            data: {
                phone: result.data.phone,
                address: result.data.address || null,
                email: result.data.email || null,
            }
        })

        revalidatePath("/portal/profile")

    } catch (error) {
        return { error: getErrorMessage(error) }
    }

    return null
}