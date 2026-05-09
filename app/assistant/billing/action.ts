// app/assistant/billing/action.ts
"use server"

import { requireAssistant } from "@/lib/services/authService"
import { markInvoicePaid } from "@/lib/services/billingService"
import { getErrorMessage } from "@/lib/utils/actionError"
import { revalidatePath } from "next/cache"

export async function markPaidAction(
    invoiceId: string,
    paymentMethod: "CASH" | "CARD"
) {
    try {
        await requireAssistant()
        await markInvoicePaid(invoiceId, paymentMethod)
        revalidatePath("/assistant/billing")

    } catch (error) {
        return { error: getErrorMessage(error) }
    }
    return null
}