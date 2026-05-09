// app/assistant/billing/page.tsx
// Shows all unpaid invoices
// Assistant marks them as paid after collecting payment

import { requireAssistant } from "@/lib/services/authService";
import { getUnpaidInvoices } from "@/lib/services/billingService";
import { CreditCard, Receipt } from "lucide-react";
import InvoiceCard from "./InvoiceCard";

export default async function BillingPage() {

    await requireAssistant()
    const invoices = await getUnpaidInvoices()


    return (
        <div className="space-y-4 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3">
                <CreditCard size={40} className="text-emerald-500" />
                <div>
                    <h1 className="text-2xl font-bold">Billing</h1>
                    <p className="text-gray-500 text-sm">
                        {invoices.length} unpaid invoice{invoices.length !== 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            {invoices.length === 0 ? (
                <div className="bg-white rounded-lg border p-12 text-center text-gray-400">
                    <Receipt size={32} className="mx-auto mb-3 opacity-30" />
                    <p>No unpaid invoices</p>
                    <p className="text-xs mt-1">
                        Invoices appear here when appointments are completed
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {invoices.map(invoice => (
                        <InvoiceCard key={invoice.id} invoice={invoice} />
                    ))}
                </div>
            )}

        </div>
    )
}