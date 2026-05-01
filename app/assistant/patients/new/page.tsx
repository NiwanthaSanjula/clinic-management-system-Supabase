// app/(assistant)/assistant/patients/new/page.tsx
import { createPatientAction } from "./action"
import PatientForm from "@/components/patients/PatientForm"

export default function NewPatientPage() {
    return (
        <PatientForm
            mode="create"
            backHref="/assistant/patients"
            action={createPatientAction}
        />
    )
}