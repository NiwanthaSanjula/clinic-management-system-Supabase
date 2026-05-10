// addMedicineAction.ts
// Creates a brand new medicine in the master list
"use server"

import { prisma } from "@/lib/prisma"
import { requireAssistant } from "@/lib/services/authService"
import { ActionState, getErrorMessage } from "@/lib/utils/actionError"
import { revalidatePath } from "next/cache"
import z from "zod"

const addMedicineSchema = z.object({
    name: z.string().min(1, "Medicine name is required"),
    genericName: z.string().min(1, "Generic name is required"),
    category: z.string().min(1, "Category is required"),
    unit: z.string().min(1, "Unit is required"),
    defaultDosage: z.string().optional(),
    price: z.string().min(1, "Price is required").transform(Number),
})
export async function addMedicineAction(
    formData: FormData
): Promise<{ success: boolean; error?: string }> {
    const result = addMedicineSchema.safeParse({
        name: formData.get("name"),
        genericName: formData.get("genericName"),
        category: formData.get("category"),
        unit: formData.get("unit"),
        defaultDosage: formData.get("defaultDosage"),
        price: formData.get("price"),
    })

    if (!result.success) {
        return { success: false, error: result.error.issues[0].message }
    }

    const d = result.data

    try {
        await requireAssistant()

        // Check duplicate
        const existing = await prisma.medicine.findFirst({
            where: {
                name: { equals: d.name, mode: "insensitive" },
                genericName: { equals: d.genericName, mode: "insensitive" }
            }
        })

        if (existing) {
            return { success: false, error: "This medicine already exists" }
        }

        await prisma.medicine.create({
            data: {
                name: d.name,
                genericName: d.genericName,
                category: d.category,
                unit: d.unit,
                defaultDosage: d.defaultDosage || null,
                price: d.price,
            }
        })

        revalidatePath("/assistant/inventory")
        revalidatePath("/doctor/inventory")
        return { success: true }


    } catch (error) {
        return { success: false, error: getErrorMessage(error) }

    }
}