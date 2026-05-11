import LogoutButton from "@/components/layout/logout-button";
import Sidebar from "@/components/layout/Sidebar";
import { requireAssistant } from "@/lib/services/authService";
import { Calendar, CreditCard, LayoutDashboard, Package, Users } from "lucide-react";

// Nav items for assistant role
const NAV_ITEMS = [
    { label: "Dashboard", href: "/assistant/dashboard", icon: <LayoutDashboard size={24} /> },
    { label: "Patients", href: "/assistant/patients", icon: <Users size={24} /> },
    { label: "Appointments", href: "/assistant/appointments", icon: <Calendar size={24} /> },
    { label: "Billing", href: "/assistant/billing", icon: <CreditCard size={24} /> },
    { label: "Inventory", href: "/assistant/inventory", icon: <Package size={24} /> },
]

export default async function AssistantLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const profile = await requireAssistant()

    return (
        <div className="flex min-h-screen">
            <Sidebar
                navItems={NAV_ITEMS}
                userName={profile.name}
                userRole={profile.role}
            />

            <div className="md:ml-72 flex-1 pt-14 md:pt-0 border-l border-t md:border-t-0">
                <main className="p-4 md:p-6 max-w-7xl ">
                    {children}
                </main>
            </div>
        </div>
    )
}