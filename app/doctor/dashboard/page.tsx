import { requireDoctor } from "@/lib/services/authService"

export default async function DashboardPage() {
    const profile = await requireDoctor()

    return (
        <div>
            <h1 className="text-2xl font-bold">Good morning, Dr. {profile?.name}</h1>
            <p className="text-gray-500 mt-1">Doctor Dashboard — Sprint 1</p>
        </div>
    )
}