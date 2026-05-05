// app/(assistant)/assistant/patients/[id]/page.tsx
// Shows full patient details

import { requireAssistant } from "@/lib/services/authService"
import { getPatientById, getPatientVitals } from "@/lib/services/patientService"
import { notFound } from "next/navigation"
import Link from "next/link"
import { User, Phone, Mail, MapPin, Droplet, AlertTriangle, Calendar, IdCard } from "lucide-react"
import { recordVitalsAction } from "./vitals/action"
import VitalsSection from "@/components/patients/VitalsSection"
import InfoRow from "@/components/patients/InfoRow"
import PatientProfileCard from "@/components/patients/PatientProfileCard"

type Props = {
    params: Promise<{ id: string }>
}

export default async function PatientProfilePage({ params }: Props) {
    await requireAssistant()

    const { id } = await params

    // fetch patient and vitals in parellel
    const [patient, vitals] = await Promise.all([
        getPatientById(id),
        getPatientVitals(id)
    ])

    // If patient doesn't exist → 404
    if (!patient) notFound()

    // Bind patient ID to the action
    const boundAction = await recordVitalsAction.bind(null, id)

    return (
        <div className="max-w-3xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">

                <Link href="/assistant/patients" className="text-gray-400 hover:text-gray-600">
                    ← Back
                </Link>

                <Link
                    href={`/assistant/patients/${id}/edit`}
                    className="text-sm border px-4 py-2 rounded-md hover:bg-gray-50"
                >
                    Edit
                </Link>
            </div>

            <PatientProfileCard patient={patient} accentColor="emerald" />

            {/* Vitals Section */}
            <VitalsSection
                patientId={id}
                vitals={vitals}
                action={boundAction}
            />

            {/* Registered */}
            <p className="text-xs text-gray-400 text-right">
                Registered: {new Date(patient.createdAt).toLocaleDateString()}
            </p>

        </div>
    )
}

