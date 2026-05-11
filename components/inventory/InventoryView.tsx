// components/inventory/InventoryView.tsx
// Shared between assistant and doctor inventory pages
// role controls what actions are visible
"use client"

import { useState } from "react"
import Link from "next/link"
import {
    Package, PackagePlus, AlertTriangle,
    TrendingDown, Clock, Plus
} from "lucide-react"
import AddMedicineModal from "./AddMedicineModal"

type StockLevel = {
    id: string
    name: string
    genericName: string
    category: string
    unit: string
    price: number
    totalStock: number
    nearestExpiry: Date | null
    isExpiringSoon: boolean
    isLowStock: boolean
    isOutOfStock: boolean
}

type Props = {
    stockLevels: StockLevel[]
    role: "ASSISTANT" | "DOCTOR"
    // Base path changes per role
    basePath: string
}

export default function InventoryView({ stockLevels, role, basePath }: Props) {
    const [showAddMedicine, setShowAddMedicine] = useState(false)
    const isAssistant = role === "ASSISTANT"

    // Stats
    const outOfStock = stockLevels.filter(m => m.isOutOfStock).length
    const lowStock = stockLevels.filter(m => m.isLowStock).length
    const expiringSoon = stockLevels.filter(m => m.isExpiringSoon && !m.isOutOfStock).length
    const healthy = stockLevels.filter(
        m => !m.isOutOfStock && !m.isLowStock && !m.isExpiringSoon
    ).length

    return (
        <div className="space-y-4 max-w-sm md:max-w-7xl">

            {/* Add medicine modal — assistant only */}
            {isAssistant && (
                <AddMedicineModal
                    open={showAddMedicine}
                    onClose={() => setShowAddMedicine(false)}
                />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
                <div className="flex items-center gap-3">
                    <Package size={40} className="text-emerald-500" />
                    <div>
                        <h1 className="text-2xl font-bold">Inventory</h1>
                        <p className="text-gray-500 text-sm">
                            {stockLevels.length} medicines tracked
                        </p>
                    </div>
                </div>

                {/* Action buttons — assistant only */}
                {isAssistant && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowAddMedicine(true)}
                            className="flex items-center gap-2 border border-blue-300 text-blue-600
                                hover:bg-blue-50 px-4 py-2 rounded-md text-sm font-medium"
                        >
                            <Plus size={15} />
                            New Medicine
                        </button>
                        <Link
                            href="/assistant/inventory/receive"
                            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600
                                text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                            <PackagePlus size={15} />
                            Receive Stock
                        </Link>
                    </div>
                )}
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <StatCard
                    label="Out of Stock"
                    value={outOfStock}
                    icon={<Package size={84} />}
                    color={outOfStock > 0 ? "red" : "gray"}
                />
                <StatCard
                    label="Low Stock"
                    value={lowStock}
                    icon={<TrendingDown size={84} />}
                    color={lowStock > 0 ? "amber" : "gray"}
                />
                <StatCard
                    label="Expiring Soon"
                    value={expiringSoon}
                    icon={<Clock size={84} />}
                    color={expiringSoon > 0 ? "orange" : "gray"}
                />
                <StatCard
                    label="Healthy Stock"
                    value={healthy}
                    icon={<Package size={84} />}
                    color="green"
                />
            </div>

            {/* Alert banner — only if issues */}
            {/*(outOfStock > 0 || lowStock > 0 || expiringSoon > 0) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
                    <div className="text-sm space-y-1">
                        <p className="font-bold text-red-700">Stock Alerts</p>
                        {outOfStock > 0 && (
                            <p className="text-red-600">
                                {outOfStock} medicine{outOfStock !== 1 ? "s" : ""} out of stock
                            </p>
                        )}
                        {lowStock > 0 && (
                            <p className="text-red-600">
                                {lowStock} medicine{lowStock !== 1 ? "s" : ""} running low (under 20 units)
                            </p>
                        )}
                        {expiringSoon > 0 && (
                            <p className="text-amber-600">
                                {expiringSoon} medicine{expiringSoon !== 1 ? "s" : ""} expiring within 30 days
                            </p>
                        )}
                    </div>
                </div>
            )*/}

            {/* Stock table */}
            <div className="bg-white rounded-lg border overflow-x-scroll shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-blue-500">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium text-white">Medicine</th>
                            <th className="text-left px-4 py-3 font-medium text-white">Category</th>
                            <th className="text-left px-4 py-3 font-medium text-white">Stock</th>
                            <th className="text-left px-4 py-3 font-medium text-white">Nearest Expiry</th>
                            <th className="text-left px-4 py-3 font-medium text-white">Price</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {stockLevels.map(med => (
                            <tr
                                key={med.id}
                                className={`hover:bg-gray-50 ${med.isOutOfStock ? "bg-red-50/50" : ""}`}
                            >
                                <td className="px-4 py-3">
                                    <p className="font-medium">{med.name}</p>
                                    <p className="text-xs text-gray-400">{med.genericName}</p>
                                </td>

                                <td className="px-4 py-3 text-gray-500 text-xs">{med.category}</td>

                                <td className="px-4 py-3">
                                    <StockBadge
                                        total={med.totalStock}
                                        unit={med.unit}
                                        isLow={med.isLowStock}
                                        isOut={med.isOutOfStock}
                                    />
                                </td>

                                <td className="px-4 py-3">
                                    {med.nearestExpiry ? (
                                        <span className={`text-xs ${med.isExpiringSoon
                                            ? "text-amber-600 font-medium"
                                            : "text-gray-500"
                                            }`}>
                                            {med.isExpiringSoon && "⚠ "}
                                            {new Date(med.nearestExpiry).toLocaleDateString()}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 text-xs">No stock</span>
                                    )}
                                </td>

                                <td className="px-4 py-3 text-gray-500 text-xs">
                                    Rs. {med.price.toFixed(2)}
                                </td>

                                <td className="px-4 py-3">
                                    <Link
                                        href={`${basePath}/${med.id}`}
                                        className="text-blue-500 hover:underline text-xs"
                                    >
                                        Batches →
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

//--- Small helper components ---

function StatCard({ label, value, icon, color }: {
    label: string
    value: number
    icon: React.ReactNode
    color: "red" | "amber" | "orange" | "green" | "gray"
}) {
    const colors = {
        red: "bg-red-500 text-white border-red-100 border-l-2 border-l-red-500",
        amber: "bg-amber-500 text-white border-amber-100 border-l-2 border-l-amber-500",
        orange: "bg-orange-500 text-white border-orange-100 border-l-2 border-l-orange-500",
        green: "bg-emerald-500 text-white border-emerald-100 border-l-2 border-l-emerald-500",
        gray: "bg-gray-500 text-white border-gray-100 border-l-2 border-l-gray-500",
    }

    return (
        <div className={`relative rounded-lg border p-4 ${colors[color]}`}>
            <div className="flex items-center justify-between mb-1">
                <span className=" font-medium">{label}</span>
                <div className="flex items-center gap-2 absolute -right-2 -top-2 opacity-45">
                    {icon}
                </div>
            </div>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    )
}

function StockBadge({ total, unit, isLow, isOut }: {
    total: number
    unit: string
    isLow: boolean
    isOut: boolean
}) {
    if (isOut) return (
        <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
            Out of stock
        </span>
    )
    if (isLow) return (
        <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
            Low — {total} {unit}
        </span>
    )
    return <span className="text-xs text-gray-600">{total} {unit}</span>
}