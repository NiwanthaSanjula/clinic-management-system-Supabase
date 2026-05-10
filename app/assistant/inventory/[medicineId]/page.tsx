// Shows all batches for a specific medicine + stock movement history

import { prisma } from "@/lib/prisma"
import { requireAssistant } from "@/lib/services/authService"
import { getMedicineBatches, getStockMovements } from "@/lib/services/inventoryService"
import { ArrowDownCircle, ArrowUpCircle, RefreshCw } from "lucide-react"
import Link from "next/link"

import { notFound } from "next/navigation"

type Props = { params: Promise<{ medicineId: string }> }

export default async function MedicineBatchesPage({ params }: Props) {
    await requireAssistant()

    const { medicineId } = await params

    const medicine = await prisma.medicine.findUnique({
        where: { id: medicineId }
    })
    if (!medicine) notFound()

    const [batches, movements] = await Promise.all([
        getMedicineBatches(medicineId),
        getStockMovements(medicineId),
    ])

    const totalStock = batches.reduce((sum, b) => sum + b.quantity, 0)

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Link href="/assistant/inventory" className="text-gray-400 hover:text-gray-600 text-sm">
                    ← Back to Inventory
                </Link>
            </div>

            <div>
                <h1 className="text-2xl font-bold">{medicine.name}</h1>
                <p className="text-gray-500 text-sm">
                    {medicine.genericName} · {medicine.category} · Total: {totalStock} {medicine.unit}
                </p>
            </div>

            {/* Active batches — FEFO order */}
            <div className="bg-white rounded-lg border overflow-hidden">
                <div className="px-4 py-3 border-b bg-gray-50">
                    <h2 className="font-medium text-sm flex gap-2">
                        Active Batches
                        <span className="text-gray-400 font-normal ml-1"> (FEFO order — soonest expiry first)</span>
                    </h2>
                </div>

                {batches.length === 0 ? (
                    <p className="text-center text-gray-400 py-8 text-sm">No batches in stock</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="border-b bg-gray-50">
                            <tr>
                                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Batch No.</th>
                                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Qty Remaining</th>
                                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Expiry</th>
                                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Unit Cost</th>
                                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Received</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {batches.map(batch => {
                                const isExpired = new Date(batch.expiryDate) < new Date()
                                const thirtyDays = new Date()
                                thirtyDays.setDate(thirtyDays.getDate() + 30)
                                const isExpiringSoon = !isExpired && new Date(batch.expiryDate) <= thirtyDays

                                return (
                                    <tr
                                        key={batch.id}
                                        className={`${isExpired ? "bg-red-50 text-red-400" : "hover:bg-gray-50"}`}
                                    >
                                        <td className="px-4 py-3 font-medium">{batch.batchNumber}</td>
                                        <td className="px-4 py-3">
                                            {batch.quantity === 0 ? (
                                                <span className="text-gray-400">Empty</span>
                                            ) : (
                                                <span>{batch.quantity} {medicine.unit}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={isExpiringSoon ? "text-amber-600 font-medium" : ""}>
                                                {isExpired && "⚠ EXPIRED — "}
                                                {isExpiringSoon && "⚠ "}
                                                {new Date(batch.expiryDate).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            Rs. {batch.unitCost.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {new Date(batch.receivedDate).toLocaleDateString()}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>

                    </table>
                )}
            </div>

            {/* Stock movement history */}
            <div className="bg-white rounded-lg border overflow-hidden">
                <div className="px-4 py-3 border-b bg-gray-50">
                    <h2 className="font-medium text-sm">Movement History</h2>
                </div>

                {movements.length === 0 ? (
                    <p className="text-center text-gray-400 py-8 text-sm">No movements yet</p>
                ) : (
                    <div className="divide-y">
                        {movements.map(m => (
                            <div key={m.id} className="px-4 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {/* Movement type icon */}
                                    {m.type === "IN" && (
                                        <ArrowDownCircle size={18} className="text-emerald-500" />
                                    )}
                                    {m.type === "OUT" && (
                                        <ArrowUpCircle size={18} className="text-red-400" />
                                    )}
                                    {m.type === "ADJUSTMENT" && (
                                        <RefreshCw size={18} className="text-blue-400" />
                                    )}
                                    <div>
                                        <p className="text-sm font-medium">
                                            {m.type === "IN" ? "+" : "-"}{m.quantity} {medicine.unit}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {m.reason.replace(/_/g, " ")} · Batch: {m.batch.batchNumber}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400">
                                    {new Date(m.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    )

}