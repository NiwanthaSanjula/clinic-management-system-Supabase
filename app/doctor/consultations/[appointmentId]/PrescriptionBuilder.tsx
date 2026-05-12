"use client"


import { Input } from "@/components/ui/input"
import { Plus, Trash2, Sparkles, Loader2 } from "lucide-react"
import { useState } from "react"

type Medicine = {
    id: string
    name: string
    genericName: string
    category: string
    unit: string
    defaultDosage: string | null
}

type PrescriptionRow = {
    localId: number
    medicineId: string
    dosage: string
    frequency: string
    duration: string
    quantity: number
    instructions: string
}

type Props = {
    medicines: Medicine[]
    initialItems?: PrescriptionRow[]
}

const FREQUENCIES = [
    "Once daily",
    "Twice daily",
    "3 times daily",
    "4 times daily",
    "Every 8 hours",
    "Every 6 hours",
    "At night",
    "As needed",
]

let localIdCounter = 0

export default function PrescriptionBuilder({ medicines, initialItems = [] }: Props) {
    const [rows, setRows] = useState<PrescriptionRow[]>(initialItems)
    const [aiLoading, setAiLoading] = useState(false)
    const [aiError, setAiError] = useState<string | null>(null)

    const byCategory = medicines.reduce((acc, med) => {
        if (!acc[med.category]) acc[med.category] = []
        acc[med.category].push(med)
        return acc
    }, {} as Record<string, Medicine[]>)

    function addRow() {
        setRows(prev => [...prev, {
            localId: localIdCounter++,
            medicineId: "",
            dosage: "",
            frequency: "Twice daily",
            duration: "5 days",
            quantity: 10,
            instructions: ""
        }])
    }

    function removeRow(localId: number) {
        setRows(prev => prev.filter(r => r.localId !== localId))
    }

    function updateRow(localId: number, field: keyof PrescriptionRow, value: string | number) {
        setRows(prev => prev.map(r =>
            r.localId === localId ? { ...r, [field]: value } : r
        ))
    }

    function handleMedicineChange(localId: number, medicineId: string) {
        const medicine = medicines.find(m => m.id === medicineId)
        setRows(prev => prev.map(r =>
            r.localId === localId ? {
                ...r,
                medicineId,
                dosage: medicine?.defaultDosage ?? ""
            } : r
        ))
    }

    async function handleAISuggest() {
        // Get diagnosis from the parent form
        // Read it from the DOM since it's in a sibling input
        const diagnosisInput = document.querySelector(
            'input[name="diagnosis"]'
        ) as HTMLInputElement
        const diagnosis = diagnosisInput?.value?.trim()

        if (!diagnosis) {
            setAiError("Please fill in the diagnosis field first")
            return
        }

        setAiLoading(true)
        setAiError(null)

        try {
            const res = await fetch("/api/ai/prescriptions/suggest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ diagnosis }),
            })

            const data = await res.json()

            if (!res.ok) {
                setAiError(data.error ?? "AI suggestion failed")
                return
            }

            if (data.items.length === 0) {
                setAiError("No suitable medicines found for this diagnosis")
                return
            }

            // Map AI response to PrescriptionRow format
            const newRows: PrescriptionRow[] = data.items.map((item: any) => ({
                localId: localIdCounter++,
                medicineId: item.medicineId,
                dosage: item.dosage,
                frequency: item.frequency,
                duration: item.duration,
                quantity: item.quantity,
                instructions: item.instructions,
            }))

            // Replace current rows with AI suggestion
            // Doctor can still add/remove/edit after
            setRows(newRows)

        } catch (error) {
            setAiError("Something went wrong. Please try again.")
        } finally {
            setAiLoading(false)
        }
    }

    return (
        <div className="space-y-3">
            {rows.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed border-slate-200 bg-slate-50/60">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                        <Plus size={18} className="text-emerald-500" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium">No medicines added yet</p>
                    <p className="text-xs text-slate-300 mt-0.5">Click "+ Add Medicine" below to begin</p>
                </div>
            )}

            {rows.map((row, index) => (
                <div
                    key={row.localId}
                    className="relative rounded-xl border border-slate-200 bg-white overflow-hidden transition-shadow hover:shadow-sm"
                >
                    {/* Accent bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400 rounded-l-xl" />

                    <div className="pl-5 pr-4 pt-4 pb-4 space-y-3">
                        <input type="hidden" name={`items[${index}][medicineId]`} value={row.medicineId} />

                        {/* Row header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold tracking-wide">
                                    {index + 1}
                                </span>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Medicine
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeRow(row.localId)}
                                className="flex items-center gap-1 text-xs text-slate-300 hover:text-red-400 transition-colors group"
                            >
                                <Trash2 size={13} className="group-hover:scale-110 transition-transform" />
                                <span>Remove</span>
                            </button>
                        </div>

                        {/* Medicine selector */}
                        <select
                            value={row.medicineId}
                            onChange={e => handleMedicineChange(row.localId, e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all"
                            required
                        >
                            <option value="">Select medicine...</option>
                            {Object.entries(byCategory).map(([category, meds]) => (
                                <optgroup key={category} label={category}>
                                    {meds.map(med => (
                                        <option key={med.id} value={med.id}>
                                            {med.name} ({med.genericName}) — {med.unit}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>

                        {/* Dosage + Frequency */}
                        <div className="grid grid-cols-2 gap-2.5">
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Dosage</label>
                                <Input
                                    name={`items[${index}][dosage]`}
                                    value={row.dosage}
                                    onChange={e => updateRow(row.localId, "dosage", e.target.value)}
                                    placeholder="e.g. 500mg"
                                    className="text-sm bg-slate-50 border-slate-200 focus:ring-emerald-300 focus:border-emerald-300"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Frequency</label>
                                <select
                                    name={`items[${index}][frequency]`}
                                    value={row.frequency}
                                    onChange={e => updateRow(row.localId, "frequency", e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all"
                                >
                                    {FREQUENCIES.map(f => (
                                        <option key={f} value={f}>{f}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Duration + Quantity */}
                        <div className="grid grid-cols-2 gap-2.5">
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Duration</label>
                                <Input
                                    name={`items[${index}][duration]`}
                                    value={row.duration}
                                    onChange={e => updateRow(row.localId, "duration", e.target.value)}
                                    placeholder="e.g. 5 days"
                                    className="text-sm bg-slate-50 border-slate-200 focus:ring-emerald-300 focus:border-emerald-300"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Quantity</label>
                                <Input
                                    name={`items[${index}][quantity]`}
                                    type="number"
                                    min={1}
                                    value={row.quantity}
                                    onChange={e => updateRow(row.localId, "quantity", parseInt(e.target.value))}
                                    className="text-sm bg-slate-50 border-slate-200 focus:ring-emerald-300 focus:border-emerald-300"
                                />
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Instructions <span className="normal-case font-normal text-slate-300">(optional)</span>
                            </label>
                            <Input
                                name={`items[${index}][instructions]`}
                                value={row.instructions}
                                onChange={e => updateRow(row.localId, "instructions", e.target.value)}
                                placeholder="e.g. Take after meals"
                                className="text-sm bg-slate-50 border-slate-200 focus:ring-emerald-300 focus:border-emerald-300"
                            />
                        </div>
                    </div>
                </div>
            ))}

            {/* AI Suggest button — shown always */}
            <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                    {rows.length > 0
                        ? `${rows.length} medicine${rows.length !== 1 ? "s" : ""} added`
                        : "No medicines added yet"
                    }
                </p>

                <button
                    type="button"
                    onClick={handleAISuggest}
                    disabled={aiLoading}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg
            bg-purple-50 text-purple-600 border border-purple-200
            hover:bg-purple-100 transition-colors disabled:opacity-50"
                >
                    {aiLoading ? (
                        <>
                            <Loader2 size={12} className="animate-spin" />
                            Thinking...
                        </>
                    ) : (
                        <>
                            <Sparkles size={12} />
                            AI Suggest
                        </>
                    )}
                </button>
            </div>

            {/* AI error */}
            {aiError && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200
                                rounded-lg px-3 py-2">
                    {aiError}
                </p>
            )}

            {/* AI disclaimer — always visible when rows exist */}
            {rows.length > 0 && (
                <p className="text-xs text-gray-400 italic">
                    ✦ AI suggestions — please review before saving
                </p>
            )}

            <button
                type="button"
                onClick={addRow}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-emerald-300 text-sm font-medium text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400 transition-all group"
            >
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                    <Plus size={12} />
                </div>
                Add Medicine
            </button>
        </div>
    )
}