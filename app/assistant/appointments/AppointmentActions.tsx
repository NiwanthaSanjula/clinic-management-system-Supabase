// AppointmentActions.tsx
"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { addWalkInAction } from "./walkin/action"
import { User, UserPlus } from "lucide-react"
import QuickCreatePatientModal from "@/components/patients/QuickCreatePatientModal"

type Patient = { id: string; name: string; nic: string }

export default function AppointmentActions() {
    const [showModal, setShowModal] = useState(false)
    const router = useRouter()

    return (
        <>
            <WalkInModal
                open={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={() => {
                    setShowModal(false)
                    router.refresh()
                }}
            />
            <div className="flex gap-2">
                <button
                    onClick={() => setShowModal(true)}
                    className="border px-4 py-2 rounded-md text-sm hover:bg-gray-50"
                >
                    + Walk-In
                </button>
                <Link
                    href="/assistant/appointments/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                >
                    + Book
                </Link>
            </div>
        </>
    )
}

function WalkInModal({ open, onClose, onSuccess }: {
    open: boolean
    onClose: () => void
    onSuccess: () => void
}) {
    const [search, setSearch] = useState("")
    const [patients, setPatients] = useState<Patient[]>([])
    const [selected, setSelected] = useState<Patient | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [pending, startTransition] = useTransition()

    // Quick create modal state
    const [showQuickCreate, setShowQuickCreate] = useState(false)

    function handleClose() {
        setSearch("")
        setPatients([])
        setSelected(null)
        setError(null)
        onClose()
    }

    async function handleSearch(value: string) {
        setSearch(value)
        if (value.length < 2) { setPatients([]); return }
        const res = await fetch(`/api/patients/search?query=${value}`)
        const data = await res.json()
        setPatients(data.patients ?? [])
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!selected) return
        setError(null)
        const formData = new FormData(e.currentTarget)
        startTransition(async () => {
            const result = await addWalkInAction(null, formData)
            if (result?.error) { setError(result.error); return }
            onSuccess()
        })
    }

    return (
        <>
            {/* Quick create nested modal */}
            <QuickCreatePatientModal
                open={showQuickCreate}
                onClose={() => setShowQuickCreate(false)}
                onCreated={(patient) => {
                    // Auto-select newly created patient
                    setSelected(patient)
                    setShowQuickCreate(false)
                    setSearch("")
                    setPatients([])
                }}
            />

            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Add Walk-In Patient</DialogTitle>
                    </DialogHeader>

                    {error && (
                        <p className="text-red-500 bg-red-50 border border-red-200 rounded p-2 text-sm">
                            {error}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="hidden" name="patientId" value={selected?.id ?? ""} />

                        <div>
                            {/* Label row with "+ New Patient" button */}
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <User size={14} className="text-blue-500" /> Patient
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowQuickCreate(true)}
                                    className="flex items-center gap-1 text-xs text-emerald-600 hover:underline"
                                >
                                    <UserPlus size={12} />
                                    New Patient
                                </button>
                            </div>

                            {selected ? (
                                <div className="flex items-center justify-between bg-blue-50 rounded p-3">
                                    <div>
                                        <p className="font-medium text-sm">{selected.name}</p>
                                        <p className="text-xs text-gray-500">NIC: {selected.nic}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelected(null)}
                                        className="text-xs text-red-500 hover:underline"
                                    >
                                        Change
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <Input
                                        value={search}
                                        onChange={e => handleSearch(e.target.value)}
                                        placeholder="Search by name or NIC..."
                                    />
                                    {patients.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-10 mt-1">
                                            {patients.map(p => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelected(p)
                                                        setPatients([])
                                                        setSearch("")
                                                    }}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex justify-between"
                                                >
                                                    <span className="font-medium">{p.name}</span>
                                                    <span className="text-gray-400 text-xs">{p.nic}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* No results hint — same as booking form */}
                                    {search.length >= 2 && patients.length === 0 && (
                                        <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-10 mt-1 p-3 text-sm text-gray-500 flex items-center justify-between">
                                            <span>No patients found</span>
                                            <button
                                                type="button"
                                                onClick={() => setShowQuickCreate(true)}
                                                className="text-emerald-600 text-xs hover:underline flex items-center gap-1"
                                            >
                                                <UserPlus size={12} />
                                                Create new
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium">
                                Notes <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <Input name="notes" placeholder="Reason for visit..." />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-1/2"
                                onClick={handleClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={pending || !selected}
                                className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                            >
                                {pending ? "Adding..." : "Add to Queue"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}