// components/patients/VitalBadge.tsx
// Reused in both doctor and assistant patient profile pages

type Props = {
    icon: React.ReactNode
    label: string
    value: string
    color: "red" | "blue" | "orange" | "purple"
}

const colors = {
    red: "bg-red-50 text-red-700",
    blue: "bg-blue-50 text-blue-700",
    orange: "bg-orange-50 text-orange-700",
    purple: "bg-purple-50 text-purple-700",
}

export default function VitalBadge({ icon, label, value, color }: Props) {
    return (
        <div className={`rounded-md p-2 ${colors[color]}`}>
            <div className="flex items-center gap-1 text-xs opacity-70">{icon}{label}</div>
            <p className="font-bold text-sm mt-0.5">{value}</p>
        </div>
    )
}