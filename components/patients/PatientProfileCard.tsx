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
    // Color theme changes per role
    // emerald = assistant, blue = doctor, teal = portal
    accentColor?: "emerald" | "blue" | "teal"
}

// Map color name to tailwind classes
// we cant use dynamic strings like `border-l-${color}-500 - tailwind wont pick them up
const ACCENT = {
    emerald: {
        border: "border-l-emerald-500",
        text: "text-emerald-600",
        avatar: "bg-emerald-100 text-emerald-600",
    },
    blue: {
        border: "border-l-blue-500",
        text: "text-blue-600",
        avatar: "bg-blue-100 text-blue-600",
    },
    teal: {
        border: "border-l-teal-500",
        text: "text-teal-600",
        avatar: "bg-teal-100 text-teal-600",
    },
}

export default function PatientProfileCard({ patient, accentColor = "emerald" }: Props) {
    const accent = ACCENT[accentColor]

    return (
        <div className="space-y-4">

            {/* Avatar + name row */}
            <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${accent.avatar}`}>
                    <User size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">{patient.profile.name}</h1>
                    <p className="text-gray-500 text-sm">NIC: {patient.nic}</p>
                </div>
            </div>

            {/* Allergy warning — shown prominently if exists */}
            {patient.knownAllergies && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle size={20} className="text-red-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="font-bold text-red-700">Known Allergies</p>
                        <p className="text-red-600 text-sm mt-1">{patient.knownAllergies}</p>
                    </div>
                </div>
            )}

            {/* Info grid */}
            <div className={`bg-white rounded-lg border p-6 border-l-4 ${accent.border}`}>
                <h2 className={`font-bold mb-4 ${accent.text}`}>Patient Information</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <InfoRow icon={<Phone size={15} />} label="Phone" value={patient.phone} />
                    <InfoRow icon={<Mail size={15} />} label="Email" value={patient.email ?? "—"} />
                    <InfoRow
                        icon={<Calendar size={15} />}
                        label="Date of Birth"
                        value={patient.dateOfBirth
                            ? new Date(patient.dateOfBirth).toLocaleDateString()
                            : "—"}
                    />
                    <InfoRow icon={<IdCard size={15} />} label="Gender" value={patient.gender ?? "—"} />
                    <InfoRow icon={<MapPin size={15} />} label="Address" value={patient.address ?? "—"} />
                    <InfoRow icon={<Droplet size={15} />} label="Blood Group" value={patient.bloodGroup ?? "Unknown"} />
                </div>
            </div>

        </div>
    )

}