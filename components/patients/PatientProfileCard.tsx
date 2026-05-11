// components/patients/PatientProfileCard.tsx
// Shared across assistant, doctor, and patient portal profile pages
// Shows: allergy warning, basic info grid
// No actions here — parent page adds role-specific buttons

import {
    AlertTriangle, Calendar, Droplet,
    IdCard, Mail, MapPin, Phone, User
} from "lucide-react"
import InfoRow from "./InfoRow"

type Patient = {
    nic: string
    phone: string
    email: string | null
    dateOfBirth: Date | null
    gender: string | null
    address: string | null
    bloodGroup: string | null
    knownAllergies: string | null
    createdAt: Date
    profile: { name: string }
}

type Props = {
    patient: Patient
    accentColor?: "emerald" | "blue" | "teal"
}

const ACCENT = {
    emerald: {
        avatar: "bg-emerald-50 text-emerald-600 ring-emerald-100",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
        sectionLabel: "text-emerald-600",
    },
    blue: {
        avatar: "bg-blue-50 text-blue-600 ring-blue-100",
        badge: "bg-blue-50 text-blue-700 border-blue-100",
        sectionLabel: "text-blue-600",
    },
    teal: {
        avatar: "bg-teal-50 text-teal-600 ring-teal-100",
        badge: "bg-teal-50 text-teal-700 border-teal-100",
        sectionLabel: "text-teal-600",
    },
}

export default function PatientProfileCard({ patient, accentColor = "emerald" }: Props) {
    const accent = ACCENT[accentColor]

    const initials = patient.profile.name
        .split(" ")
        .map(n => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden border-l-4 border-l-emerald-500">
            {/* Top: avatar + name + NIC */}
            <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-100">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg ring-4 shrink-0 ${accent.avatar}`}>
                    {initials}
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-semibold text-slate-800 leading-tight truncate">
                        {patient.profile.name}
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">NIC: {patient.nic}</p>
                </div>
                {patient.bloodGroup && (
                    <div className={`shrink-0 text-center rounded-xl border px-3 py-2 ${accent.badge}`}>
                        <p className="text-xs font-bold leading-none">{patient.bloodGroup}</p>
                        <p className="text-[10px] mt-0.5 opacity-70">Blood</p>
                    </div>
                )}
            </div>

            {/* Allergy warning */}
            {patient.knownAllergies && (
                <div className="mx-5 mt-4 flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-3.5">
                    <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                        <AlertTriangle size={14} className="text-red-500" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-red-700 uppercase tracking-wide">Known Allergies</p>
                        <p className="text-sm text-red-600 mt-0.5">{patient.knownAllergies}</p>
                    </div>
                </div>
            )}

            {/* Info grid */}
            <div className="px-6 py-5">
                <p className={`text-[10px] font-bold uppercase tracking-wider mb-3 ${accent.sectionLabel}`}>
                    Patient Information
                </p>
                <div className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm">
                    <InfoRow icon={<Phone size={13} />} label="Phone" value={patient.phone} />
                    <InfoRow icon={<Mail size={13} />} label="Email" value={patient.email ?? "—"} />
                    <InfoRow
                        icon={<Calendar size={13} />}
                        label="Date of Birth"
                        value={patient.dateOfBirth
                            ? new Date(patient.dateOfBirth).toLocaleDateString()
                            : "—"}
                    />
                    <InfoRow icon={<IdCard size={13} />} label="Gender" value={patient.gender ?? "—"} />
                    <InfoRow icon={<MapPin size={13} />} label="Address" value={patient.address ?? "—"} />
                    <InfoRow icon={<Droplet size={13} />} label="Blood Group" value={patient.bloodGroup ?? "Unknown"} />
                </div>
            </div>
        </div>
    )
}