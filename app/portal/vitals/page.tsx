// app/portal/vitals/page.tsx
// Patient views their full vitals history

import { requirePatient } from "@/lib/services/authService"
import { getPatientVitals } from "@/lib/services/patientService"
import Link from "next/link"
import { ActivityIcon, Heart, Thermometer, Weight } from "lucide-react"
import VitalBadge from "@/components/patients/VitalBadge"

export default async function PortalVitalsPage() {
    const profile = await requirePatient()
    const vitals = await getPatientVitals(profile.id)

    return (
        <div className="max-w-2xl mx-auto space-y-4 p-4">

            <div className="flex flex-col gap-3 ">
                <Link href="/portal/dashboard" className="text-gray-400 hover:text-gray-600">← Back</Link>
                <div>
                    <h1 className="text-2xl font-bold">My Vitals</h1>
                    <p className="text-gray-500 text-sm">{vitals.length} recordings</p>
                </div>
            </div>

            {vitals.length === 0 ? (
                <div className="bg-white rounded-lg border p-12 text-center text-gray-400">
                    <ActivityIcon size={32} className="mx-auto mb-3 opacity-30" />
                    <p>No vitals recorded yet</p>
                    <p className="text-xs mt-1">Your clinic will record these during your visit</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {vitals.map((v) => (
                        <div key={v.id} className="bg-white rounded-lg border p-4">
                            <p className="text-xs text-gray-400 mb-3">
                                {new Date(v.recordedAt).toLocaleString()}
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                {v.bloodPressure && (
                                    <VitalBadge icon={<Heart size={12} />} label="Blood Pressure" value={v.bloodPressure} color="red" />
                                )}
                                {v.weight && (
                                    <VitalBadge icon={<Weight size={12} />} label="Weight" value={`${v.weight}kg`} color="blue" />
                                )}
                                {v.temperature && (
                                    <VitalBadge icon={<Thermometer size={12} />} label="Temperature" value={`${v.temperature}°C`} color="orange" />
                                )}
                                {v.pulse && (
                                    <VitalBadge icon={<ActivityIcon size={12} />} label="Pulse" value={`${v.pulse}bpm`} color="purple" />
                                )}
                            </div>
                            {v.notes && (
                                <p className="text-gray-500 text-xs mt-3 italic">{v.notes}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}

        </div>
    )
}