// app/assistant/appointments/walkin/page.tsx
// Quick form to add walk-in patient to today's queue

"use client"

import { addWalkIn } from "@/lib/services/appointmentService";
import { useActionState, useEffect, useState, useTransition } from "react";
import { addWalkInAction } from "./action";
import Link from "next/link";
import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Patient = { id: string; name: string; nic: string }


export default function WalkInPage() {
    const [state, action] = useActionState(addWalkInAction, null)
    const [pending, startTransition] = useTransition()
    const [search, setSearch] = useState("")
    const [patients, setPatients] = useState<Patient[]>([])
    const [selected, setSelected] = useState<Patient | null>(null)

    useEffect(() => {
        if (search.length < 2) { setPatients([]); return }
        fetch(`/api/patients/search?q=${search}`)
            .then(r => r.json())
            .then(d => setPatients(d.patients ?? []))
    }, [search])

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        startTransition(() => { action(formData) })
    }

    return (
        <div className="max-w-md mx-auto space-y-6">
            <div className="flex flex-col gap-3">
                <Link href="/assistant/appointments" className="text-gray-400 hover:text-gray-600">← Back</Link>
                <div>
                    <h1 className="text-2xl font-bold">Add Walk-in</h1>
                    <p className="text-gray-500 text-sm">Add patient directly to today's queue</p>
                </div>
            </div>

            {state?.error && (
                <p className="text-red-500 bg-red-50 border border-red-200 rounded p-3 text-sm">{state.error}</p>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
                <input type="hidden" name="patientId" value={selected?.id ?? ""} />

                {/* Patient search — same pattern as booking form */}
                <div className="bg-white border rounded-lg p-4 space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <User size={15} className="text-blue-500" /> Patient
                    </label>

                    {selected ? (
                        <div className="flex items-center justify-between bg-blue-50 rounded p-3">
                            <div>
                                <p className="font-medium text-sm">{selected.name}</p>
                                <p className="text-xs text-gray-500">NIC: {selected.nic}</p>
                            </div>
                            <button type="button" onClick={() => setSelected(null)}
                                className="text-xs text-red-500 hover:underline">Change</button>
                        </div>
                    ) : (
                        <div className="relative">
                            <Input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search patient by name or NIC..."
                            />
                            {patients.length > 0 && (
                                <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-10 mt-1">
                                    {patients.map(p => (
                                        <button key={p.id} type="button"
                                            onClick={() => { setSelected(p); setSearch("") }}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">
                                            <span className="font-medium">{p.name}</span>
                                            <span className="text-gray-400 ml-2 text-xs">{p.nic}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="bg-white border rounded-lg p-4 space-y-2">
                    <label className="text-sm font-medium">Notes (optional)</label>
                    <Input name="notes" placeholder="Reason for visit..." />
                </div>

                <Button
                    type="submit"
                    disabled={pending || !selected}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                    {pending ? "Adding..." : "Add to Queue"}
                </Button>
            </form>

        </div>
    )


}