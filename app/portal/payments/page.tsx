// app/(portal)/portal/payments/page.tsx
// Patient views their invoice + payment history
// Server component — no client needed

import { requirePatient } from "@/lib/services/authService"
import { getPatientInvoices } from "@/lib/services/billingService"
import Link from "next/link"
import { CreditCard, Receipt, CheckCircle, Clock } from "lucide-react"

const STATUS_CONFIG = {
    UNPAID: {
        label: "Unpaid",
        color: "bg-red-50 text-red-700 border-red-200",
        icon: <Clock size={12} />
    },
    PAID: {
        label: "Paid",
        color: "bg-green-50 text-green-700 border-green-200",
        icon: <CheckCircle size={12} />
    },
    WAIVED: {
        label: "Waived",
        color: "bg-gray-50 text-gray-600 border-gray-200",
        icon: <CheckCircle size={12} />
    },
}

export default async function PortalPaymentsPage() {
    const profile = await requirePatient()
    const invoices = await getPatientInvoices(profile.id)

    const totalPaid = invoices
        .filter(i => i.status === "PAID")
        .reduce((sum, i) => sum + i.totalAmount, 0)

    const unpaidCount = invoices.filter(i => i.status === "UNPAID").length

    return (
        <div className="space-y-4">

            {/* Header */}
            <div className="flex flex-col gap-1">
                <Link href="/portal/dashboard"
                    className="text-gray-400 hover:text-gray-600 text-sm">
                    ← Back
                </Link>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                        <CreditCard size={22} className="text-amber-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">My Payments</h1>
                        <p className="text-gray-500 text-sm">
                            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
            </div>

            {/* Summary cards */}
            {invoices.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                        <p className="text-xs font-medium text-emerald-600 mb-1">Total Paid</p>
                        <p className="text-2xl font-bold text-emerald-700">
                            Rs. {totalPaid.toFixed(0)}
                        </p>
                    </div>
                    <div className={`border rounded-lg p-4 ${unpaidCount > 0
                        ? "bg-red-50 border-red-100"
                        : "bg-gray-50 border-gray-100"
                        }`}>
                        <p className={`text-xs font-medium mb-1 ${unpaidCount > 0
                            ? "text-red-600"
                            : "text-gray-400"
                            }`}>
                            Pending
                        </p>
                        <p className={`text-2xl font-bold ${unpaidCount > 0
                            ? "text-red-600"
                            : "text-gray-400"
                            }`}>
                            {unpaidCount} invoice{unpaidCount !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {invoices.length === 0 && (
                <div className="bg-white rounded-lg border p-12 text-center text-gray-400">
                    <Receipt size={32} className="mx-auto mb-3 opacity-30" />
                    <p>No invoices yet</p>
                    <p className="text-xs mt-1">
                        Invoices appear here after your visits
                    </p>
                </div>
            )}

            {/* Invoice list */}
            <div className="space-y-4">
                {invoices.map(invoice => {
                    const status = STATUS_CONFIG[
                        invoice.status as keyof typeof STATUS_CONFIG
                    ]

                    return (
                        <div key={invoice.id}
                            className="bg-white rounded-lg border overflow-hidden">

                            {/* Card header */}
                            <div className="p-4 border-b bg-gray-50 flex items-center
                                justify-between">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-medium">
                                        {new Date(invoice.appointment.date)
                                            .toLocaleDateString("en-GB", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric"
                                            })}
                                    </span>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full border
                                    font-medium flex items-center gap-1 ${status.color}`}>
                                    {status.icon}
                                    {status.label}
                                </span>
                            </div>

                            {/* Line items */}
                            <div className="divide-y">
                                {invoice.items.map(item => (
                                    <div key={item.id}
                                        className="px-4 py-3 flex items-center
                                            justify-between text-sm">
                                        <span className="text-gray-600">
                                            {item.description}
                                        </span>
                                        <span className="font-medium">
                                            Rs. {item.total.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Total */}
                            <div className="px-4 py-3 border-t flex items-center
                                justify-between">
                                <span className="font-semibold text-sm">Total</span>
                                <span className="font-bold text-lg text-emerald-600">
                                    Rs. {invoice.totalAmount.toFixed(2)}
                                </span>
                            </div>

                            {/* Payment info */}
                            {invoice.status === "PAID" && invoice.paidAt && (
                                <div className="px-4 py-2 bg-emerald-50 border-t
                                    text-xs text-emerald-700 flex items-center gap-1">
                                    <CheckCircle size={11} />
                                    Paid via {invoice.paymentMethod?.toLowerCase()} ·{" "}
                                    {new Date(invoice.paidAt).toLocaleDateString("en-GB", {
                                        day: "numeric", month: "short", year: "numeric"
                                    })}
                                </div>
                            )}

                            {/* Unpaid notice */}
                            {invoice.status === "UNPAID" && (
                                <div className="px-4 py-2 bg-red-50 border-t
                                    text-xs text-red-600">
                                    Please pay at the clinic reception
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}