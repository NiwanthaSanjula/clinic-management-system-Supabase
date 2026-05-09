// app/doctor/consultations/[appointmentId]/page.tsx

import PatientProfileCard from "@/components/patients/PatientProfileCard"
import { prisma } from "@/lib/prisma"
import { requireDoctor } from "@/lib/services/authService"
import { getConsultationByAppointmentId, getMedicines } from "@/lib/services/consultationService"
import { getPatientById } from "@/lib/services/patientService"
import Link from "next/link"
import { notFound } from "next/navigation"
import ConsultationForm from "./ConsultationForm"
import { ArrowLeft, Calendar, Clock } from "lucide-react"
import { updateAppointmentStatus } from "@/lib/services/appointmentService"

type Props = {
    params: Promise<{ appointmentId: string }>
}

export default async function ConsultationPage({ params }: Props) {
    await requireDoctor()

    const { appointmentId } = await params

    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        select: { patientId: true, status: true, date: true, timeSlot: true }
    })

    if (!appointment) notFound()
    // Auto-move to IN_CONSULTATION when doctor opens the page
    // This means "doctor has started seeing this patient"
    if (appointment.status === "WAITING") {
        await updateAppointmentStatus(appointmentId, "IN_CONSULTATION")
    }

    const [patient, consultation, medicines] = await Promise.all([
        getPatientById(appointment.patientId),
        getConsultationByAppointmentId(appointmentId),
        getMedicines()
    ])

    if (!patient) notFound()

    const existing = consultation ? {
        chiefComplaint: consultation.chiefComplaint,
        symptoms: consultation.symptoms,
        clinicalNotes: consultation.clinicalNotes,
        diagnosis: consultation.diagnosis,
        prescriptionNotes: consultation.prescription?.notes ?? null,
        items: (consultation.prescription?.items ?? []).map((item, i) => ({
            localId: i,
            medicineId: item.medicineId,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            quantity: item.quantity,
            instructions: item.instructions ?? "",
        }))
    } : null

    // Hide complete button if already completed
    const canComplete = appointment.status !== "COMPLETED"

    return (
        <div className="min-h-screen bg-slate-50/60">
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

                {/* --- Top nav bar ---*/}
                <div className="flex items-center justify-between">
                    <Link
                        href="/doctor/appointments"
                        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors group"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                        Back to Queue
                    </Link>

                    {/* Appointment time badge */}
                    <div className="flex items-center gap-3">
                        {appointment.date && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <Calendar size={12} />
                                <span>{appointment.date}</span>
                            </div>
                        )}
                        {appointment.timeSlot && (
                            <div className="flex items-center gap-1.5 text-xs font-medium bg-blue-500/15 border border-blue-500/40 text-blue-500 rounded-lg px-2.5 py-1 shadow-sm">
                                <Clock size={11} />
                                <span>{appointment.timeSlot}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- Patient card --- */}
                <PatientProfileCard patient={patient} accentColor="blue" />

                {/* --- Consultation status pill (if editing) --- */}
                {existing && (
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                            Editing existing consultation
                        </span>
                    </div>
                )}

                {/* --- Form --- */}
                <ConsultationForm
                    appointmentId={appointmentId}
                    patientId={appointment.patientId}
                    medicines={medicines}
                    existing={existing}
                    canComplete={canComplete}
                />


            </div>
        </div>
    )
}