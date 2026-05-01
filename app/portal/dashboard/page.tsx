// app/(portal)/portal/dashboard/page.tsx
import LogoutButton from "@/components/layout/logout-button"
import { requirePatient } from "@/lib/services/authService"

export default async function PortalDashboard() {
    const patient = await requirePatient()

    return (
        <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-800">
                Welcome, {patient.name}
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Your health portal</p>
            <LogoutButton />

            {/* These sections get filled in later sprints */}
            <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="border rounded-lg p-4 text-center text-gray-400 text-sm">
                    Appointments (coming soon)
                </div>
                <div className="border rounded-lg p-4 text-center text-gray-400 text-sm">
                    Prescriptions (coming soon)
                </div>
                <div className="border rounded-lg p-4 text-center text-gray-400 text-sm">
                    Payments (coming soon)
                </div>
                <div className="border rounded-lg p-4 text-center text-gray-400 text-sm">
                    Medical History (coming soon)
                </div>
            </div>
        </div>
    )
}