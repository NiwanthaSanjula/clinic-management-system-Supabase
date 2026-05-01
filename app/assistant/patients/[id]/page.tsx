// app/(assistant)/assistant/patients/[id]/page.tsx
// Shows full patient details

import { requireAssistant } from "@/lib/services/authService"
import { getPatientById } from "@/lib/services/patientService"
import { notFound } from "next/navigation"
import Link from "next/link"
import { User, Phone, Mail, MapPin, Droplet, AlertTriangle, Calendar, IdCard } from "lucide-react"

type Props = {
    params: Promise<{ id: string }>
}

export default async function PatientProfilePage({ params }: Props) {
    await requireAssistant()

    const { id } = await params
    const patient = await getPatientById(id)

    // If patient doesn't exist → 404
    if (!patient) notFound()

    return (
        <div className="max-w-3xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/assistant/patients" className="text-gray-400 hover:text-gray-600">
                        ← Back
                    </Link>
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <User size={24} className="text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">{patient.profile.name}</h1>
                        <p className="text-gray-500 text-sm">NIC: {patient.nic}</p>
                    </div>
                </div>
                <Link
                    href={`/assistant/patients/${id}/edit`}
                    className="text-sm border px-4 py-2 rounded-md hover:bg-gray-50"
                >
                    Edit
                </Link>
            </div>

            {/* Allergy Warning — shown prominently if exists */}
            {patient.knownAllergies && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle size={20} className="text-red-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="font-bold text-red-700">Known Allergies</p>
                        <p className="text-red-600 text-sm mt-1">{patient.knownAllergies}</p>
                    </div>
                </div>
            )}

            {/* Basic Info */}
            <div className="bg-white rounded-lg border p-6 border-l-4 border-l-emerald-500">
                <h2 className="font-bold text-emerald-600 mb-4">Basic Information</h2>
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
                    <InfoRow
                        icon={<MapPin size={15} />}
                        label="Address"
                        value={patient.address ?? "—"}
                    />
                    <InfoRow
                        icon={<Droplet size={15} />}
                        label="Blood Group"
                        value={patient.bloodGroup ?? "Unknown"}
                    />

                </div>
            </div>

            {/* Registered */}
            <p className="text-xs text-gray-400 text-right">
                Registered: {new Date(patient.createdAt).toLocaleDateString()}
            </p>

        </div>
    )
}

// Small reusable row component — only used in this file
function InfoRow({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode
    label: string
    value: string
}) {
    return (
        <div className="flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">{icon}</span>
            <div>
                <p className="text-gray-500 text-xs">{label}</p>
                <p className="font-medium">{value}</p>
            </div>
        </div>
    )
}