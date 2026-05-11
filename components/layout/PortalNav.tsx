// components/layout/PortalNav.tsx
// Top navigation bar for patient portal
// Kept simple — patients are non-technical users
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
    HeartPulse, LayoutDashboard, Activity,
    FileText, CreditCard, User, LogOut
} from "lucide-react"
import { useState } from "react"

const NAV_ITEMS = [
    { label: "Home", href: "/portal/dashboard", icon: <LayoutDashboard size={15} /> },
    { label: "Vitals", href: "/portal/vitals", icon: <Activity size={15} /> },
    { label: "Prescriptions", href: "/portal/prescriptions", icon: <FileText size={15} /> },
    { label: "Payments", href: "/portal/payments", icon: <CreditCard size={15} /> },
    { label: "Profile", href: "/portal/profile", icon: <User size={15} /> },
]

type Props = { userName: string }

export default function PortalNav({ userName }: Props) {
    const pathname = usePathname()
    const router = useRouter()
    const [showMenu, setShowMenu] = useState(false)

    async function handleLogout() {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/login")
    }

    return (
        <header className="bg-white border-b sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-14">

                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <HeartPulse size={20} className="text-emerald-500" />
                        <span className="font-bold text-gray-800 text-sm">My Health</span>
                    </div>

                    {/* Nav links — hidden on mobile */}
                    <nav className="hidden md:flex items-center gap-1">
                        {NAV_ITEMS.map(item => {
                            const isActive = pathname.startsWith(item.href)
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                        text-xs font-medium transition-colors
                                        ${isActive
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                                        }`}
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* User + logout */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 hidden md:block">
                            {userName}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1 text-xs text-gray-400
                                hover:text-red-500 transition-colors px-2 py-1.5 rounded-lg
                                hover:bg-red-50"
                        >
                            <LogOut size={14} />
                            <span className="hidden md:block">Logout</span>
                        </button>
                    </div>
                </div>

                {/* Mobile nav — scrollable row */}
                <nav className="md:hidden flex items-center gap-1 pb-2 overflow-x-auto">
                    {NAV_ITEMS.map(item => {
                        const isActive = pathname.startsWith(item.href)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                    text-xs font-medium whitespace-nowrap transition-colors
                                    ${isActive
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "text-gray-500 hover:bg-gray-50"
                                    }`}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </header>
    )
}