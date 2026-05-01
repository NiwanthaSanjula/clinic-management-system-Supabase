import LogoutButton from "@/components/layout/logout-button";
import { requireAssistant } from "@/lib/services/authService";

export default async function AssistantLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await requireAssistant()

    return (
        <div className="min-h-screen">
            <main className="p-6">
                {children}
                <LogoutButton />
            </main>
        </div>
    )
}