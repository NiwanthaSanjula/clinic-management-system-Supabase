// Shows all batches for a specific medicine + stock movement history

import { prisma } from "@/lib/prisma"
import { requireAssistant } from "@/lib/services/authService"
import { getMedicineBatches, getStockMovements } from "@/lib/services/inventoryService"
import { ArrowDownCircle, ArrowUpCircle, RefreshCw, ArrowLeft, Package, Activity } from "lucide-react"
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
        <div className="min-h-screen bg-slate-50/60">
            <div className="max-w-sm md:max-w-3xl mx-auto px-4 py-6 space-y-5">

                {/*--- Top nav ---*/}
                <div>
                    <Link
                        href="/assistant/inventory"
                        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors group"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                        Back to Inventory
                    </Link>
                </div>

                {/*---- Medicine header card ----*/}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex items-start gap-4 px-6 py-5">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                            <Package size={20} className="text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg font-semibold text-slate-800 leading-tight">{medicine.name}</h1>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                <span className="text-xs text-slate-400">{medicine.genericName}</span>
                                <span className="text-slate-200">·</span>
                                <span className="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-0.5">
                                    {medicine.category}
                                </span>
                            </div>
                        </div>
                        {/* Total stock badge */}
                        <div className="shrink-0 text-right">
                            <p className="text-2xl font-bold text-slate-800 leading-none">{totalStock}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{medicine.unit} in stock</p>
                        </div>
                    </div>
                </div>

                {/*--- Active Batches --- */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/70">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <Package size={14} className="text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-slate-800">Active Batches</h2>
                            <p className="text-xs text-slate-400">FEFO order — soonest expiry first</p>
                        </div>
                    </div>

                    {batches.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                <Package size={17} className="text-slate-300" />
                            </div>
                            <p className="text-sm font-medium text-slate-400">No batches in stock</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto px-6">
                            <table className="w-full text-sm ">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Batch No.</th>
                                        <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Qty Remaining</th>
                                        <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expiry</th>
                                        <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unit Cost</th>
                                        <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Received</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {batches.map(batch => {
                                        const isExpired = new Date(batch.expiryDate) < new Date()
                                        const thirtyDays = new Date()
                                        thirtyDays.setDate(thirtyDays.getDate() + 30)
                                        const isExpiringSoon = !isExpired && new Date(batch.expiryDate) <= thirtyDays

                                        return (
                                            <tr
                                                key={batch.id}
                                                className={`transition-colors ${isExpired
                                                    ? "bg-red-50/60"
                                                    : "hover:bg-slate-50/80"
                                                    }`}
                                            >
                                                <td className="px-5 py-3.5">
                                                    <span className={`font-mono text-xs font-semibold px-2 py-1 rounded-md ${isExpired
                                                        ? "bg-red-100 text-red-500"
                                                        : "bg-slate-100 text-slate-600"
                                                        }`}>
                                                        {batch.batchNumber}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    {batch.quantity === 0 ? (
                                                        <span className="text-xs text-slate-300 font-medium">Empty</span>
                                                    ) : (
                                                        <span className={`font-semibold ${isExpired ? "text-red-400" : "text-slate-700"}`}>
                                                            {batch.quantity}
                                                            <span className="ml-1 font-normal text-slate-400">{medicine.unit}</span>
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    {isExpired ? (
                                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50 border border-red-100 rounded-full px-2.5 py-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                                                            Expired · {new Date(batch.expiryDate).toLocaleDateString()}
                                                        </span>
                                                    ) : isExpiringSoon ? (
                                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                                                            {new Date(batch.expiryDate).toLocaleDateString()}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-slate-500">
                                                            {new Date(batch.expiryDate).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 text-sm text-slate-500">
                                                    Rs. {batch.unitCost.toFixed(2)}
                                                </td>
                                                <td className="px-5 py-3.5 text-sm text-slate-400">
                                                    {new Date(batch.receivedDate).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/*---- Movement History -----*/}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/70">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Activity size={14} className="text-slate-500" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-slate-800">Movement History</h2>
                            <p className="text-xs text-slate-400">All stock changes for this medicine</p>
                        </div>
                    </div>

                    {movements.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                <Activity size={17} className="text-slate-300" />
                            </div>
                            <p className="text-sm font-medium text-slate-400">No movements yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {movements.map(m => (
                                <div
                                    key={m.id}
                                    className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/70 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Movement type icon */}
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${m.type === "IN"
                                            ? "bg-emerald-50"
                                            : m.type === "OUT"
                                                ? "bg-red-50"
                                                : "bg-blue-50"
                                            }`}>
                                            {m.type === "IN" && <ArrowDownCircle size={15} className="text-emerald-500" />}
                                            {m.type === "OUT" && <ArrowUpCircle size={15} className="text-red-400" />}
                                            {m.type === "ADJUSTMENT" && <RefreshCw size={15} className="text-blue-400" />}
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold text-slate-700">
                                                <span className={m.type === "IN" ? "text-emerald-600" : "text-red-500"}>
                                                    {m.type === "IN" ? "+" : "−"}{m.quantity}
                                                </span>
                                                <span className="text-slate-400 font-normal ml-1">{medicine.unit}</span>
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="text-xs text-slate-400">
                                                    {m.reason.replace(/_/g, " ")}
                                                </span>
                                                <span className="text-slate-200">·</span>
                                                <span className="font-mono text-[10px] text-slate-300 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">
                                                    {m.batch.batchNumber}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <span className="text-xs text-slate-300 shrink-0">
                                        {new Date(m.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}