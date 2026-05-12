// app/api/ai/prescriptions/suggest/route.ts
// Called from PrescriptionBuilder when doctor clicks "AI Suggest"
// Server-side only — API key never reaches the browser

import { suggestPrescription } from "@/lib/ai/prescriptionAI";
import { getMedicines } from "@/lib/services/consultationService";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    // Must be logged in as doctor
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { diagnosis } = body

    if (!diagnosis || diagnosis.trim().length < 3) {
        return NextResponse.json(
            { error: "Please enter a diagnosis first" },
            { status: 400 }
        )
    }

    // Get available medicines from DB
    const medicines = await getMedicines()

    // Call AI
    const result = await suggestPrescription(diagnosis, medicines)

    if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ items: result.items })
}