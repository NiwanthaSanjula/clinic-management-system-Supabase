"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type Props = {
    data: Record<string, any>
    onBack: () => void
    // final submit 
    onSubmit: (fields: Record<string, string>) => void
    pending: boolean
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

export default function MedicalStep({ data, onBack, onSubmit, pending }: Props) {
    function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        onSubmit({
            bloodGroup: formData.get("bloodGroup") as string ?? "",
            knownAllergies: formData.get("knownAllergies") as string ?? "",
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-sm font-medium">Blood Group (optional)</label>
                <select
                    name="bloodGroup"
                    defaultValue={data.bloodGroup}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                    <option value="">Unknown / Not sure</option>
                    {BLOOD_GROUPS.map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="text-sm font-medium">Known Allergies (optional)</label>
                <Textarea
                    name="knownAllergies"
                    defaultValue={data.knownAllergies}
                    placeholder="e.g. Penicillin, Peanuts... or leave blank"
                    rows={3}
                />
            </div>

            <div className="flex items-center gap-2">
                <Button type="button" variant="outline" className="w-1/2" onClick={onBack}>← Back</Button>
                <Button type="submit" className="w-1/2 bg-emerald-500" disabled={pending}>
                    {pending ? "Creating account..." : "Create Account"}
                </Button>
            </div>
        </form>
    )
}