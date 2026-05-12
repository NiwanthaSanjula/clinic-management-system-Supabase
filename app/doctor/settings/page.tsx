// app/(doctor)/doctor/settings/page.tsx
// Doctor manages clinic hours, slot duration, and consultation fee
import { requireDoctor } from "@/lib/services/authService"
import { getClinicSettings } from "@/lib/services/appointmentService"
import SettingsForm from "./SettingsForm"
import { Settings } from "lucide-react"

export default async function ClinicSettingsPage() {
    await requireDoctor()
    const settings = await getClinicSettings()

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <Settings size={36} className="text-blue-500" />
                <div>
                    <h1 className="text-2xl font-bold">Clinic Settings</h1>
                    <p className="text-gray-500 text-sm">
                        Manage hours, slots, and fees
                    </p>
                </div>
            </div>

            <SettingsForm settings={settings} />
        </div>
    )
}