"use server"

import { requireAssistant } from "@/lib/services/authService"
import { receiveBatch } from "@/lib/services/inventoryService"
import { ActionState, getErrorMessage } from "@/lib/utils/actionError"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import z from "zod"

const receiveBatchSchema = z.object({
    medicineId: z.string().min(1, "Please select a medicine"),
    batchNumber: z.string().min(1, "Batch number is required"),
    quantity: z.string().min(1).transform(Number),
    unitCost: z.string().min(1).transform(Number),
    expiryDate: z.string().min(1, "Expiry date is required").transform((str) => new Date(str)),
    notes: z.string().optional(),
})

export async function receiveBatchAction(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const result = receiveBatchSchema.safeParse({
        medicineId: formData.get("medicineId"),
        batchNumber: formData.get("batchNumber"),
        quantity: formData.get("quantity"),
        unitCost: formData.get("unitCost"),
        expiryDate: formData.get("expiryDate"),
        notes: formData.get("notes"),
    })

    if (!result.success) {
        return { error: result.error.issues[0].message }
    }

    const d = result.data

    try {
        const assistant = await requireAssistant()

        await receiveBatch({
            medicineId: d.medicineId,
            batchNumber: d.batchNumber,
            quantity: d.quantity,
            unitCost: d.unitCost,
            expiryDate: d.expiryDate,
            notes: d.notes,
            receivedBy: assistant.id
        })

        revalidatePath("/assistant/inventory")

    } catch (error) {
        return { error: getErrorMessage(error) }
    }

    redirect("/assistant/inventory")

}