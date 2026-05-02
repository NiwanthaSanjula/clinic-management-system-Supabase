// app/(portal)/portal/dashboard/page.tsx
import LogoutButton from "@/components/layout/logout-button"
import { requirePatient } from "@/lib/services/authService"
import { getPatientByAuthId, getPatientVitals } from "@/lib/services/patientService"
import { profile } from "console"
import { ActivityIcon, AlertTriangle, CreditCard, FileText, User } from "lucide-react"
import Link from "next/link"

export default async function PortalDashboard() {
    const profile = await requirePatient()

    const [patient, vitals] = await Promise.all([
        getPatientByAuthId(profile.id),
        getPatientVitals(profile.id)
    ])

    if (!patient) return null;

    // Get most recent vitals
    const latest = vitals[0] ?? null

    return (
        <div className="max-w-2xl mx-auto space-y-6 p-4">

            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold">Welcome, {profile.name}</h1>
                <p className="text-gray-500 text-sm">Your health portal</p>
            </div>
            <LogoutButton />

            {/* Allergy warning — always visible if exists */}
            {patient.knownAllergies && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-red-700">Your Known Allergies</p>
                        <p className="text-red-600 text-sm mt-1">{patient.knownAllergies}</p>
                    </div>
                </div>
            )}

            {/* Latest vitals snapshot */}
            {latest && (
                <div className="bg-white rounded-lg border p-6 border-l-4 border-l-purple-500">

                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-bold text-purple-600">Latest Vitals</h2>
                        <Link href="/portal/vitals" className="text-xs text-blue-600 hover:underline">
                            View all →
                        </Link>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">
                        {new Date(latest.recordedAt).toLocaleString()}
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                        {latest.bloodPressure && (
                            <div className="bg-red-50 rounded p-3">
                                <p className="text-xs text-red-400">Blood Pressure</p>
                                <p className="font-bold text-red-700">{latest.bloodPressure}</p>
                            </div>
                        )}
                        {latest.weight && (
                            <div className="bg-blue-50 rounded p-3">
                                <p className="text-xs text-blue-400">Weight</p>
                                <p className="font-bold text-blue-700">{latest.weight}kg</p>
                            </div>
                        )}
                        {latest.temperature && (
                            <div className="bg-orange-50 rounded p-3">
                                <p className="text-xs text-orange-400">Temperature</p>
                                <p className="font-bold text-orange-700">{latest.temperature}°C</p>
                            </div>
                        )}
                        {latest.pulse && (
                            <div className="bg-purple-50 rounded p-3">
                                <p className="text-xs text-purple-400">Pulse</p>
                                <p className="font-bold text-purple-700">{latest.pulse}bpm</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Quick links — sections we build in later sprints */}
            <div className="grid grid-cols-2 gap-4">
                <Link href="/portal/vitals"
                    className="bg-white border rounded-lg p-4 hover:bg-gray-50 flex items-center gap-3">
                    <ActivityIcon size={20} className="text-purple-500" />
                    <div>
                        <p className="font-medium text-sm">Vitals</p>
                        <p className="text-xs text-gray-400">{vitals.length} records</p>
                    </div>
                </Link>

                <Link href="/portal/profile"
                    className="bg-white border rounded-lg p-4 hover:bg-gray-50 flex items-center gap-3">
                    <User size={20} className="text-emerald-500" />
                    <div>
                        <p className="font-medium text-sm">My Profile</p>
                        <p className="text-xs text-gray-400">View details</p>
                    </div>
                </Link>

                {/* These get built in later sprints */}
                <div className="bg-white border rounded-lg p-4 opacity-40 flex items-center gap-3">
                    <FileText size={20} className="text-blue-500" />
                    <div>
                        <p className="font-medium text-sm">Prescriptions</p>
                        <p className="text-xs text-gray-400">Coming soon</p>
                    </div>
                </div>

                <div className="bg-white border rounded-lg p-4 opacity-40 flex items-center gap-3">
                    <CreditCard size={20} className="text-amber-500" />
                    <div>
                        <p className="font-medium text-sm">Payments</p>
                        <p className="text-xs text-gray-400">Coming soon</p>
                    </div>
                </div>
            </div>


        </div>
    )
}