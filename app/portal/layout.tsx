// app/(portal)/layout.tsx
// Portal has a top nav bar instead of sidebar
// Simpler — patients use this on mobile too

import { requirePatient } from "@/lib/services/authService"
import PortalNav from "@/components/layout/PortalNav"

export default async function PortalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const profile = await requirePatient()

    return (
        <div className="min-h-screen bg-gray-50">
            <PortalNav userName={profile.name} />
            <main className="max-w-7xl mx-auto px-4 py-6">
                {children}
            </main>
        </div>
    )
}