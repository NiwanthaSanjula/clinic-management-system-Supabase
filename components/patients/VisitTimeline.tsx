// components/patients/VisitTimeline.tsx
// Shows full visit history for a patient as a vertical timeline
// Used by: assistant profile, doctor profile, patient portal
// role prop controls what details are shown

import { Calendar, Clock, Pill, ChevronDown, Stethoscope } from "lucide-react"

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
    role: "DOCTOR" | "ASSISTANT" | "PATIENT"
}

export default function VisitTimeline({ visits, role }: Props) {
    if (visits.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-slate-50/70">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Clock size={13} className="text-slate-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-slate-800">Visit History</h2>
                        <p className="text-xs text-slate-400">0 visits recorded</p>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                        <Calendar size={16} className="text-slate-300" />
                    </div>
                    <p className="text-sm font-medium text-slate-400">No completed visits yet</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Section header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-emerald-600">
                <div className="w-7 h-7 rounded-lg bg-emerald-300 flex items-center justify-center">
                    <Clock size={13} className="text-emerald-500" />
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-white">Visit History</h2>
                    <p className="text-xs text-gray-200">
                        {visits.length} visit{visits.length !== 1 ? "s" : ""} recorded
                    </p>
                </div>
            </div>

            {/* Timeline */}
            <div className="px-4 py-4">
                <div className="relative">
                    {/* Vertical line — aligned with the dot column (date col w-14 = 56px + pr-3 = ~68px) */}
                    <div className="absolute left-[68px] top-3 bottom-3 w-px bg-slate-100" />

                    <div className="space-y-3">
                        {visits.map((visit, index) => (
                            <VisitCard
                                key={visit.id}
                                visit={visit}
                                role={role}
                                isLast={index === visits.length - 1}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function VisitCard({ visit, role, isLast }: { visit: Visit; role: Props["role"]; isLast: boolean }) {
    const consultation = visit.consultation
    const prescription = consultation?.prescription ?? null
    const hasConsultation = !!consultation

    return (
        <details className="group relative">
            {/* summary = trigger row only */}
            <summary className="list-none cursor-pointer">
                <div className="flex items-start gap-3">
                    {/* Left: date column — compact */}
                    <div className="shrink-0 w-14 text-right pr-3 pt-2">
                        <p className="text-[11px] font-bold text-slate-700 leading-tight">{formatShortDate(visit.date)}</p>
                        {visit.timeSlot && (
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{visit.timeSlot}</p>
                        )}
                    </div>

                    {/* Timeline dot */}
                    <div className="shrink-0 relative z-10 mt-2.5">
                        <div className={`w-2.5 h-2.5 rounded-full border-2 transition-colors
                            ${hasConsultation
                                ? "bg-indigo-500 border-indigo-500 group-open:bg-indigo-600"
                                : "bg-slate-200 border-slate-300"
                            }`}
                        />
                    </div>

                    {/* Right: visit card header */}
                    <div className={`flex-1 min-w-0 rounded-xl border transition-all mb-1
                        ${hasConsultation
                            ? "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                            : "border-slate-100 bg-slate-50"
                        }`}
                    >
                        <div className="flex items-center justify-between px-3 py-2.5 gap-2">
                            <div className="min-w-0 flex-1">
                                {hasConsultation ? (
                                    <>
                                        <p className="text-sm font-semibold text-slate-700 truncate leading-tight">
                                            {consultation.diagnosis}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                                            {consultation.chiefComplaint}
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-sm text-slate-300 italic">No consultation recorded</p>
                                )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                                {prescription && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
                                        <Pill size={9} />
                                        {prescription.items.length}
                                    </span>
                                )}
                                {hasConsultation && (
                                    <ChevronDown
                                        size={13}
                                        className="text-slate-300 transition-transform group-open:rotate-180"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </summary>

            {/* Expanded detail */}
            {hasConsultation && (
                <div className="flex items-start gap-3 mt-1">
                    {/* Spacer: matches date col + gap + dot */}
                    <div className="shrink-0 w-14" />
                    <div className="shrink-0 w-2.5" />
                    <div className="flex-1 min-w-0 ml-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-3.5 space-y-3 mb-1">

                        {consultation.symptoms && (
                            <InfoBlock label="Symptoms" value={consultation.symptoms} />
                        )}

                        {consultation.clinicalNotes && (
                            <InfoBlock label="Clinical Notes" value={consultation.clinicalNotes} />
                        )}

                        <InfoBlock label="Diagnosis" value={consultation.diagnosis} />

                        {prescription && prescription.items.length > 0 && (
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <Pill size={10} />
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
                </div>
            )}
        </details>
    )
}

// "2026-05-08" -> "8 May\n2026"
function formatShortDate(dateStr: string) {
    const d = new Date(dateStr)
    const day = d.getDate()
    const month = d.toLocaleDateString("en-GB", { month: "short" })
    const year = d.getFullYear()
    return `${day} ${month} ${year}`
}

function InfoBlock({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{value}</p>
        </div>
    )
}

function Tag({ value }: { value: string }) {
    return (
        <span className="text-[10px] font-medium bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full">
            {value}
        </span>
    )
}

function PrescriptionItemRow({ item, role }: {
    item: PrescriptionItem
    role: Props["role"]
}) {
    return (
        <div className="bg-white rounded-lg border border-slate-200 px-3 py-2.5">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 leading-tight">{item.medicine.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.medicine.genericName}</p>
                </div>
                {role !== "PATIENT" && (
                    <span className="shrink-0 text-[10px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full whitespace-nowrap">
                        Qty: {item.quantity} {item.medicine.unit}
                    </span>
                )}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
                <Tag value={item.dosage} />
                <Tag value={item.frequency} />
                <Tag value={item.duration} />
            </div>
            {item.instructions && (
                <p className="text-[10px] text-slate-400 mt-1.5 italic">{item.instructions}</p>
            )}
        </div>
    )
}