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
    canComplete: boolean
}

export default function ConsultationForm({
    appointmentId,
    patientId,
    medicines,
    existing,
    canComplete
}: Props) {
    const [state, formAction] = useActionState(saveConsultationAction, null)
    const [pending, startTransition] = useTransition()

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
        if (submitter?.name) {
            formData.append(submitter.name, submitter.value)
        }
        startTransition(() => formAction(formData))
    }

    return (
        <form onSubmit={onSubmit} className="space-y-5">
            <input type="hidden" name="appointmentId" value={appointmentId} />
            <input type="hidden" name="patientId" value={patientId} />


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

                {/* Error banner */}
                {state?.error && (
                    <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-4">
                        <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-red-500 text-xs font-bold">!</span>
                        </div>
                        <p className="text-sm text-red-600">{state.error}</p>
                    </div>
                )}

                {/* Two buttons — same form, different intent value */}
                <div className="flex gap-3">
                    <button
                        type="submit"
                        name="intent"
                        value="save"
                        disabled={pending}
                        className="flex-1 py-3.5 rounded-xl border border-slate-200 bg-white
                                 hover:bg-slate-50 text-slate-700 text-sm font-semibold
                                  transition-all disabled:opacity-40"
                    >
                        {pending ? "Saving..." : "Save Draft"}
                    </button>

                    {/* Only show complete button if visit not already completed */}
                    {canComplete && (
                        <button
                            type="submit"
                            name="intent"
                            value="complete"
                            disabled={pending}
                            className="flex-1 py-3.5 rounded-xl bg-green-600 hover:bg-green-700
                                         text-white text-sm font-semibold transition-all
                                        disabled:opacity-40 shadow-sm"
                        >
                            {pending ? "Completing..." : "Save & Complete Visit ✓"}
                        </button>
                    )}
                </div>

                {/* Saved indicator — only shows after "Save Draft" */}
                {state === null && (
                    <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
                        <CheckCircle size={15} className="text-emerald-500" />
                        <span className="text-sm font-medium text-emerald-600">
                            Draft saved — click "Save & Complete Visit" when done
                        </span>
                    </div>
                )}
            </div>
        </form>
    )
}