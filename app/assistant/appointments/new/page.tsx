"use client"

import { useActionState, useEffect, useState, useTransition } from "react";
import { bookingAppointmentAction } from "./action"
import Link from "next/link";
import { Calendar, CalendarClock, Clock, FileText, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Patient = { id: string; name: string; nic: string }
type Props = { patients: Patient[]; availableSlots: string[] }

// Separate client component so we can fetch slots dynamically
export default function BookAppointmentPage() {
    return (
        <BookingForm />
    )
}

function BookingForm() {
    const [state, action] = useActionState(bookingAppointmentAction, null)
    const [pending, startTransition] = useTransition()

    // Selected date - when changed, fetch available slots
    const [selectedDate, setSelectedDate] = useState("")
    const [slots, setSlots] = useState<string[]>([])
    const [loadingSlots, setLoadingSlots] = useState(false)

    // Patient search
    const [search, setSearch] = useState("")
    const [patients, setPatients] = useState<Patient[]>([])
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
    const [showDropdown, setShowDropdown] = useState(false)

    // fetch available slots when date changes
    useEffect(() => {
        if (!selectedDate) return
        setLoadingSlots(true)
        setSlots([])

        fetch(`/api/appointments/slots?date=${selectedDate}`)
            .then(r => r.json())
            .then(data => setSlots(data.slots ?? []))
            .finally(() => setLoadingSlots(false))
    }, [selectedDate])

    // Search patients as user types
    useEffect(() => {
        if (search.length < 2) { setPatients([]); return }

        fetch(`/api/patients/search?query=${search}`)
            .then(r => r.json())
            .then(data => setPatients(data.patients ?? []))
    }, [search])

    function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        startTransition(() => { action(formData) })
    }

    // Minimum date = today
    const today = new Date().toISOString().split("T")[0]

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="flex flex-col gap-3">
                <Link
                    href="/assistant/appointments"
                    className="text-gray-400 hover:text-gray-600"
                >
                    ← Back
                </Link>

                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                        <CalendarClock className="size-9 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl text-emerald-500 font-bold">Book Appointment</h1>
                        <p className="text-gray-500 text-sm">Schedule a patient visit</p>
                    </div>
                </div>
            </div>

            {state?.error && (
                <p className="text-red-500 bg-red-50 border border-red-200 rounded p-3 text-sm">
                    {state.error}
                </p>
            )}

            <form onSubmit={onSubmit} className="space-y-4">

                {/* --- Patient Search --- */}
                <div className="bg-white border rounded-lg p-4 space-y-2 border-l-2 border-l-emerald-500">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <User size={15} className="text-emerald-500" /> Patient
                    </label>

                    {/* Hidden input carries the actual patientId */}
                    <input type="hidden" name="patientId" value={selectedPatient?.id ?? ""} />

                    {selectedPatient ? (
                        // Show selected patient with option to change
                        <div className="flex items-center justify-between bg-blue-50 rounded p-3 ">
                            <div>
                                <p className="font-medium text-sm">{selectedPatient.name}</p>
                                <p className="text-xs text-gray-500">NIC: {selectedPatient.nic}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setSelectedPatient(null); setSearch("") }}
                                className="text-xs text-red-500 hover:underline"
                            >
                                Change
                            </button>
                        </div>
                    ) : (
                        // Search input + dropdown
                        <div className="relative">
                            <Input
                                value={search}
                                onChange={e => { setSearch(e.target.value); setShowDropdown(true) }}
                                placeholder="Search by name or NIC..."
                            />
                            {showDropdown && patients.length > 0 && (
                                <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-10 mt-1">
                                    {patients.map(p => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedPatient(p)
                                                setShowDropdown(false)
                                                setSearch("")
                                            }}
                                            className="flex items-center justify-between w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                                        >
                                            <span>{p.name}</span>
                                            <span>{p.nic}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* --- Date picker --- */}
                <div className="bg-white border rounded-lg p-4 space-y-2 border-l-2 border-l-emerald-500">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Calendar size={15} className="text-emerald-500" /> Date
                    </label>
                    <Input
                        type="date"
                        name="date"
                        min={today}
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        required
                        className="py-6"
                    />
                </div>

                {/** --- Time slot picker --- */}
                <div className="bg-white border rounded-lg p-4 space-y-2 border-l-2 border-l-emerald-500">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Clock size={15} className="text-emerald-500" /> Time Slot
                    </label>

                    {!selectedDate && (
                        <p className="text-gray-500 text-sm">Select a date first</p>
                    )}

                    {loadingSlots && (

                        <div className="grid grid-cols-4 gap-2">
                            {[...Array(22)].map((_, i) => (
                                <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
                            ))}
                        </div>


                        //<p className="text-gray-400 text-sm">Loading available slots...</p>
                    )}

                    {!loadingSlots && selectedDate && slots.length === 0 && (
                        <p className="text-red-500 text-sm">No available slots for this date</p>
                    )}

                    {/* Hidden input for selected slot */}
                    {slots.length > 0 && (
                        <div className="grid grid-cols-4 gap-2">
                            {slots.map(slot => (
                                <label key={slot} className="cursor-pointer">
                                    <input
                                        type="radio"
                                        name="timeSlot"
                                        value={slot}
                                        className="sr-only peer"
                                        required
                                    />
                                    {/* Highlight selected slot */}
                                    <div className="text-center text-sm py-2 border rounded-md
                                                peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-600
                                                hover:bg-gray-50 hover:text-emerald-500 transition-colors"
                                    >
                                        {slot}
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Notes */}
                <div className="bg-white border rounded-lg p-4 space-y-2 border-l-2 border-l-emerald-500">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <FileText size={15} className="text-emerald-500" /> Notes
                        <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <Input name="notes" placeholder="Reason for visit, special notes..." />
                </div>

                <Button
                    type="submit"
                    disabled={pending || !selectedPatient || !selectedDate}
                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                >
                    {pending ? "Booking..." : "Book Appointment"}
                </Button>
            </form>
        </div>
    )



}