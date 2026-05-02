import VitalBadge from "@/components/patients/VitalBadge"
import { requireDoctor } from "@/lib/services/authService"
import { getPatientById, getPatientVitals } from "@/lib/services/patientService"
import { Activity, ActivityIcon, AlertTriangle, Calendar, Droplet, Heart, IdCard, Mail, MapPin, Phone, Thermometer, User, Weight } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"


type Props = {
    params: Promise<{ id: string }>
}

export default async function DoctorPatientProfilePage({ params }: Props) {
    await requireDoctor()

    const { id } = await params
    const [patient, vitals] = await Promise.all([
        getPatientById(id),
        getPatientVitals(id)
    ])

    if (!patient) notFound()

    return (
        <div className="max-w-3xl mx-auto space-y-6">

            {/* Header — no edit button */}
            <div className="flex items-center gap-3">
                <Link href="/doctor/patients" className="text-gray-400 hover:text-gray-600">← Back</Link>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User size={24} className="text-blue-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">{patient.profile.name}</h1>
                    <p className="text-gray-500 text-sm">NIC: {patient.nic}</p>
                </div>
            </div>

            {/* Allergy Warning — critical for doctor to see */}
            {patient.knownAllergies && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle size={20} className="text-red-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="font-bold text-red-700">⚠ Known Allergies</p>
                        <p className="text-red-600 text-sm mt-1">{patient.knownAllergies}</p>
                    </div>
                </div>
            )}

            {/* Basic Info */}
            <div className="bg-white rounded-lg border p-6 border-l-4 border-l-blue-500">
                <h2 className="font-bold text-blue-600 mb-4">Patient Information</h2>
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

            {/* Latest Vitals — read only, no form */}
            <div className="bg-white rounded-lg border p-6 border-l-4 border-l-purple-500">
                <h2 className="font-bold text-purple-600 mb-4">Vitals History</h2>

                {vitals.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-6">No vitals recorded yet</p>
                ) : (
                    <div className="space-y-3">
                        {vitals.map((v) => (
                            <div key={v.id} className="border rounded-lg p-4 text-sm">
                                <p className="text-xs text-gray-400 mb-2">
                                    {new Date(v.recordedAt).toLocaleString()}
                                </p>
                                <div className="grid grid-cols-4 gap-3">
                                    {v.bloodPressure && (
                                        <VitalBadge icon={<Heart size={12} />} label="BP" value={v.bloodPressure} color="red" />
                                    )}
                                    {v.weight && (
                                        <VitalBadge icon={<Weight size={12} />} label="Weight" value={`${v.weight}kg`} color="blue" />
                                    )}
                                    {v.temperature && (
                                        <VitalBadge icon={<Thermometer size={12} />} label="Temp" value={`${v.temperature}°C`} color="orange" />
                                    )}
                                    {v.pulse && (
                                        <VitalBadge icon={<ActivityIcon size={12} />} label="Pulse" value={`${v.pulse}bpm`} color="purple" />
                                    )}
                                </div>
                                {v.notes && <p className="text-gray-500 text-xs mt-2 italic">{v.notes}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    )
}


function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
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
