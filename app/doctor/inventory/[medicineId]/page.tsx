// Same as assistant batches page but no receive button
import { requireDoctor } from "@/lib/services/authService"
import { getMedicineBatches, getStockMovements } from "@/lib/services/inventoryService"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowDownCircle, ArrowUpCircle, RefreshCw } from "lucide-react"

type Props = { params: Promise<{ medicineId: string }> }

export default async function DoctorMedicineBatchesPage({ params }: Props) {
    await requireDoctor()

    const { medicineId } = await params
    const medicine = await prisma.medicine.findUnique({ where: { id: medicineId } })
    if (!medicine) notFound()

    const [batches, movements] = await Promise.all([
        getMedicineBatches(medicineId),
        getStockMovements(medicineId),
    ])

    const totalStock = batches.reduce((sum, b) => sum + b.quantity, 0)

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Link href="/doctor/inventory" className="text-gray-400 hover:text-gray-600 text-sm">
                ← Back to Inventory
            </Link>

            <div>
                <h1 className="text-2xl font-bold">{medicine.name}</h1>
                <p className="text-gray-500 text-sm">
                    {medicine.genericName} · {medicine.category} · Total: {totalStock} {medicine.unit}
                </p>
            </div>

            {/* Batches table */}
            <div className="bg-white rounded-lg border overflow-hidden">
                <div className="px-4 py-3 border-b bg-gray-50">
                    <h2 className="font-medium text-sm">
                        Active Batches
                        <span className="text-gray-400 font-normal ml-1">(FEFO order)</span>
                    </h2>
                </div>
                {batches.length === 0 ? (
                    <p className="text-center text-gray-400 py-8 text-sm">No batches in stock</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="border-b bg-gray-50">
                            <tr>
                                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Batch No.</th>
                                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Remaining</th>
                                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Expiry</th>
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
                                    <tr key={batch.id} className={isExpired ? "bg-red-50 text-red-400" : "hover:bg-gray-50"}>
                                        <td className="px-4 py-3 font-medium">{batch.batchNumber}</td>
                                        <td className="px-4 py-3">{batch.quantity} {medicine.unit}</td>
                                        <td className="px-4 py-3">
                                            <span className={isExpiringSoon ? "text-amber-600 font-medium" : ""}>
                                                {isExpired && "⚠ EXPIRED — "}
                                                {isExpiringSoon && "⚠ "}
                                                {new Date(batch.expiryDate).toLocaleDateString()}
                                            </span>
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

            {/* Movement history */}
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
                                    {m.type === "IN" && <ArrowDownCircle size={18} className="text-emerald-500" />}
                                    {m.type === "OUT" && <ArrowUpCircle size={18} className="text-red-400" />}
                                    {m.type === "ADJUSTMENT" && <RefreshCw size={18} className="text-blue-400" />}
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