// components/inventory/AddMedicineModal.tsx
// Modal form to add a brand new medicine to the master list
"use client"

import { useState, useTransition } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { addMedicineAction } from "@/app/assistant/inventory/addMedicineAction"
import { useRouter } from "next/navigation"

// Common categories — user can still type a custom one
const CATEGORIES = [
    "Painkiller", "Antibiotic", "Antacid", "Antihistamine",
    "Cough & Cold", "Vitamin", "Antifungal", "Diabetes",
    "Antihypertensive", "Other"
]

const UNITS = ["tablets", "capsules", "ml", "mg", "sachets", "drops", "cream"]

type Props = {
    open: boolean
    onClose: () => void
}

export default function AddMedicineModal({ open, onClose }: Props) {
    const [error, setError] = useState<string | null>(null)
    const [pending, startTransition] = useTransition()
    const router = useRouter()

    function handleClose() {
        setError(null)
        onClose()
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        const formData = new FormData(e.currentTarget)

        startTransition(async () => {
            const result = await addMedicineAction(formData)
            if (!result.success) {
                setError(result.error ?? "Something went wrong")
                return
            }
            router.refresh()
            handleClose()
        })
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New Medicine</DialogTitle>
                </DialogHeader>

                <p className="text-sm text-gray-500 -mt-2">
                    Adds to the master medicine list. Add stock batches separately.
                </p>

                {error && (
                    <p className="text-red-500 bg-red-50 border border-red-200 rounded p-2 text-sm">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium">Brand Name *</label>
                            <Input name="name" placeholder="e.g. Panadol" required />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Generic Name *</label>
                            <Input name="genericName" placeholder="e.g. Paracetamol" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Category — select + custom input */}
                        <div>
                            <label className="text-sm font-medium">Category *</label>
                            <select
                                name="category"
                                required
                                className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                            >
                                <option value="">Select...</option>
                                {CATEGORIES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        {/* Unit */}
                        <div>
                            <label className="text-sm font-medium">Unit *</label>
                            <select
                                name="unit"
                                required
                                className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                            >
                                <option value="">Select...</option>
                                {UNITS.map(u => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium">
                                Default Dosage
                                <span className="text-gray-400 font-normal"> (optional)</span>
                            </label>
                            <Input name="defaultDosage" placeholder="e.g. 500mg" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Selling Price (Rs.) *</label>
                            <Input
                                name="price"
                                type="number"
                                step="0.01"
                                min={0}
                                placeholder="e.g. 5.00"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-1/2"
                            onClick={handleClose}
                            disabled={pending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={pending}
                            className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {pending ? "Adding..." : "Add Medicine"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}