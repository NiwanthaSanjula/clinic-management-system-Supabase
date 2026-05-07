// app/doctor/appointments/page.tsx
// Doctor's view of today's queue
// Shows WAITING and IN_CONSULTATION patients only
// Click "Start Consultation" to open consultation form

import { getDoctorQueue } from "@/lib/services/appointmentService";
import { requireDoctor } from "@/lib/services/authService";
import { ActivityIcon, Clock, Dot, Heart, Thermometer, User, Weight } from "lucide-react";
import Link from "next/link";

export default async function DoctorAppointmentsPage() {
    await requireDoctor()

    const today = new Date().toISOString().split("T")[0]
    const appointments = await getDoctorQueue(today)

    return (
        <div className="space-y-4 max-w-4xl mx-auto">

            {/* --- Header --- */}
            <div>
                <h1 className="text-2xl font-bold">Today's Queue</h1>
                <p className="flex items-center text-gray-500 text-sm">
                    {today} <Dot size={40} /> {appointments.length} patients{appointments.length !== 1 ? "s" : ""}
                </p>
            </div>

            {appointments.length === 0 ? (
                <div className="bg-white rounded-lg border p-12 text-center text-gray-400">
                    <Clock size={32} className="mx-auto mb-3 opacity-30" />
                    <p>No patients in queue right now</p>
                    <p className="text-xs mt-1">Patients appear here when marked as Waiting by the assistant</p>

                </div>
            ) : (
                <div className="space-y-3">
                    {appointments.map((appt) => {

                        // Latest vitals record for the patient
                        const latestVitals = appt.patient.vitals[0] ?? null

                        // Has consulltation alreadt been started
                        const hasConsultation = !!appt.consultation

                        return (
                            <div
                                key={appt.id}
                                className="bg-white rounded-lg border p-5 space-y-4 shadow-md"
                            >

                                {/* Patient row */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">

                                        {/** Time badge */}
                                        <div className="text-center w-16 bg-blue-50 text-blue-700 border border-blue-200 rounded-md py-1 px-2">
                                            {appt.timeSlot ? (
                                                <p className="font-bold text-sm">{appt.timeSlot}</p>
                                            ) : (
                                                <p className="font-bold text-sm">Walk-in</p>
                                            )}
                                        </div>

                                        {/** Avatar */}
                                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                                            <User size={16} className="text-gray-500" />
                                        </div>

                                        {/** Name + NIC*/}
                                        <div>
                                            <p className="font-medium">{appt.patient.profile.name}</p>
                                            <p className="text-xs text-gray-400"> NIC: {appt.patient.nic}</p>
                                            {appt.notes && (
                                                <p className="text-sm text-gray-400 italic mt-0.5">{appt.notes}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/** Status + Action */}
                                    <div className="flex items-center gap-3">

                                        {/** Status badge */}
                                        <span
                                            className={`text-xs py-1 px-2 rounded-full font-medium border ${appt.status === "WAITING"
                                                ? "text-yellow-500 bg-yellow-50 border-yellow-400"
                                                : "text-blue-500 bg-blue-50 border-blue-200"
                                                }`}
                                        >
                                            {appt.status === "WAITING" ? "Waiting" : "In Consultation"}
                                        </span>

                                        {/** Action button */}
                                        <Link
                                            href={`/doctor/consultation/${appt.id}`}
                                            className={`text-sm px-4 py-2 rounded-md text-white transition-colors ${hasConsultation
                                                ? "bg-blue-600 hover:bg-blue-700"
                                                : "bg-emerald-600 hover:bg-emerald-700"
                                                }`}
                                        >
                                            {hasConsultation ? "Continue →" : "Start →"}
                                        </Link>
                                    </div>
                                </div>

                                {/** Vitals snapshot - if already recoreded by assistant */}
                                {latestVitals && (
                                    <div className="grid grid-cols-4 gap-2 pt-3 border-t">
                                        {latestVitals.bloodPressure && (
                                            <VitalChip
                                                icon={<Heart size={11} />}
                                                label="BP"
                                                value={latestVitals.bloodPressure}
                                                color="red"
                                            />
                                        )}

                                        {latestVitals.weight && (
                                            <VitalChip
                                                icon={<Weight size={11} />}
                                                label="Weight"
                                                value={`${latestVitals.weight}kg`}
                                                color="blue"
                                            />
                                        )}
                                        {latestVitals.temperature && (
                                            <VitalChip
                                                icon={<Thermometer size={11} />}
                                                label="Temp"
                                                value={`${latestVitals.temperature}°C`}
                                                color="orange"
                                            />
                                        )}
                                        {latestVitals.pulse && (
                                            <VitalChip
                                                icon={<ActivityIcon size={11} />}
                                                label="Pulse"
                                                value={`${latestVitals.pulse}bpm`}
                                                color="purple"
                                            />
                                        )}

                                    </div>
                                )}

                            </div>

                        )
                    })}

                </div>
            )}

        </div>
    )
}

function VitalChip({ icon, label, value, color }: {
    icon: React.ReactNode
    label: string
    value: string
    color: "red" | "blue" | "orange" | "purple"
}) {
    const colors = {
        red: "bg-red-50 text-red-700",
        blue: "bg-blue-50 text-blue-700",
        orange: "bg-orange-50 text-orange-700",
        purple: "bg-purple-50 text-purple-700",
    }

    return (
        <div className={`rounded-md p-2 ${colors[color]}`}>
            <div className="flex items-center gap-1 text-xs opacity-60 mb-0.5">
                {icon} {label}
            </div>
            <p className="font-bold text-xs">{value}</p>
        </div>
    )
}