// components/patients/VitalsSection.tsx
// Shows vitals history + form to record new vitals
// Used on patient profile page (assistant only)
"use client"

import { ActivityIcon, Heart, Thermometer, Weight } from "lucide-react"
import { useActionState, useTransition } from "react"
import { Input } from "../ui/input"
import VitalBadge from "./VitalBadge"
import VitalsHistory from "./VitalsHistory"

type Vitals = {
    id: string
    bloodPressure: string | null
    weight: number | null
    temperature: number | null
    pulse: number | null
    notes: string | null
    recordedAt: Date
}

type Props = {
    patientId: string
    vitals: Vitals[]
    action: (prevState: { error: string } | null, formData: FormData) => Promise<{ error: string } | null>
}

export default function VitalsSection({ patientId, vitals, action }: Props) {
    const [state, formAction] = useActionState(action, null)
    const [pending, startTransition] = useTransition()

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        startTransition(() => { formAction(formData) })
    }

    return (
        <div className="space-y-5">
            {/* Record New Vitals Form */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden border-l-4 border-l-blue-500">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/70">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <ActivityIcon size={14} className="text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-slate-800">Record Vitals</h2>
                        <p className="text-xs text-slate-400">Enter the patient's current measurements</p>
                    </div>
                </div>

                <div className="px-6 py-5">
                    {state?.error && (
                        <div className="flex items-start gap-3 mb-4 bg-red-50 border border-red-100 rounded-xl p-3.5">
                            <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5 text-red-500 text-xs font-bold">!</span>
                            <p className="text-sm text-red-600">{state.error}</p>
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    <Heart size={11} className="text-red-400" />
                                    Blood Pressure
                                </label>
                                <Input
                                    name="bloodPressure"
                                    placeholder="e.g. 120/80"
                                    className="bg-slate-50 border-slate-200 text-sm focus:ring-blue-200 focus:border-blue-300 rounded-lg"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    <Weight size={11} className="text-blue-400" />
                                    Weight (kg)
                                </label>
                                <Input
                                    name="weight"
                                    type="number"
                                    step="0.1"
                                    placeholder="e.g. 70.5"
                                    className="bg-slate-50 border-slate-200 text-sm focus:ring-blue-200 focus:border-blue-300 rounded-lg"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    <Thermometer size={11} className="text-orange-400" />
                                    Temperature (°C)
                                </label>
                                <Input
                                    name="temperature"
                                    type="number"
                                    step="0.1"
                                    placeholder="e.g. 37.2"
                                    className="bg-slate-50 border-slate-200 text-sm focus:ring-blue-200 focus:border-blue-300 rounded-lg"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    <ActivityIcon size={11} className="text-purple-400" />
                                    Pulse (bpm)
                                </label>
                                <Input
                                    name="pulse"
                                    type="number"
                                    placeholder="e.g. 72"
                                    className="bg-slate-50 border-slate-200 text-sm focus:ring-blue-200 focus:border-blue-300 rounded-lg"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Notes <span className="normal-case font-normal text-slate-300">(optional)</span>
                            </label>
                            <Input
                                name="notes"
                                placeholder="Optional notes..."
                                className="bg-slate-50 border-slate-200 text-sm focus:ring-blue-200 focus:border-blue-300 rounded-lg"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={pending}
                            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-sm font-semibold tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {pending ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Saving...
                                </span>
                            ) : "Record Vitals"}
                        </button>
                    </form>
                </div>
            </div>

            {/* Vitals history — unchanged */}
            <VitalsHistory vitals={vitals} />
        </div>
    )
}