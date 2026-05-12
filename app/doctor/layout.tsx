// app/(doctor)/layout.tsx
import { requireDoctor } from "@/lib/services/authService"
import Sidebar from "@/components/layout/Sidebar"
import {
    LayoutDashboard, Calendar,
    Users, Package,
    Settings,
    ScrollText
} from "lucide-react"

const NAV_ITEMS = [
    { label: "Dashboard", href: "/doctor/dashboard", icon: <LayoutDashboard size={17} /> },
    { label: "Queue", href: "/doctor/appointments", icon: <Calendar size={17} /> },
    { label: "Patients", href: "/doctor/patients", icon: <Users size={17} /> },
    { label: "Inventory", href: "/doctor/inventory", icon: <Package size={17} /> },
    { label: "Audit Log", href: "/doctor/audit", icon: <ScrollText size={17} /> },
    { label: "Settings", href: "/doctor/settings", icon: <Settings size={17} /> },
]

export default async function DoctorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const profile = await requireDoctor()

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar
                navItems={NAV_ITEMS}
                userName={profile.name}
                userRole={profile.role}
            />
            <div className="md:ml-72 flex-1 pt-14 md:pt-0 border-l border-t md:border-t-0">
                <main className="p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}