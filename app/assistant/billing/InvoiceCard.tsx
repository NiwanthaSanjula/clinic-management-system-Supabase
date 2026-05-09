// app/assistant/billing/InvoiceCard.tsx
// Shows one invoice with line items + payment buttons

"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { markPaidAction } from "./action"
import { Banknote, Calendar, CreditCard, User } from "lucide-react"

type InvoiceItem = {
    id: string
    description: string
    quantity: number
    unitPrice: number
    total: number
}

type Invoice = {
    id: string
    consultationFee: number
    medicineTotal: number
    totalAmount: number
    status: string
    createdAt: Date
    patient: { profile: { name: string }; nic: string }
    appointment: { date: string; timeSlot: string | null }
    items: InvoiceItem[]
}

type Props = { invoice: Invoice }

export default function InvoiceCard({ invoice }: Props) {

    const router = useRouter()
    const [pending, startTransition] = useTransition()

    function handlePay(method: "CASH" | "CARD") {
        startTransition(async () => {
            await markPaidAction(invoice.id, method)
            router.refresh()
        })
    }

    return (
        <div className="bg-white rounded-lg border overflow-hidden shadow-sm">

            {/* Invoice header */}
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                        <User size={16} className="text-emerald-600" />
                    </div>
                    <div>
                        <p className="font-medium text-sm">{invoice.patient.profile.name}</p>
                        <p className="text-xs text-gray-400">NIC: {invoice.patient.nic}</p>
                    </div>
                </div>

                <div className="text-right text-sm text-gray-500 flex items-center gap-1">
                    <Calendar size={13} />
                    <span>{invoice.appointment.date}</span>
                    {invoice.appointment.timeSlot && (
                        <span className="text-gray-400">· {invoice.appointment.timeSlot}</span>
                    )}
                </div>
            </div>

            {/** Line Items */}
            <div className="divide-y">
                {invoice.items.map(item => (
                    <div
                        key={item.id}
                        className="px-4 py-3 flex items-center justify-between text-sm"
                    >
                        <span className="text-gray-700">{item.description}</span>
                        <span className="font-medium">
                            Rs. {item.total.toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Total + payment buttons */}
            <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
                <div>
                    <p className="text-xs text-gray-400">Total Amount</p>
                    <p className="text-2xl font-bold text-emerald-600">
                        Rs. {invoice.totalAmount.toFixed(2)}
                    </p>
                </div>

                {/* Payment method buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => handlePay("CASH")}
                        disabled={pending}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600
                            text-white px-4 py-2 rounded-md text-sm font-medium
                            disabled:opacity-50 transition-colors"
                    >
                        <Banknote size={15} />
                        Cash
                    </button>
                    <button
                        onClick={() => handlePay("CARD")}
                        disabled={pending}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600
                            text-white px-4 py-2 rounded-md text-sm font-medium
                            disabled:opacity-50 transition-colors"
                    >
                        <CreditCard size={15} />
                        Card
                    </button>
                </div>

            </div>



        </div>
    )

}