// components/patients/InfoRow.tsx
// Reused in both doctor and assistant patient profile pages

type Props = {
    icon: React.ReactNode
    label: string
    value: string
}

export default function InfoRow({ icon, label, value }: Props) {
    return (
        <div className="flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">{icon}</span>
            <div>
                <p className="text-gray-500 text-xs">{label}</p>
                <p className="font-medium">{value}</p>
            </div>
        </div>
    )
}