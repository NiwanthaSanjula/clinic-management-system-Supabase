// components/patients/VitalsSection.tsx
// Shows vitals history + form to record new vitals
// Used on patient profile page (assistant only)
"use client"

import { ActivityIcon, Heart, Thermometer, Weight } from "lucide-react"
import { startTransition, useActionState, useTransition } from "react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
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

    function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        startTransition(() => { formAction(formData) })
    }

    return (
        <div className="space-y-6">
            {/* Record New Vitals Form */}

            <div className="bg-white rounded-lg border p-6 border-l-4 border-l-blue-500">
                <h2 className="font-bold text-blue-600 mb-4">Record Vitals</h2>

                {state?.error && (
                    <p className="text-red-500 text-sm mb-3 bg-red-50 p-2 rounded">
                        {state.error}
                    </p>
                )}

                <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4">

                    <div>
                        <label className="text-xs font-medium text-gray-600 flex items-center gap-1 mb-1">
                            <Heart size={13} className="text-red-500" /> Blood Pressure
                        </label>
                        <Input name="bloodPressure" placeholder="e.g. 120/80" />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-600 flex items-center gap-1 mb-1">
                            <Weight size={13} className="text-blue-500" /> Weight (kg)
                        </label>
                        <Input name="weight" type="number" step="0.1" placeholder="e.g. 70.5" />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-600 flex items-center gap-1 mb-1">
                            <Thermometer size={13} className="text-orange-500" /> Temperature (°C)
                        </label>
                        <Input name="temperature" type="number" step="0.1" placeholder="e.g. 37.2" />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-600 flex items-center gap-1 mb-1">
                            <ActivityIcon size={13} className="text-purple-500" /> Pulse (bpm)
                        </label>
                        <Input name="pulse" type="number" placeholder="e.g. 72" />
                    </div>

                    <div className="col-span-2">
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Notes</label>
                        <Input name="notes" placeholder="optional notes" />
                    </div>

                    <div className="col-span-2">
                        <Button
                            type="submit"
                            disabled={pending}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {pending ? "Saving..." : "Record Vitals"}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Vital history */}
            <VitalsHistory
                vitals={vitals}
            />


        </div>
    )
}
