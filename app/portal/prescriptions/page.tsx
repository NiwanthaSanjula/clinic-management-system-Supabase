// app/portal/prescriptions/page.tsx
// Patient views all their prescriptions
// Read only — no actions


import { requirePatient } from "@/lib/services/authService"
import { getPatientPrescriptions } from "@/lib/services/consultationService"
import Link from "next/link"
import { FileText, Pill, Calendar } from "lucide-react"

// Prescription status display config
const STATUS_CONFIG = {
    PENDING: {
        label: "Pending",
        color: "bg-yellow-50 text-yellow-700 border-yellow-200"
    },
    DISPENSED: {
        label: "Dispensed",
        color: "bg-green-50 text-green-700 border-green-200"
    },
    PARTIAL: {
        label: "Partial",
        color: "bg-blue-50 text-blue-700 border-blue-200"
    },
}

export default async function PortalPrescriptionsPage() {
    const profile = await requirePatient()
    const prescriptions = await getPatientPrescriptions(profile.id)

    return (
        <div className="max-w-2xl mx-auto space-y-4 p-4">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <Link href="/portal/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">
                    ← Back
                </Link>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText size={24} className="text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">My Prescriptions</h1>
                        <p className="text-gray-500 text-sm">
                            {prescriptions.length} prescription{prescriptions.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
            </div>

            {/* Empty state */}
            {prescriptions.length === 0 && (
                <div className="bg-white rounded-lg border p-12 text-center text-gray-400">
                    <Pill size={32} className="mx-auto mb-3 opacity-30" />
                    <p>No prescriptions yet</p>
                    <p className="text-xs mt-1">
                        Prescriptions from your visits will appear here
                    </p>
                </div>
            )}

            {/* Prescription cards */}
            <div className="space-y-4">
                {prescriptions.map((rx) => {
                    const status = STATUS_CONFIG[rx.status as keyof typeof STATUS_CONFIG]
                    const visitDate = rx.consultation.appointment.date

                    return (
                        <div
                            key={rx.id}
                            className="bg-white rounded-lg border overflow-hidden"
                        >
                            {/* Card header */}
                            <div className="p-4 flex items-center justify-between border-b bg-gray-50">
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar size={14} className="text-gray-400" />
                                    <span className="font-medium">
                                        {new Date(visitDate).toLocaleDateString("en-GB", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric"
                                        })}
                                    </span>
                                    <span className="text-gray-400">·</span>
                                    <span className="text-gray-500">
                                        {rx.consultation.diagnosis}
                                    </span>
                                </div>

                                {/* Status badge */}
                                <span className={`text-xs px-2 py-1 rounded-full border font-medium ${status.color}`}>
                                    {status.label}
                                </span>
                            </div>

                            {/* Medicine items */}
                            <div className="divide-y">
                                {rx.items.map((item) => (
                                    <div key={item.id} className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {item.medicine.name}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {item.medicine.genericName}
                                                </p>
                                            </div>
                                            <Pill size={14} className="text-gray-300 mt-0.5" />
                                        </div>

                                        {/* Dosage details */}
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <Tag value={item.dosage} />
                                            <Tag value={item.frequency} />
                                            <Tag value={item.duration} />
                                        </div>

                                        {/* Instructions */}
                                        {item.instructions && (
                                            <p className="text-xs text-gray-400 italic mt-2">
                                                {item.instructions}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Prescription notes */}
                            {rx.notes && (
                                <div className="px-4 py-3 border-t bg-blue-50">
                                    <p className="text-xs text-blue-700 italic">
                                        <span className="font-semibold text-gray-800">Doctor's note:</span> {rx.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>


        </div>
    )



}

function Tag({ value }: { value: string }) {
    return (
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
            {value}
        </span>
    )
}