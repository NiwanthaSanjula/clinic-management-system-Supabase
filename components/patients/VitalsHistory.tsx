// components/patients/VitalsHistory.tsx
// Read-only vitals history list
// Used by: doctor profile, assistant profile, patient portal vital page

import { ActivityIcon, Heart, Thermometer, Weight } from "lucide-react"
import VitalBadge from "./VitalBadge"

type Vitals = {
    id: string
    bloodPressure: string | null
    weight: number | null
    temperature: number | null
    pulse: number | null
    notes: string | null
    recordedAt: Date
}

type Props = {
    vitals: Vitals[]
    accentColor?: "blue" | "purple"
}

const ACCENT = {
    blue: { border: "border-l-blue-500", text: "text-blue-600" },
    purple: { border: "border-l-purple-500", text: "text-purple-600" },
}

export default function VitalsHistory({ vitals, accentColor = "purple" }: Props) {
    const accent = ACCENT[accentColor]

    return (
        <div className={`bg-white rounded-lg border p-6 border-l-4 ${accent.border}`}>
            <h2 className={`font-bold mb-4 ${accent.text}`}>Vitals History</h2>

            {vitals.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">No vitals recorded yet</p>
            ) : (
                <div className="space-y-3">
                    {vitals.map((v) => (
                        <div key={v.id} className="border rounded-lg p-4 text-sm">
                            <p className="text-xs text-gray-400 mb-2">
                                {new Date(v.recordedAt).toLocaleString()}
                            </p>
                            <div className="grid grid-cols-4 gap-3">
                                {v.bloodPressure && (
                                    <VitalBadge icon={<Heart size={12} />} label="BP" value={v.bloodPressure} color="red" />
                                )}
                                {v.weight && (
                                    <VitalBadge icon={<Weight size={12} />} label="Weight" value={`${v.weight}kg`} color="blue" />
                                )}
                                {v.temperature && (
                                    <VitalBadge icon={<Thermometer size={12} />} label="Temp" value={`${v.temperature}°C`} color="orange" />
                                )}
                                {v.pulse && (
                                    <VitalBadge icon={<ActivityIcon size={12} />} label="Pulse" value={`${v.pulse}bpm`} color="purple" />
                                )}
                            </div>
                            {v.notes && (
                                <p className="text-gray-500 text-xs mt-2 italic">{v.notes}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}


        </div>
    )
}