// app/assistant/patients/[id]/vitals/action.ts
"use server"

import { requireAssistant } from "@/lib/services/authService"
import { recordVitals } from "@/lib/services/patientService"
import { ActionState, getErrorMessage } from "@/lib/utils/actionError"
import { vitalsSchema } from "@/lib/validation/patient"
import { revalidatePath } from "next/cache"

export async function recordVitalsAction(
    patientId: string,
    prevState: { error: string } | null,
    formData: FormData
): Promise<ActionState> {



    const raw = {
        bloodPressure: formData.get("bloodPressure"),
        weight: formData.get("weight"),
        temperature: formData.get("temperature"),
        pulse: formData.get("pulse"),
        notes: formData.get("notes"),
    }

    const result = vitalsSchema.safeParse(raw)
    if (!result.success) return { error: result.error.issues[0].message }

    const d = result.data

    // At least one vital must bee entered
    if (!d.bloodPressure && !d.weight && !d.temperature && !d.pulse) {
        return { error: "Please enter at least one vital" }
    }

    try {
        const assistant = await requireAssistant()

        await recordVitals({
            patientId,
            recordedBy: assistant.id,
            bloodPressure: d.bloodPressure || undefined,
            weight: d.weight ? parseFloat(d.weight) : undefined,
            temperature: d.temperature ? parseFloat(d.temperature) : undefined,
            pulse: d.pulse ? parseInt(d.pulse) : undefined,
            notes: d.notes || undefined,
        })
    } catch (error) {
        return { error: getErrorMessage(error) }
    }



    // Refresh the patient profile page
    revalidatePath(`/assistant/patients/${patientId}`)
    return null
}
