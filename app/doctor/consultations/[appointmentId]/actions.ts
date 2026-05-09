"use server"

import { prisma } from "@/lib/prisma"
import { updateAppointmentStatus } from "@/lib/services/appointmentService"
import { requireDoctor } from "@/lib/services/authService"
import { saveConsultation, savePrescription } from "@/lib/services/consultationService"
import { ActionState, getErrorMessage } from "@/lib/utils/actionError"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import z from "zod"

const consultationSchema = z.object({
    appointmentId: z.string().min(1),
    patientId: z.string().min(1),
    chiefComplaint: z.string().min(1, "Chief Complaint is required"),
    symptoms: z.string().optional(),
    clinicalNotes: z.string().optional(),
    diagnosis: z.string().min(1, "Diagnosis is required"),
    prescriptionNotes: z.string().optional(),
    // "save" = stay on page | "complete" = complete visit + redirect
    intent: z.enum(["save", "complete"]).default("save"),
})

// Each prescription item comes as indexed form fields
// e.g. items[0][medicineId], items[0][dosage], etc...
function extractPrescriptionItems(formData: FormData) {
    const items = []
    let index = 0

    // Keep reading items untill no medicineId found for that index
    while (formData.get(`items[${index}][medicineId]`)) {
        items.push({
            medicineId: formData.get(`items[${index}][medicineId]`) as string,
            dosage: formData.get(`items[${index}][dosage]`) as string,
            frequency: formData.get(`items[${index}][frequency]`) as string,
            duration: formData.get(`items[${index}][duration]`) as string,
            quantity: parseInt(formData.get(`items[${index}][quantity]`) as string) || 1,
            instructions: formData.get(`items[${index}][instructions]`) as string || undefined,

        })
        index++
    }
    return items
}


export async function saveConsultationAction(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const result = consultationSchema.safeParse({
        appointmentId: formData.get("appointmentId"),
        patientId: formData.get("patientId"),
        chiefComplaint: formData.get("chiefComplaint"),
        symptoms: formData.get("symptoms"),
        clinicalNotes: formData.get("clinicalNotes"),
        diagnosis: formData.get("diagnosis"),
        prescriptionNotes: formData.get("prescriptionNotes"),
    })

    if (!result.success) {
        return { error: result.error.issues[0].message }
    }

    const d = result.data

    try {
        const doctor = await requireDoctor()

        // Save consultation notes
        const consultation = await saveConsultation({
            appointmentId: d.appointmentId,
            patientId: d.patientId,
            doctorId: doctor.id,
            chiefComplaint: d.chiefComplaint,
            symptoms: d.symptoms,
            clinicalNotes: d.clinicalNotes,
            diagnosis: d.diagnosis
        })

        // Save prescrioptions if any items are added
        const items = extractPrescriptionItems(formData)
        if (items.length > 0) {
            await savePrescription({
                consultationId: consultation.id,
                patientId: d.patientId,
                doctorId: doctor.id,
                notes: d.prescriptionNotes,
                items,
            })
        }

        // If intent is "complete" → mark appointment done + generate invoice
        if (d.intent === "complete") {
            await updateAppointmentStatus(d.appointmentId, "COMPLETED")
            // redirect is outside try/catch — Next.js requires this
        }

        // Refresh both doctor pages
        revalidatePath("/doctor/appointments")
        revalidatePath(`/doctor/consultations/${d.appointmentId}`)

    } catch (error) {
        return { error: getErrorMessage(error) }
    }

    // Redirect to queue only when completing
    if (result.data.intent === "complete") {
        redirect("/doctor/appointments")
    }

    return null // null = success, stay on page so doctor can continue editing

}

export async function completeAppointmentAction(appointmentId: string) {
    try {
        await requireDoctor()

        // Must have a saved consultation before completing
        const consultation = await prisma.consultation.findUnique({
            where: { appointmentId }
        })

        if (!consultation) {
            return { error: "Please save the consultation notes before completing" }
        }

        await updateAppointmentStatus(appointmentId, "COMPLETED")
        revalidatePath("/doctor/appointments")

    } catch (error) {
        return { error: getErrorMessage(error) }
    }

    // Redirect back to queue after completing
    redirect("/doctor/appointments")
}

