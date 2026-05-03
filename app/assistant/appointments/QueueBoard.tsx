// app/assistant/appointments/QueueBoard.tsx
// Real-time queue board — assistant updates status
// Auto-refreshes every 10 seconds

"use client"

import { Clock, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useTransition } from "react"
import { updateStatusAction } from "./action"

type Appointment = {
    id: string
    timeSlot: string | null
    type: string
    status: string
    notes: string | null
    patient: { profile: { name: string }; nic: string }
}

type Pops = {
    appointments: Appointment[]
    date: string
}

// status display config
const STATUS_CONFIG = {
    SCHEDULED: { label: "Scheduled", color: "bg-gray-100 text-gray-600 border-slate-100 border" },
    WAITING: { label: "Waiting", color: "bg-yellow-100 text-yellow-600 border-yellow-100 border" },
    IN_CONSULTATION: { label: "In Consultation", color: "bg-blue-100 text-blue-600 border-blue-100 border" },
    COMPLETED: { label: "Completed", color: "bg-green-100 text-green-600 border-green-100 border" },
    CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-600 border-red-100 border" },
}

// what status buttons to show current status
const NEXT_ACTIONS: Record<string, { label: string, status: string, color: string }[]> = {
    SCHEDULED: [{ label: "Mark Arrived", status: "WAITING", color: "bg-yellow-500" }, { label: "Cancel", status: "CANCELLED", color: "bg-red-500" }],
    WAITING: [{ label: "Start Consult", status: "IN_CONSULTATION", color: "bg-blue-500" }, { label: "Cancel", status: "CANCELLED", color: "bg-red-500" }],
    IN_CONSULTATION: [{ label: "Complete", status: "COMPLETED", color: "bg-green-500" }],
    COMPLETED: [],
    CANCELLED: []
}

export default function QueueBoard({ appointments, date }: Pops) {

    const router = useRouter();
    const [pending, startTransition] = useTransition();

    // Auto refresh every 10 seconds - keep queue in sync
    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh();
        }, 10000)
        return () => clearInterval(interval)
    }, [router])

    function handleStatusUpdate(appointmentId: string, newStatus: string) {
        startTransition(async () => {
            await updateStatusAction(appointmentId, newStatus)
            router.refresh()
        })
    }

    if (appointments.length === 0) {
        return (
            <div className="bg-white rounded-lg border p-12 text-center text-gray-400">
                <Clock size={32} className="mx-auto mb-3 opacity-30" />
                <p>No appointments for this day</p>
                <p className="text-xs mt-1">Book an appointment or add a walk-in</p>
            </div>
        )
    }

    // Separate booked and walk-in
    const booked = appointments.filter(a => a.type === "BOOKED")
    const walkins = appointments.filter(a => a.type === "WALKIN")


    return (
        <div className="space-y-6">
            {/** --- Booked appointments list -- */}
            {booked.length > 0 && (
                <div className="space-y-2">
                    <h2 className="text-sm font-medium text-gray-500">
                        Booked
                    </h2>
                    {booked.map(a => (
                        <AppointmentCard
                            key={a.id}
                            appointment={a}
                            onStatusUpdate={handleStatusUpdate}
                            pending={pending}
                        />
                    ))}
                </div>
            )}

            {/* --- Walk-in appointments list --- */}
            {walkins.length > 0 && (
                <div className="space-y-2">
                    <h2 className="text-sm font-medium text-gray-500">
                        Walk-ins
                    </h2>
                    {walkins.map(a => (
                        <AppointmentCard
                            key={a.id}
                            appointment={a}
                            onStatusUpdate={handleStatusUpdate}
                            pending={pending}
                        />
                    ))}

                </div>
            )}
        </div>
    )
}


function AppointmentCard({ appointment: a, onStatusUpdate, pending }: {
    appointment: Appointment
    onStatusUpdate: (id: string, status: string) => void
    pending: boolean
}) {
    const config = STATUS_CONFIG[a.status as keyof typeof STATUS_CONFIG]
    const actions = NEXT_ACTIONS[a.status] ?? []

    return (
        <div className="bg-white rounded-lg border p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                {/* --- time or walk-in indicator --- */}
                <div className="text-center w-16 border bg-blue-500/15 text-blue-700 border-blue-500/40 rounded-md py-1 px-2">
                    {a.timeSlot ? (
                        <p className="font-bold text-sm">{a.timeSlot}</p>
                    ) : (
                        <p className="text-xs text-gray-400">Walk-in</p>
                    )}
                </div>

                {/* --- Patient Info --- */}
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <User size={16} className="text-gray-500" />
                </div>

                <div>
                    <p className="font-medium text-sm">{a.patient.profile.name}</p>
                    <p className="text-xs text-gray-400">NIC: {a.patient.nic}</p>
                    {a.notes && <p className="text-xs text-gray-400 italic mt-0.5">{a.notes}</p>}
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* --- Current status badge --- */}
                <span className={`text-sm px-2 py-1 rounded-full font-medium border ${config.color}`}>
                    {config.label}
                </span>

                {/* --- Action buttons --- */}
                {actions.map(action => (
                    <button
                        key={action.status}
                        onClick={() => onStatusUpdate(a.id, action.status)}
                        disabled={pending}
                        className={`text-xs text-white px-3 py-1 rounded-md border ${action.color} disabled:opacity-50 hover:scale-105 transition-transform hover:shadow-md cursor-pointer`}
                    >
                        {action.label}
                    </button>
                ))}
            </div>
        </div>
    )
}