// app/(portal)/portal/profile/page.tsx
// Replace entirely

import { requirePatient } from "@/lib/services/authService"
import { getPatientByAuthId } from "@/lib/services/patientService"
import Link from "next/link"
import { AlertTriangle, Calendar, Droplet, IdCard, MapPin, Phone, User, Mail } from "lucide-react"
import InfoRow from "@/components/patients/InfoRow"
import EditProfileForm from "./EditProfileForm"

export default async function PortalProfilePage() {
    const profile = await requirePatient()
    const patient = await getPatientByAuthId(profile.id)

    if (!patient) return null

    return (
        <div className="space-y-4">

            <div className="flex flex-col gap-1">
                <Link href="/portal/dashboard"
                    className="text-gray-400 hover:text-gray-600 text-sm">
                    ← Back
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100
                        flex items-center justify-center">
                        <User size={24} className="text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">{profile.name}</h1>
                        <p className="text-gray-500 text-sm">NIC: {patient.nic}</p>
                    </div>
                </div>
            </div>

            {/* Allergy warning */}
            {patient.knownAllergies && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg
                    p-4 flex items-start gap-3">
                    <AlertTriangle size={20} className="text-red-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="font-bold text-red-700">Known Allergies</p>
                        <p className="text-red-600 text-sm mt-1">
                            {patient.knownAllergies}
                        </p>
                    </div>
                </div>
            )}

            {/* Read-only info */}
            <div className="bg-white rounded-lg border p-5
                border-l-4 border-l-emerald-500">
                <h2 className="font-bold text-emerald-600 mb-4 text-sm">
                    My Details
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <InfoRow icon={<Calendar size={15} />} label="Date of Birth"
                        value={patient.dateOfBirth
                            ? new Date(patient.dateOfBirth).toLocaleDateString()
                            : "—"} />
                    <InfoRow icon={<IdCard size={15} />} label="Gender"
                        value={patient.gender ?? "—"} />
                    <InfoRow icon={<Droplet size={15} />} label="Blood Group"
                        value={patient.bloodGroup ?? "Unknown"} />
                    <InfoRow icon={<IdCard size={15} />} label="NIC"
                        value={patient.nic} />
                </div>
            </div>

            {/* Editable info */}
            <div className="bg-white rounded-lg border p-5
                border-l-4 border-l-blue-500">
                <h2 className="font-bold text-blue-600 mb-4 text-sm">
                    Contact Details
                    <span className="text-gray-400 font-normal ml-1">(editable)</span>
                </h2>
                <EditProfileForm
                    defaultValues={{
                        phone: patient.phone,
                        address: patient.address ?? "",
                        email: patient.email ?? "",
                    }}
                />
            </div>

            <p className="text-xs text-gray-400 text-right">
                Member since {new Date(patient.createdAt).toLocaleDateString()}
            </p>
        </div>
    )
}