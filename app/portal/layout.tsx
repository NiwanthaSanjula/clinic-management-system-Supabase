// app/(portal)/layout.tsx
// Wraps ALL portal pages including login
// Keeps portal visually separate from staff area

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center">
            {children}
        </div>
    )
}