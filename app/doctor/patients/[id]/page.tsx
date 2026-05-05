import PatientProfileCard from "@/components/patients/PatientProfileCard"
import VitalsHistory from "@/components/patients/VitalsHistory"
import { requireDoctor } from "@/lib/services/authService"
import { getPatientById, getPatientVitals } from "@/lib/services/patientService"
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

            {/* Back only — no edit button for doctor */}
            <Link href="/doctor/patients" className="text-gray-400 hover:text-gray-600">
                ← Back
            </Link>

            {/* Shared profile card — blue theme for doctor */}
            <PatientProfileCard patient={patient} accentColor="blue" />

            {/* Doctor gets read-only vitals history */}
            <VitalsHistory vitals={vitals} accentColor="purple" />

            <p className="text-xs text-gray-400 text-right">
                Registered: {new Date(patient.createdAt).toLocaleDateString()}
            </p>

        </div>
    )
}

