// app/(assistant)/assistant/patients/[id]/page.tsx
// Shows full patient details

import { requireAssistant } from "@/lib/services/authService"
import { getPatientById, getPatientVitals } from "@/lib/services/patientService"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil } from "lucide-react"
import { recordVitalsAction } from "./vitals/action"
import VitalsSection from "@/components/patients/VitalsSection"
import PatientProfileCard from "@/components/patients/PatientProfileCard"
import { getPatientVisitHistory } from "@/lib/services/consultationService"
import VisitTimeline from "@/components/patients/VisitTimeline"

type Props = {
    params: Promise<{ id: string }>
}

export default async function PatientProfilePage({ params }: Props) {
    await requireAssistant()

    const { id } = await params

    const [patient, vitals, visitHistory] = await Promise.all([
        getPatientById(id),
        getPatientVitals(id),
        getPatientVisitHistory(id)
    ])

    if (!patient) notFound()

    const boundAction = await recordVitalsAction.bind(null, id)

    return (
        <div className="min-h-screen bg-slate-50/60">
            <div className="max-w-7xl mx-auto px-4 py-6">

                {/* Two-column layout: patient info left, timeline right */}
                {/* On mobile: stacks vertically. On lg+: side by side, timeline sticky */}
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] gap-6 items-start">

                    {/* ── Left column: profile, vitals, footer ── */}
                    <div className="space-y-5">
                        {/* Top nav */}
                        <div className="flex items-center justify-between">
                            <Link
                                href="/assistant/patients"
                                className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors group"
                            >
                                <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                                Back
                            </Link>

                            <Link
                                href={`/assistant/patients/${id}/edit`}
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                            >
                                <Pencil size={13} />
                                Edit
                            </Link>
                        </div>

                        {/* Patient profile card */}
                        <PatientProfileCard patient={patient} accentColor="emerald" />

                        {/* Vitals */}
                        <VitalsSection
                            patientId={id}
                            vitals={vitals}
                            action={boundAction}
                        />

                        {/* Registered footer */}
                        <p className="text-xs text-slate-300 text-right pb-4">
                            Registered {new Date(patient.createdAt).toLocaleDateString()}
                        </p>
                    </div>

                    {/* ── Right column: visit timeline (sticky on large screens) ── */}
                    <div className="lg:sticky lg:top-6">
                        <VisitTimeline
                            visits={visitHistory}
                            role="ASSISTANT"
                        />
                    </div>

                </div>
            </div>
        </div>
    )
}