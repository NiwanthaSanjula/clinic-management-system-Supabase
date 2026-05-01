// Wraps all doctor pages

import LogoutButton from "@/components/layout/logout-button";
import { requireDoctor } from "@/lib/services/authService";

export default async function DoctorLayout({
    children
}: {
    children: React.ReactNode

}) {
    await requireDoctor();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar goes here later */}
            <main className="p-6">
                {children}
                <LogoutButton />
            </main>
        </div>
    )

}