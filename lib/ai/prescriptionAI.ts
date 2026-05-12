// lib/ai/prescriptionAI.ts
// AI-powered prescription template suggestion
// Takes a diagnosis + available medicines → returns suggested prescription rows
// Doctor always reviews before applying — AI is a starting point only

import { geminiFlash } from "./gemini"

type Medicine = {
    id: string
    name: string
    genericName: string
    category: string
    unit: string
    defaultDosage: string | null
}

type SuggestedItem = {
    medicineId: string
    medicineName: string
    dosage: string
    frequency: string
    duration: string
    quantity: number
    instructions: string
}

type SuggestionResult =
    | { success: true; items: SuggestedItem[] }
    | { success: false; error: string }

export async function suggestPrescription(
    diagnosis: string,
    medicines: Medicine[]
): Promise<SuggestionResult> {
    try {
        // Build a medicine list for the AI to choose from
        // We only give it medicines that exist in our DB
        // This prevents AI from hallucinating medicines we don't stock
        const medicineList = medicines
            .map(m => `- ID:${m.id} | ${m.name} (${m.genericName}) | ${m.unit} | default: ${m.defaultDosage ?? "none"}`)
            .join("\n")

        const prompt = `
            You are a clinical assistant helping a doctor in a small dispensary clinic.
            The doctor has diagnosed a patient with: "${diagnosis}

            Below is the EXACT list of medicines available in this clinic's inventory.
            You must only suggest medicines from this list using their exact IDs

            AVAILABLE MEDICINES:
            ${medicineList}
            
            Return a JSON prescription suggestion for this diagnosis.
            Use realistic dosages, frequencies, and durations for a small clinic setting.
            Suggest 1-5 medicines maximum. Only suggest what is clinically appropriate.

            Respond ONLY with a valid JSON array. No explanation, no markdown, no backticks.
            Format:
            [
                {
                    "medicineId": "exact_id_from_list",
                    "medicineName": "name",
                    "dosage": "500mg",
                    "frequency": "Twice daily",
                    "duration": "5 days",
                    "quantity": 10,
                    "instructions": "Take after meals"
                }
            ]
            
            Frequency must be one of: "Once daily", "Twice daily", "3 times daily", 
            "4 times daily", "Every 8 hours", "Every 6 hours", "At night", "As needed"

            If you cannot suggest anything appropriate from the available medicines, 
            return an empty array: []
        `

        const result = await geminiFlash.generateContent(prompt)
        const text = result.response.text().trim()

        // Clean response - sometimes AI adds backticks despite instructions
        const cleaned = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim()

        const parsed = JSON.parse(cleaned) as SuggestedItem[]

        // Validate that all returned medicineIds actually exist in our list
        // Prevents hallucinated IDs from breaking the form
        const validIds = new Set(medicines.map(m => m.id))
        const validated = parsed.filter(item => {
            if (!validIds.has(item.medicineId)) {
                console.warn(`AI returned unknown medicineId: ${item.medicineId}`)
                return false
            }
            return true
        })

        return { success: true, items: validated }
    } catch (error) {
        console.error("Prescription AI error:", error)
        return { success: false, error: "Could not generate suggestion" }
    }


}