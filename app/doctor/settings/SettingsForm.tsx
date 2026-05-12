// SettingsForm.tsx
"use client"

import { useActionState, useTransition } from "react"
import { updateSettingsAction } from "./action"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

type Settings = {
    clinicName: string
    openTime: string
    closeTime: string
    slotDuration: number
    lunchStart: string
    lunchEnd: string
    consultFee: number
} | null

type Props = { settings: Settings }

const SLOT_DURATIONS = [10, 15, 20, 30, 45, 60]

export default function SettingsForm({ settings }: Props) {
    const [state, formAction] = useActionState(updateSettingsAction, null)
    const [pending, startTransition] = useTransition()

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        startTransition(() => formAction(formData))
    }

    return (
        <form onSubmit={onSubmit} className="space-y-4">

            {state?.error && (
                <p className="text-red-500 bg-red-50 border border-red-200 rounded p-3 text-sm">
                    {state.error}
                </p>
            )}

            {/* Clinic identity */}
            <div className="bg-white border rounded-lg p-5 space-y-4 border-l-4 border-l-blue-500">
                <h2 className="font-semibold text-blue-600 text-sm">Clinic Info</h2>
                <div>
                    <label className="text-sm font-medium">Clinic Name</label>
                    <Input
                        name="clinicName"
                        defaultValue={settings?.clinicName ?? "My Clinic"}
                    />
                </div>
            </div>

            {/* Hours */}
            <div className="bg-white border rounded-lg p-5 space-y-4 border-l-4 border-l-emerald-500">
                <h2 className="font-semibold text-emerald-600 text-sm">Working Hours</h2>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-sm font-medium">Open Time</label>
                        <Input
                            name="openTime"
                            type="time"
                            defaultValue={settings?.openTime ?? "09:00"}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Close Time</label>
                        <Input
                            name="closeTime"
                            type="time"
                            defaultValue={settings?.closeTime ?? "17:00"}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-sm font-medium">Lunch Start</label>
                        <Input
                            name="lunchStart"
                            type="time"
                            defaultValue={settings?.lunchStart ?? "13:00"}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Lunch End</label>
                        <Input
                            name="lunchEnd"
                            type="time"
                            defaultValue={settings?.lunchEnd ?? "13:30"}
                        />
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium">Slot Duration (minutes)</label>
                    <select
                        name="slotDuration"
                        defaultValue={settings?.slotDuration ?? 20}
                        className="w-full border rounded-md px-3 py-2 text-sm bg-white mt-1"
                    >
                        {SLOT_DURATIONS.map(d => (
                            <option key={d} value={d}>{d} minutes</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Fees */}
            <div className="bg-white border rounded-lg p-5 space-y-4 border-l-4 border-l-amber-500">
                <h2 className="font-semibold text-amber-600 text-sm">Fees</h2>
                <div>
                    <label className="text-sm font-medium">Consultation Fee (Rs.)</label>
                    <Input
                        name="consultFee"
                        type="number"
                        step="0.01"
                        min={0}
                        defaultValue={settings?.consultFee ?? 1000}
                    />
                </div>
            </div>

            <Button
                type="submit"
                disabled={pending}
                className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white"
            >
                {pending ? "Saving..." : "Save Settings"}
            </Button>

            {state === null && (
                <div className="flex items-center justify-center gap-2 py-2 rounded-lg
                    bg-emerald-50 border border-emerald-100">
                    <CheckCircle size={15} className="text-emerald-500" />
                    <span className="text-sm text-emerald-600 font-medium">Settings saved</span>
                </div>
            )}
        </form>
    )
}