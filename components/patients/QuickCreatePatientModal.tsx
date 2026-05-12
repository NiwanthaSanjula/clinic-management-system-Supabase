// components/patients/QuickCreatePatientModal.tsx
// Small modal form to create a patient with minimum fields
// Used inside the booking form when patient isn't registered yet

"use client"

import { UserPlus } from "lucide-react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"
import { quickCreatePatientAction } from "@/app/assistant/appointments/new/quickCreateAction"
import { useState, useTransition } from "react"

type CreatedPatient = {
    id: string;
    name: string;
    nic: string
}

type Props = {
    open: boolean,
    onClose: () => void,
    // Called with the new patient when creation succeeds
    // Parent uses this to auto-select the patient
    onCreated: (patient: CreatedPatient) => void
}

export default function QuickCreatePatientModal({ open, onClose, onCreated }: Props) {
    const [error, setError] = useState<string | null>(null)
    const [pending, startTransition] = useTransition()

    function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)

        const formData = new FormData(e.currentTarget)

        startTransition(async () => {
            const result = await quickCreatePatientAction(formData)

            if (!result.success) {
                setError(result.error)
                return
            }

            // Pass new patient up to booking form - it will auto-select them
            onCreated(result.patient)
            onClose()
        })
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus size={18} className="text-emerald-500" />
                        Quick Add Patient
                    </DialogTitle>
                </DialogHeader>

                <p className="text-sm text-gray-500 -mt-2">
                    Minimum details to book. Full profile can be completed later.
                </p>

                {error && (
                    <p className="text-red-500 bg-red-50 border border-red-200 rounded p-2 text-sm">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="text-sm font-medium">Full Name *</label>
                        <Input name="name" placeholder="John Doe" required />
                    </div>

                    <div>
                        <label className="text-sm font-medium">NIC *</label>
                        <Input name="nic" placeholder="123456789V" required />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Phone *</label>
                        <Input name="phone" placeholder="07XXXXXXXX" required />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-1/2"
                            onClick={onClose}
                            disabled={pending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={pending}
                            className="w-1/2 bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                            {pending ? "Creating..." : "Create & Select"}
                        </Button>
                    </div>
                </form>
            </DialogContent>

        </Dialog>

    )

}