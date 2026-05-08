"use client"

import { useActionState, useTransition } from "react"
import { saveConsultationAction } from "./actions"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import PrescriptionBuilder from "./PrescriptionBuilder"
import { CheckCircle, Stethoscope, Pill } from "lucide-react"

type Medicine = {
    id: string
    name: string
    genericName: string
    category: string
    unit: string
    defaultDosage: string | null
}

type ExistingItem = {
    localId: number
    medicineId: string
    dosage: string
    frequency: string
    duration: string
    quantity: number
    instructions: string
}

type Props = {
    appointmentId: string
    patientId: string
    medicines: Medicine[]
    existing?: {
        chiefComplaint: string
        symptoms: string | null
        clinicalNotes: string | null
        diagnosis: string
        prescriptionNotes: string | null
        items: ExistingItem[]
    } | null
}

export default function ConsultationForm({
    appointmentId,
    patientId,
    medicines,
    existing
}: Props) {
    const [state, formAction] = useActionState(saveConsultationAction, null)
    const [pending, startTransition] = useTransition()

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        startTransition(() => formAction(formData))
    }

    return (
        <form onSubmit={onSubmit} className="space-y-5">
            <input type="hidden" name="appointmentId" value={appointmentId} />
            <input type="hidden" name="patientId" value={patientId} />

            {/* Error banner */}
            {state?.error && (
                <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-4">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-red-500 text-xs font-bold">!</span>
                    </div>
                    <p className="text-sm text-red-600">{state.error}</p>
                </div>
            )}

            {/* --- Clinical Notes --- */}
            <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                {/* Section header */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/70">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Stethoscope size={15} className="text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-blue-500">Clinical Notes</h2>
                        <p className="text-xs text-slate-400">Document findings and diagnosis</p>
                    </div>
                </div>

                <div className="px-6 py-5 space-y-4">
                    {/* Chief Complaint */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            Chief Complaint
                            <span className="text-red-400 normal-case font-normal">*</span>
                        </label>
                        <Input
                            name="chiefComplaint"
                            defaultValue={existing?.chiefComplaint}
                            placeholder="Main reason for visit, e.g. Headache for 3 days"
                            required
                            className="bg-slate-50 border-slate-200 text-sm focus:ring-blue-200 focus:border-blue-300 rounded-lg"
                        />
                    </div>

                    {/* Symptoms + Clinical Notes side by side on larger screens */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Symptoms <span className="normal-case font-normal text-slate-300">(optional)</span>
                            </label>
                            <Textarea
                                name="symptoms"
                                defaultValue={existing?.symptoms ?? ""}
                                placeholder="Describe symptoms in detail..."
                                rows={4}
                                className="bg-slate-50 border-slate-200 text-sm focus:ring-blue-200 focus:border-blue-300 rounded-lg resize-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Clinical Notes <span className="normal-case font-normal text-slate-300">(optional)</span>
                            </label>
                            <Textarea
                                name="clinicalNotes"
                                defaultValue={existing?.clinicalNotes ?? ""}
                                placeholder="Examination findings, observations..."
                                rows={4}
                                className="bg-slate-50 border-slate-200 text-sm focus:ring-blue-200 focus:border-blue-300 rounded-lg resize-none"
                            />
                        </div>
                    </div>

                    {/* Diagnosis */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            Diagnosis
                            <span className="text-red-400 normal-case font-normal">*</span>
                        </label>
                        <Input
                            name="diagnosis"
                            defaultValue={existing?.diagnosis}
                            placeholder="e.g. Viral upper respiratory infection"
                            required
                            className="bg-slate-50 border-slate-200 text-sm focus:ring-blue-200 focus:border-blue-300 rounded-lg"
                        />
                    </div>
                </div>
            </section>

            {/* --- Prescription --- */}
            <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                {/* Section header */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/70">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Pill size={15} className="text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-emerald-500">Prescription</h2>
                        <p className="text-xs text-slate-400">Add medicines, or leave empty if none needed</p>
                    </div>
                </div>

                <div className="px-6 py-5 space-y-4">
                    <PrescriptionBuilder
                        medicines={medicines}
                        initialItems={existing?.items ?? []}
                    />

                    <div className="space-y-1.5 pt-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Prescription Notes <span className="normal-case font-normal text-slate-300">(optional)</span>
                        </label>
                        <Input
                            name="prescriptionNotes"
                            defaultValue={existing?.prescriptionNotes ?? ""}
                            placeholder="e.g. Review in 1 week if no improvement"
                            className="bg-slate-50 border-slate-200 text-sm focus:ring-emerald-200 focus:border-emerald-300 rounded-lg"
                        />
                    </div>
                </div>
            </section>

            {/* Save button + success state */}
            <div className="space-y-3 pb-6">
                <button
                    type="submit"
                    disabled={pending}
                    className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-sm font-semibold tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                    {pending ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            Saving consultation...
                        </span>
                    ) : "Save Consultation"}
                </button>

                {state === null && (
                    <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
                        <CheckCircle size={15} className="text-emerald-500" />
                        <span className="text-sm font-medium text-emerald-600">Saved successfully</span>
                    </div>
                )}
            </div>
        </form>
    )
}