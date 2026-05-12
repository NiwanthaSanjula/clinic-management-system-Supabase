// CancelAppointmentButton.tsx
// Patient cancels their own SCHEDULED appointment
"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { cancelAppointmentAction } from "./action"
import { X } from "lucide-react"

type Props = { appointmentId: string }

export default function CancelAppointmentButton({ appointmentId }: Props) {
    const [pending, startTransition] = useTransition()
    const router = useRouter()

    function handleCancel() {
        // Simple confirm — no modal needed for this
        if (!confirm("Cancel this appointment?")) return

        startTransition(async () => {
            await cancelAppointmentAction(appointmentId)
            router.refresh()
        })
    }

    return (
        <button
            onClick={handleCancel}
            disabled={pending}
            className="text-xs text-red-400 hover:text-red-600
                border border-red-200 hover:border-red-300
                px-2 py-1 rounded-lg transition-colors
                disabled:opacity-50 flex items-center gap-1"
        >
            <X size={11} />
            {pending ? "Cancelling..." : "Cancel"}
        </button>
    )
}