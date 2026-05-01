// app/assistant/patients/[id]/edit/page.tsx

import { requireAssistant } from "@/lib/services/authService"
import { getPatientById } from "@/lib/services/patientService"
import { notFound } from "next/navigation"
import PatientForm from "@/components/patients/PatientForm"
import { updatePatientAction } from "./action"

type Props = {
    params: Promise<{ id: string }>
}

export default async function EditPatientPage({ params }: Props) {
    await requireAssistant();

    const { id } = await params;
    const patient = await getPatientById(id);
    if (!patient) notFound();

    // pre-fill form with patient data
    const defaultValues = {
        name: patient.profile.name,
        nic: patient.nic,
        phone: patient.phone,
        email: patient.email ?? "",
        dateOfBirth: patient.dateOfBirth
            ? new Date(patient.dateOfBirth).toISOString().split("T")[0]
            : "",
        gender: (patient.gender as "MALE" | "FEMALE") ?? undefined,
        address: patient.address ?? "",
        bloodGroup: (patient.bloodGroup as "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | "") ?? "",
        knownAllergies: patient.knownAllergies ?? "",
    }

    // Bind the patient ID to the action
    const boundAction = updatePatientAction.bind(null, id);

    return (
        <PatientForm
            mode="edit"
            backHref={`/assistant/patients/${id}`}
            defaultValues={defaultValues}
            action={boundAction}
        />
    )
}