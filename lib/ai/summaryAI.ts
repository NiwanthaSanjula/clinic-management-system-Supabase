// lib/ai/summaryAI.ts
// Converts clinical consultation notes into plain language
// for the patient portal visit timeline

import { geminiFlash } from "./gemini"

type ConsultationData = {
    chiefComplaint: string
    diagnosis: string
    symptoms: string | null
    clinicalNotes: string | null
    prescriptionItems: {
        medicineName: string
        dosage: string
        frequency: string
        duration: string
        instructions: string | null
    }[]
}

type SummaryResult =
    | { success: true; summary: string }
    | { success: false; error: string }

export async function generateVisitSummary(
    data: ConsultationData
): Promise<SummaryResult> {
    try {
        const prescriptionText = data.prescriptionItems.length > 0
            ? data.prescriptionItems.map(item =>
                `- ${item.medicineName} ${item.dosage}, ${item.frequency} for ${item.duration}` +
                (item.instructions ? ` (${item.instructions})` : "")
            ).join("\n")
            : "No medicines prescribed"

        const prompt = `
            You are helping a patient understand their clinic visit in simple, 
            friendly language. The patient may not have medical knowledge.

            Convert the following clinical information into a short, warm, 
            easy-to-understand summary (2-3 sentences maximum).
            Use simple everyday words. Avoid medical jargon.
            Do not add any information that isn't in the original notes.
            Do not give medical advice beyond what the doctor noted.

            CLINICAL INFORMATION:
            Chief complaint: ${data.chiefComplaint}
            Diagnosis: ${data.diagnosis}
            ${data.symptoms ? `Symptoms: ${data.symptoms}` : ""}
            ${data.clinicalNotes ? `Doctor's notes: ${data.clinicalNotes}` : ""}

            PRESCRIBED MEDICINES:
            ${prescriptionText}

            Write ONLY the patient-friendly summary. No labels, no formatting, 
            no introduction. Just the plain text summary.
        `

        const result = await geminiFlash.generateContent(prompt)
        const summary = result.response.text().trim()

        return { success: true, summary }

    } catch (error) {
        console.error("Summary AI error:", error)
        return { success: false, error: "Could not generate summary" }
    }
}