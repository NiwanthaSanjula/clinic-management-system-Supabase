"use client"

import { act, startTransition, useActionState, useState } from "react"
import { registerAction } from "./action"
import AccountStep from "./steps/AccountStep"
import PersonalStep from "./steps/PersonalStep"
import MedicalStep from "./steps/MedicalStep"
import { HeartPulse } from "lucide-react"
import Link from "next/link"

// Step indicator labels
const STEPS = ["Account", "Personal", "Medical"]

export default function RegisterPage() {
    const [state, action, pending] = useActionState(registerAction, null)


    // Current step
    const [step, setStep] = useState(0)

    // collect data across all steps
    const [formData, setFormData] = useState<Record<string, string>>({})

    // Hidden form ref - we submit programatically on final step
    function handleNext(fields: Record<string, string>) {
        setFormData(prev => ({ ...prev, ...fields }))
        setStep(prev => prev + 1)
    }

    function handleBack() {
        setStep(prev => prev - 1)
    }

    // Final step submit - build FormData and call server action
    function handleFinalSubmit(fields: Record<string, string>) {
        const allData = { ...formData, ...fields }
        const fd = new FormData()
        Object.entries(allData).forEach(([k, v]) => fd.append(k, v))
        // triggers useActionState  server action
        startTransition(() => {
            action(fd)
        })
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-gray-200 border-t-emerald-500 border-t-4">
            <div className="text-center mb-6">
                <div className="flex items-center gap-2 justify-center">
                    <HeartPulse className="text-emerald-600" />
                    <h1 className="text-2xl font-semibold text-emerald-500">Create Your Account</h1>
                </div>
                <p className="text-gray-500">Join us and manage your health</p>
            </div>

            {/* --- Step Indicator --- */}
            <div className="flex items-center justify-between mb-6">
                {STEPS.map((label, i) => (
                    <div key={label} className="flex items-center gap-2">
                        <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                                ${i < step ? "bg-emerald-500 text-white" : i === step ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-400"}
                            `}
                        >
                            {i < step ? "✓" : i + 1}
                        </div>
                        <span
                            className={`text-xs ${i === step ? "text-blue-500" : "text-gray-400"} font-bold`}
                        >
                            {label}
                        </span>

                        {/* Connector line between steps */}
                        {i < STEPS.length - 1 && (
                            <div className={`h-0.5 w-8 md:w-12 ${i < step ? "bg-emerald-500" : "bg-gray-400"}`} />

                        )}
                    </div>
                ))}
            </div>

            {/* Error from server action*/}
            {state?.error && (
                <p className="text-red-500 bg-red-500/15 border border-red-500/25 rounded text-center p-2 text-sm mb-4">
                    {state.error}
                </p>
            )}

            {/* Render current step */}
            {step === 0 && <AccountStep data={formData} onNext={handleNext} />}
            {step === 1 && <PersonalStep data={formData} onNext={handleNext} onBack={handleBack} />}
            {step === 2 && <MedicalStep data={formData} onBack={handleBack} onSubmit={handleFinalSubmit} pending={pending} />}

            <div className="mt-4 text-center text-sm flex items-center gap-2 justify-center">
                <p className="text-gray-500">Already have an account?</p>
                <Link href="/login" className="text-blue-500 hover:underline">Log in here</Link>
            </div>
        </div>
    )

}