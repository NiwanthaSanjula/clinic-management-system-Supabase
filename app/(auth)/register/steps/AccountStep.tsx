"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { accountSchema } from "@/lib/validation/register"
import { Eye, EyeClosed } from "lucide-react"
import { useState } from "react"

type Props = {
    // data already collected so far
    data: Record<string, any>
    // called when user clicks Next - passes validate fields up
    onNext: (fields: Record<string, string>) => void
}

export default function AccountStep({ data, onNext }: Props) {
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget)

        const raw = {
            name: formData.get("name"),
            email: formData.get("email"),
            password: formData.get("password"),
            confirmPassword: formData.get("confirmPassword")
        }

        // Validate only this step's fields
        const result = accountSchema.safeParse(raw)
        if (!result.success) {
            const fieldErrors: Record<string, string> = {}
            result.error.issues.forEach(issue => {
                fieldErrors[issue.path[0] as string] = issue.message;
            })
            setErrors(fieldErrors)
            return
        }

        setErrors({})
        // Pass validated data up to parent
        onNext({
            name: result.data.name,
            email: result.data.email,
            password: result.data.password
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input name="name" defaultValue={data.name} placeholder="John Doe" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
                <label className="text-sm font-medium">Email</label>
                <Input name="email" type="email" defaultValue={data.email} placeholder="john@email.com" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                    <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        defaultValue={data.password}
                        placeholder="Min. 8 characters"
                    />

                    <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {
                            showPassword ? <EyeClosed size={16} /> : <Eye size={16} />
                        }
                    </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
                <label className="text-sm font-medium">Confirm Password</label>
                <div className="relative">
                    <Input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        defaultValue={data.confirmPassword}
                        placeholder="Repeat password"
                    />

                    <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {
                            showConfirmPassword ? <EyeClosed size={16} /> : <Eye size={16} />
                        }
                    </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <Button type="submit" className="w-full mt-3 bg-emerald-500 hover:bg-emerald-600 text-white">Next →</Button>
        </form>
    )
}