// app/(portal)/portal/appointments/new/page.tsx
// Patient books their own appointment
// Same slot picker as assistant booking form
"use client"

import { useActionState, useEffect, useState, useTransition } from "react"
import { portalBookAppointmentAction } from "./action"
import Link from "next/link"
import { Calendar, Clock, FileText, CalendarClock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function PortalBookAppointmentPage() {
    const [state, action] = useActionState(portalBookAppointmentAction, null)
    const [pending, startTransition] = useTransition()

    const [selectedDate, setSelectedDate] = useState("")
    const [slots, setSlots] = useState<string[]>([])
    const [loadingSlots, setLoadingSlots] = useState(false)

    // Fetch available slots when date changes
    // Reuses the same API route as assistant booking
    useEffect(() => {
        if (!selectedDate) return
        setLoadingSlots(true)
        setSlots([])

        fetch(`/api/appointments/slots?date=${selectedDate}`)
            .then(r => r.json())
            .then(data => setSlots(data.slots ?? []))
            .finally(() => setLoadingSlots(false))
    }, [selectedDate])

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        startTransition(() => action(formData))
    }

    const today = new Date().toISOString().split("T")[0]

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col gap-2">
                <Link href="/portal/appointments"
                    className="text-gray-400 hover:text-gray-600 text-sm">
                    ← Back
                </Link>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                        <CalendarClock size={22} className="text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Book Appointment</h1>
                        <p className="text-gray-500 text-sm">
                            Choose a date and time
                        </p>
                    </div>
                </div>
            </div>

            {state?.error && (
                <p className="text-red-500 bg-red-50 border border-red-200
                    rounded p-3 text-sm">
                    {state.error}
                </p>
            )}

            <form onSubmit={onSubmit} className="space-y-4">

                {/* Date picker */}
                <div className="bg-white border rounded-lg p-4 space-y-2
                    border-l-2 border-l-emerald-500">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Calendar size={15} className="text-emerald-500" />
                        Select Date
                    </label>
                    <Input
                        type="date"
                        name="date"
                        min={today}
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        required
                        className="py-5"
                    />
                </div>

                {/* Time slot picker */}
                <div className="bg-white border rounded-lg p-4 space-y-3
                    border-l-2 border-l-emerald-500">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Clock size={15} className="text-emerald-500" />
                        Select Time
                    </label>

                    {!selectedDate && (
                        <p className="text-gray-400 text-sm">
                            Select a date first
                        </p>
                    )}

                    {loadingSlots && (
                        <div className="grid grid-cols-3 gap-2">
                            {[...Array(6)].map((_, i) => (
                                <div key={i}
                                    className="h-10 bg-gray-100 rounded animate-pulse" />
                            ))}
                        </div>
                    )}

                    {!loadingSlots && selectedDate && slots.length === 0 && (
                        <p className="text-red-500 text-sm">
                            No available slots for this date
                        </p>
                    )}

                    {slots.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                            {slots.map(slot => (
                                <label key={slot} className="cursor-pointer">
                                    <input
                                        type="radio"
                                        name="timeSlot"
                                        value={slot}
                                        className="sr-only peer"
                                        required
                                    />
                                    <div className="text-center text-sm py-2.5 border
                                        rounded-lg peer-checked:bg-emerald-600
                                        peer-checked:text-white peer-checked:border-emerald-600
                                        hover:bg-gray-50 transition-colors font-medium">
                                        {slot}
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Notes */}
                <div className="bg-white border rounded-lg p-4 space-y-2
                    border-l-2 border-l-emerald-500">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <FileText size={15} className="text-emerald-500" />
                        Notes
                        <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <Input
                        name="notes"
                        placeholder="Reason for visit..."
                    />
                </div>

                <Button
                    type="submit"
                    disabled={pending || !selectedDate}
                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-700
                        text-white disabled:opacity-50"
                >
                    {pending ? "Booking..." : "Confirm Appointment"}
                </Button>
            </form>
        </div>
    )
}