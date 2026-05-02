// app/(portal)/portal/profile/page.tsx
// Patient views their own profile details

import { requirePatient } from "@/lib/services/authService"
import { getPatientByAuthId } from "@/lib/services/patientService"
import Link from "next/link"
import { AlertTriangle, Calendar, Droplet, IdCard, Mail, MapPin, Phone, User } from "lucide-react"
import InfoRow from "@/components/patients/InfoRow"

export default async function PortalProfilePage() {
    const profile = await requirePatient()
    const patient = await getPatientByAuthId(profile.id)

    if (!patient) return null

    return (
        <div className="max-w-2xl mx-auto space-y-6 p-4">

            <div className="flex items-center gap-3">
                <Link href="/portal/dashboard" className="text-gray-400 hover:text-gray-600">← Back</Link>
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <User size={24} className="text-emerald-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">{profile.name}</h1>
                    <p className="text-gray-500 text-sm">NIC: {patient.nic}</p>
                </div>
            </div>

            {/* Allergy warning */}
            {patient.knownAllergies && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle size={20} className="text-red-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="font-bold text-red-700">Known Allergies</p>
                        <p className="text-red-600 text-sm mt-1">{patient.knownAllergies}</p>
                    </div>
                </div>
            )}

            {/* Details */}
            <div className="bg-white rounded-lg border p-6 border-l-4 border-l-emerald-500">
                <h2 className="font-bold text-emerald-600 mb-4">My Details</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <InfoRow icon={<Phone size={15} />} label="Phone" value={patient.phone} />
                    <InfoRow icon={<Mail size={15} />} label="Email" value={patient.email ?? "—"} />
                    <InfoRow icon={<Calendar size={15} />} label="Date of Birth"
                        value={patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : "—"} />
                    <InfoRow icon={<IdCard size={15} />} label="Gender" value={patient.gender ?? "—"} />
                    <InfoRow icon={<MapPin size={15} />} label="Address" value={patient.address ?? "—"} />
                    <InfoRow icon={<Droplet size={15} />} label="Blood Group" value={patient.bloodGroup ?? "Unknown"} />
                </div>
            </div>

            <p className="text-xs text-gray-400 text-right">
                Member since {new Date(patient.createdAt).toLocaleDateString()}
            </p>

        </div>
    )
}