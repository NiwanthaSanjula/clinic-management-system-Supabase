// app/assistant/inventory/receive/ReceiveBatchForm.tsx

"use client"

import { useActionState, useTransition } from "react"
import { receiveBatchAction } from "./action"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Medicine = {
    id: string
    name: string
    genericName: string
    category: string
    unit: string
}

type Props = { medicines: Medicine[] }

// Group by category for select dropdown
function groupByCategory(medicines: Medicine[]) {
    return medicines.reduce((acc, med) => {
        if (!acc[med.category]) acc[med.category] = []
        acc[med.category].push(med)
        return acc
    }, {} as Record<string, Medicine[]>)
}

export default function ReceiveBatchForm({ medicines }: Props) {
    const [state, formAction] = useActionState(receiveBatchAction, null)
    const [pending, startTransition] = useTransition()

    function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget)
        startTransition(() => formAction(formData))
    }

    const ByCategory = groupByCategory(medicines)

    // Minium expiry date = tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1)
    const minExpiry = tomorrow.toISOString().split("T")[0]

    return (
        <form onSubmit={onSubmit} className="space-y-4">

            {state?.error && (
                <p className="text-red-500 bg-red-50 border border-red-200 rounded p-3 text-sm">
                    {state.error}
                </p>
            )}

            {/* Medicine selector */}
            <div className="bg-white border rounded-lg p-4 space-y-2 border-l-2 border-l-emerald-500">
                <label className="text-sm font-medium">Medicine *</label>
                <select
                    name="medicineId"
                    required
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                >
                    <option value="">Select medicine...</option>
                    {Object.entries(ByCategory).map(([category, meds]) => (
                        <optgroup key={category} label={category}>
                            {meds.map(med => (
                                <option key={med.id} value={med.id}>
                                    {med.name} ({med.genericName}) — {med.unit}
                                </option>
                            ))}

                        </optgroup>
                    ))}
                </select>
            </div>

            {/** Batch details */}
            <div className="bg-white border rounded-lg p-4 space-y-4 border-l-2 border-l-blue-500">
                <h2 className="text-sm font-medium text-blue-600">Batch Details</h2>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-sm font-medium">Batch Number *</label>
                        <Input
                            name="batchNumber"
                            placeholder="e.g. BT2026001"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Quantity *</label>
                        <Input
                            name="quantity"
                            type="number"
                            min={1}
                            placeholder="e.g. 100"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-sm font-medium">Unit Cost (Rs.) *</label>
                        <Input
                            name="unitCost"
                            type="number"
                            step="0.01"
                            min={0}
                            placeholder="e.g. 1.50"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Expiry Date *</label>
                        <Input
                            name="expiryDate"
                            type="date"
                            min={minExpiry}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium">
                        Notes <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <Input
                        name="notes"
                        placeholder="e.g. Supplier: ABC Pharma"
                    />
                </div>
            </div>

            <Button
                type="submit"
                disabled={pending}
                className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
            >
                {pending ? "Saving..." : "Add to Inventory"}
            </Button>



        </form>
    )
}