// app/api/ai/visits/summary/route.ts
// Generates patient-friendly summary for a specific consultation
// Called lazily — only when patient expands a visit in the timeline

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { generateVisitSummary } from "@/lib/ai/summaryAI"

export async function GET(request: NextRequest) {
    // Must be logged in
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const consultationId = request.nextUrl.searchParams.get("consultationId")
    if (!consultationId) {
        return NextResponse.json({ error: "consultationId required" }, { status: 400 })
    }

    // Load consultation with prescription
    const consultation = await prisma.consultation.findUnique({
        where: { id: consultationId },
        include: {
            prescription: {
                include: {
                    items: {
                        include: {
                            medicine: { select: { name: true } }
                        }
                    }
                }
            }
        }
    })

    if (!consultation) {
        return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // Security — patient can only get summary for their own visits
    if (consultation.patientId !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const result = await generateVisitSummary({
        chiefComplaint: consultation.chiefComplaint,
        diagnosis: consultation.diagnosis,
        symptoms: consultation.symptoms,
        clinicalNotes: consultation.clinicalNotes,
        prescriptionItems: (consultation.prescription?.items ?? []).map(item => ({
            medicineName: item.medicine.name,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            instructions: item.instructions,
        }))
    })

    if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ summary: result.summary })
}