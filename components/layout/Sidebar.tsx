// components/layout/Sidebar.tsx
// Shared sidebar used by both doctor and assistant layouts
// navItems prop controls what links appear per role

"use client"

import { createClient } from "@/lib/supabase/client"
import { HeartPulse, LogOut, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"

type NavItems = {
    label: string,
    href: string,
    icon: React.ReactNode
}

type Props = {
    navItems: NavItems[],
    userName: string,
    userRole: string
}

export default function Sidebar({ navItems, userName, userRole }: Props) {

    const pathname = usePathname()
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)

    // Close sidebar on route change for mobile
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    async function handleLogout() {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/login")
    }

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-emerald-950 flex items-center px-4 z-40 border-b border-emerald-900 shadow-sm">
                <button onClick={() => setIsOpen(true)} className="text-white p-1 -ml-1">
                    <Menu size={24} />
                </button>
                <div className="flex items-center gap-2 ml-3">
                    <HeartPulse size={20} className="text-emerald-500" />
                    <span className="font-bold text-lg text-white">ClinicMS</span>
                </div>
            </div>

            {/* Mobile Backdrop */}
            {isOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" 
                    onClick={() => setIsOpen(false)} 
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-linear-to-br from-emerald-950 to-emerald-900 border-r border-emerald-900 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                {/* Logo */}
                <div className="p-5 border-b border-emerald-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <HeartPulse size={22} className="text-emerald-500" />
                        <span className="font-bold text-2xl text-white">ClinicMS</span>
                    </div>
                    {/* Close button for mobile */}
                    <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-300 hover:text-white p-1">
                        <X size={20} />
                    </button>
                </div>

            {/* Nav links */}
            <nav className="flex-1 p-3 space-y-1">
                {navItems.map((item) => {
                    // Active if current path start with this href
                    const isActive = pathname.startsWith(item.href)

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                                font-medium transition-colors
                                ${isActive
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "text-gray-200 hover:bg-emerald-800 hover:text-white"
                                }`}
                        >
                            <span className={isActive ? "text-emerald-600" : "text-gray-200"}>
                                {item.icon}
                            </span>
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            {/* User info + logout at bottom */}
            <div className="p-4 border-t space-y-3">
                <div className="px-2">
                    <p className="text-sm font-medium text-gray-300 truncate">{userName}</p>
                    <p className="text-xs text-gray-400 capitalize">{userRole.toLowerCase()}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg
                        text-sm text-red-500 hover:bg-red-50 hover:text-red-600
                        transition-colors"
                >
                    <LogOut size={15} />
                    Logout
                </button>
            </div>
        </aside>
        </>
    )
}