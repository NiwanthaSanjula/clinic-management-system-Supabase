"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { personalInfoSchema } from "@/lib/validation/register";
import { useState } from "react";

type Props = {
    data: Record<string, any>;
    onNext: (fields: Record<string, string>) => void
    onBack: () => void;
}

export default function PersonalStep({ data, onNext, onBack }: Props) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const raw = {
            nic: formData.get("nic"),
            phone: formData.get("phone"),
            dateOfBirth: formData.get("dateOfBirth"),
            gender: formData.get("gender"),
            address: formData.get("address"),
        }

        const result = personalInfoSchema.safeParse(raw)
        if (!result.success) {
            const fieldErrors: Record<string, string> = {}
            result.error.issues.forEach(i => {
                fieldErrors[i.path[0] as string] = i.message
            })
            setErrors(fieldErrors)
            return
        }

        setErrors({})
        onNext({
            nic: result.data.nic,
            phone: result.data.phone,
            dateOfBirth: result.data.dateOfBirth,
            gender: result.data.gender,
            address: result.data.address ?? "",
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-sm font-medium">NIC</label>
                <Input name="nic" defaultValue={data.nic} placeholder="e.g. 123456789V" />
                {errors.nic && <p className="text-red-500 text-xs mt-1">{errors.nic}</p>}
            </div>

            <div>
                <label className="text-sm font-medium">Phone</label>
                <Input name="phone" defaultValue={data.phone} placeholder="07XXXXXXXX" />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
                <label className="text-sm font-medium">Date of Birth</label>
                <Input name="dateOfBirth" type="date" defaultValue={data.dateOfBirth} />
                {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
            </div>

            <div>
                <label className="text-sm font-medium">Gender</label>
                <select
                    name="gender"
                    defaultValue={data.gender}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                </select>
                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
            </div>

            <div>
                <label className="text-sm font-medium">Address (optional)</label>
                <Input name="address" defaultValue={data.address} placeholder="Your address" />
            </div>

            <div className="flex items-center gap-2">
                <Button type="button" variant="outline" className="w-1/2" onClick={onBack}>← Back</Button>
                <Button type="submit" className="w-1/2 bg-emerald-500">Next →</Button>
            </div>
        </form>
    )



}