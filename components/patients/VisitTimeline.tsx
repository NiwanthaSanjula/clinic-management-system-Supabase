// components/patients/VisitTimeline.tsx
// Shows full visit history for a patient
// Used by: assistant profile, doctor profile, patient portal
// role prop controls what details are shown

import { Calendar, Clock, FileText, Pill, ChevronDown } from "lucide-react"

// Type matches what getPatientVisitHistory returns
type PrescriptionItem = {
    id: string
    dosage: string
    frequency: string
    duration: string
    quantity: number
    instructions: string | null
    medicine: { name: string; genericName: string; unit: string }
}

type Consultation = {
    id: string
    chiefComplaint: string
    symptoms: string | null
    clinicalNotes: string | null
    diagnosis: string
    prescription: {
        id: string
        notes: string | null
        status: string
        items: PrescriptionItem[]
    } | null
}

type Visit = {
    id: string
    date: string
    timeSlot: string | null
    type: string
    consultation: Consultation | null
}

type Props = {
    visits: Visit[]
    // Controls visible detail level per role
    role: "DOCTOR" | "ASSISTANT" | "PATIENT"
}

export default function VisitTimeline({ visits, role }: Props) {
    if (visits.length === 0) {
        return (
            <div className="bg-white rounded-lg border p-8 text-center text-gray-400">
                <Calendar size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No completed visits yet</p>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <h2 className="font-bold text-gray-700 flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                Visit History
                <span className="text-gray-400 font-normal text-sm">
                    ({visits.length} visit{visits.length !== 1 ? "s" : ""})
                </span>
            </h2>

            {/* Timeline list */}
            <div className="space-y-3">
                {visits.map((visit) => (
                    <VisitCard
                        key={visit.id}
                        visit={visit}
                        role={role}
                    />
                ))}
            </div>
        </div>
    )
}

function VisitCard({ visit, role }: { visit: Visit; role: Props["role"] }) {
    const consultation = visit.consultation
    const prescription = consultation?.prescription ?? null
    const hasConsultation = !!consultation

    return (
        <details className="group bg-white rounded-lg border overflow-hidden">
            {/* Summary row - always visible, click to expand */}
            <summary className="flex items-center justify-between p-4 cursor-pointer list-none
                hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">

                    <div className="bg-blue-50 text-blue-700 border border-blue-100 rounded-md px-3 py-1.5 text-center min-w-[80px]">
                        {/* Date badge */}
                        <p className="font-bold text-sm">{formatDate(visit.date)}</p>
                        {visit.timeSlot && (
                            <p className="text-xs opacity-70">{visit.timeSlot}</p>
                        )}
                    </div>

                    <div>
                        {hasConsultation ? (
                            <>
                                {/* Show diagnosis prominently */}
                                <p className="font-medium text-sm">{consultation.diagnosis}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {consultation.chiefComplaint}
                                </p>

                            </>
                        ) : (
                            <p className="text-sm text-gray-400 italic">No consultation recorded</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/** Prescription indicator */}
                    {prescription && (
                        <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">
                            {prescription.items.length} medicine{prescription.items.length !== 1 ? "s" : ""}

                        </span>
                    )}
                    {/* Expand arrow - rotate when open */}
                    <ChevronDown
                        size={16}
                        className="text-gray-400 transition-transform group-open:rotate-180"
                    />
                </div>
            </summary>

            {/** Expanded content */}
            {hasConsultation && (
                <div className="border-t p-4 space-y-4 bg-gray-50">

                    {/* Symptoms — doctor and assistant see full clinical detail */}
                    {consultation.symptoms && (
                        <InfoBlock label="Symptoms" value={consultation.symptoms} />
                    )}

                    {/* Clinical notes — doctor and assistant only */}
                    {consultation.clinicalNotes && (
                        <InfoBlock label="Clinical Notes" value={consultation.clinicalNotes} />
                    )}

                    {/* Diagnosis — all roles */}
                    <InfoBlock label="Diagnosis" value={consultation.diagnosis} />

                    {/* Prescription items */}
                    {prescription && prescription.items.length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                                <Pill size={12} />
                                Prescription
                            </p>

                            <div className="space-y-2">
                                {prescription.items.map((item) => (
                                    <PrescriptionItemRow
                                        key={item.id}
                                        item={item}
                                        role={role}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

        </details>
    )
}

// Reusable pieces inside this file____________________________________________________________________________________________

// "2026-05-08" -> "May 8, 2026"
function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
    })
}

function InfoBlock({ label, value }: { label: string, value: string }) {
    return (
        <div>
            <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{value}</p>
        </div>
    )
}

function Tag({ value }: { value: string }) {
    return (
        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
            {value}
        </span>
    )
}

function PrescriptionItemRow({ item, role }: {
    item: PrescriptionItem
    role: Props["role"]
}) {
    return (
        <div className="bg-white rounded border p-3 text-sm">
            <div>
                <div>
                    <p className="font-medium">{item.medicine.name}</p>
                    <p className="text-xs text-gray-400">{item.medicine.genericName}</p>
                </div>
                {/* Quantity — staff sees it, patient doesn't need to */}
                {role !== "PATIENT" && (
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                        Qty: {item.quantity} {item.medicine.unit}
                    </span>
                )}
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
                <Tag value={item.dosage} />
                <Tag value={item.frequency} />
                <Tag value={item.duration} />
            </div>

            {item.instructions && (
                <p className="text-xs text-gray-400 mt-1 italic">{item.instructions}</p>
            )}

        </div>
    )
}