// EditProfileForm.tsx
"use client"

import { useActionState, useTransition } from "react"
import { updatePortalProfileAction } from "./action"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

type Props = {
    defaultValues: {
        phone: string
        address: string
        email: string
    }
}

export default function EditProfileForm({ defaultValues }: Props) {
    const [state, formAction] = useActionState(updatePortalProfileAction, null)
    const [pending, startTransition] = useTransition()

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        startTransition(() => formAction(formData))
    }

    return (
        <form onSubmit={onSubmit} className="space-y-3">

            {state?.error && (
                <p className="text-red-500 bg-red-50 border border-red-200
                    rounded p-2 text-sm">
                    {state.error}
                </p>
            )}

            <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                    name="phone"
                    defaultValue={defaultValues.phone}
                    placeholder="07XXXXXXXX"
                />
            </div>

            <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                    name="email"
                    type="email"
                    defaultValue={defaultValues.email}
                    placeholder="optional"
                />
            </div>

            <div>
                <label className="text-sm font-medium">Address</label>
                <Input
                    name="address"
                    defaultValue={defaultValues.address}
                    placeholder="optional"
                />
            </div>

            <Button
                type="submit"
                disabled={pending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
                {pending ? "Saving..." : "Save Changes"}
            </Button>

            {state === null && (
                <div className="flex items-center justify-center gap-2 py-2
                    bg-emerald-50 border border-emerald-100 rounded-lg">
                    <CheckCircle size={14} className="text-emerald-500" />
                    <span className="text-sm text-emerald-600">Saved</span>
                </div>
            )}
        </form>
    )
}