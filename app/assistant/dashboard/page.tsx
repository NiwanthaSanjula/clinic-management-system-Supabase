import { requireAssistant } from "@/lib/services/authService"

export default async function AssistantDashboard() {
  const profile = await requireAssistant()

  return (
    <div>
      <h1 className="text-2xl font-bold">Hello, {profile.name}</h1>
      <p className="text-gray-500 mt-1">Assistant Dashboard</p>
    </div>
  )
}