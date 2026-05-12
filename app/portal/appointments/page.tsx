// app/(portal)/portal/appointments/page.tsx
// Patient views their upcoming and past appointments
// Can cancel upcoming ones

import { requirePatient } from "@/lib/services/authService"
import { getPatientAppointments } from "@/lib/services/appointmentService"
import Link from "next/link"
import { Calendar, Clock, Plus } from "lucide-react"
import CancelAppointmentButton from "./CancelAppointmentButton"

// Status display config
const STATUS_CONFIG = {
    SCHEDULED: { label: "Scheduled", color: "bg-blue-50 text-blue-700 border-blue-200" },
    WAITING: { label: "Waiting", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    IN_CONSULTATION: { label: "In Consultation", color: "bg-purple-50 text-purple-700 border-purple-200" },
    COMPLETED: { label: "Completed", color: "bg-green-50 text-green-700 border-green-200" },
    CANCELLED: { label: "Cancelled", color: "bg-gray-50 text-gray-500 border-gray-200" },
}

export default async function PortalAppointmentsPage() {
    const profile = await requirePatient()
    const appointments = await getPatientAppointments(profile.id)

    const today = new Date().toISOString().split("T")[0]

    const upcoming = appointments.filter(a =>
        a.date >= today &&
        !["COMPLETED", "CANCELLED"].includes(a.status)
    )
    const past = appointments.filter(a =>
        a.date < today || ["COMPLETED", "CANCELLED"].includes(a.status)
    )

    return (
        <div className="space-y-4">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <Link href="/portal/dashboard"
                        className="text-gray-400 hover:text-gray-600 text-sm">
                        ← Back
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Calendar size={22} className="text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">My Appointments</h1>
                            <p className="text-gray-500 text-sm">
                                {appointments.length} total
                            </p>
                        </div>
                    </div>
                </div>

                {/* Book new appointment */}
                <Link
                    href="/portal/appointments/new"
                    className="flex items-center gap-2 bg-emerald-500
                        hover:bg-emerald-600 text-white px-4 py-2
                        rounded-md text-sm font-medium"
                >
                    <Plus size={15} />
                    Book New
                </Link>
            </div>

            {/* Upcoming */}
            <div className="space-y-2">
                <h2 className="font-semibold text-sm text-gray-500">
                    Upcoming ({upcoming.length})
                </h2>

                {upcoming.length === 0 ? (
                    <div className="bg-white border rounded-lg p-8 text-center text-gray-400">
                        <Calendar size={28} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No upcoming appointments</p>
                        <Link
                            href="/portal/appointments/new"
                            className="text-emerald-500 text-xs hover:underline mt-1 inline-block"
                        >
                            Book one now →
                        </Link>
                    </div>
                ) : (
                    upcoming.map(appt => {
                        const status = STATUS_CONFIG[
                            appt.status as keyof typeof STATUS_CONFIG
                        ]
                        const canCancel = appt.status === "SCHEDULED"

                        return (
                            <div key={appt.id}
                                className="bg-white border rounded-lg p-4
                                    flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {/* Date badge */}
                                    <div className="bg-blue-50 border border-blue-100
                                        rounded-lg px-3 py-2 text-center min-w-[70px]">
                                        <p className="font-bold text-blue-700 text-sm">
                                            {new Date(appt.date).toLocaleDateString(
                                                "en-GB", { day: "numeric", month: "short" }
                                            )}
                                        </p>
                                        {appt.timeSlot && (
                                            <p className="text-xs text-blue-500 flex
                                                items-center justify-center gap-0.5 mt-0.5">
                                                <Clock size={10} />
                                                {appt.timeSlot}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium">
                                            {appt.type === "WALKIN"
                                                ? "Walk-in"
                                                : "Booked appointment"
                                            }
                                        </p>
                                        {appt.notes && (
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {appt.notes}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-1 rounded-full
                                        border font-medium ${status.color}`}>
                                        {status.label}
                                    </span>

                                    {/* Cancel button — only for SCHEDULED */}
                                    {canCancel && (
                                        <CancelAppointmentButton
                                            appointmentId={appt.id}
                                        />
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Past appointments */}
            {past.length > 0 && (
                <div className="space-y-2">
                    <h2 className="font-semibold text-sm text-gray-500">
                        Past ({past.length})
                    </h2>
                    {past.map(appt => {
                        const status = STATUS_CONFIG[
                            appt.status as keyof typeof STATUS_CONFIG
                        ]
                        return (
                            <div key={appt.id}
                                className="bg-white border rounded-lg p-4
                                    flex items-center justify-between opacity-70">
                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-50 border border-gray-100
                                        rounded-lg px-3 py-2 text-center min-w-[70px]">
                                        <p className="font-bold text-gray-600 text-sm">
                                            {new Date(appt.date).toLocaleDateString(
                                                "en-GB", { day: "numeric", month: "short" }
                                            )}
                                        </p>
                                        {appt.timeSlot && (
                                            <p className="text-xs text-gray-400 flex
                                                items-center justify-center gap-0.5 mt-0.5">
                                                <Clock size={10} />
                                                {appt.timeSlot}
                                            </p>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {appt.type === "WALKIN"
                                            ? "Walk-in"
                                            : "Booked appointment"
                                        }
                                    </p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full
                                    border font-medium ${status.color}`}>
                                    {status.label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}