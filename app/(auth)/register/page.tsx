"use client"

import { startTransition, useActionState, useState } from "react"
import { registerAction } from "./action"
import AccountStep from "./steps/AccountStep"
import PersonalStep from "./steps/PersonalStep"
import MedicalStep from "./steps/MedicalStep"
import { HeartPulse, Check } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import loginImage from '@/public/LoginImage.jpg'

const STEPS = ["Account", "Personal", "Medical"]

export default function RegisterPage() {
    const [state, action, pending] = useActionState(registerAction, null)
    const [step, setStep] = useState(0)
    const [formData, setFormData] = useState<Record<string, string>>({})

    function handleNext(fields: Record<string, string>) {
        setFormData(prev => ({ ...prev, ...fields }))
        setStep(prev => prev + 1)
    }

    function handleBack() {
        setStep(prev => prev - 1)
    }

    function handleFinalSubmit(fields: Record<string, string>) {
        const allData = { ...formData, ...fields }
        const fd = new FormData()
        Object.entries(allData).forEach(([k, v]) => fd.append(k, v))
        startTransition(() => { action(fd) })
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4 py-10">
            <div className="w-full max-w-4xl flex rounded-2xl shadow-xl overflow-hidden border border-gray-100 bg-white">

                {/* --- Left Image Panel (hidden on mobile) --- */}
                <div className="hidden md:block relative w-[45%] shrink-0 min-h-[600px]">
                    <Image
                        src={loginImage}
                        fill
                        alt="Health registration"
                        className="object-cover"
                        sizes="45vw"
                        priority
                    />
                    {/* Overlay gradient for text legibility */}
                    <div className="absolute inset-0 bg-linear-to-t from-emerald-900/60 via-transparent to-transparent" />
                    <div className="absolute bottom-8 left-6 right-6 text-white">
                        <p className="text-lg font-semibold leading-snug">Your health journey starts here.</p>
                        <p className="text-sm text-emerald-100 mt-1">Manage appointments, records & more in one place.</p>
                    </div>
                </div>

                {/* --- Right Form Panel --- */}
                <div className="flex-1 flex flex-col justify-center p-6 sm:px-10">

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-1">
                            <HeartPulse className="text-emerald-500 w-5 h-5" />
                            <span className="text-sm font-semibold text-emerald-500 tracking-wide uppercase">HealthCare Portal</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Create Your Account</h1>
                        <p className="text-sm text-gray-500 mt-1">Join us and take control of your health.</p>
                    </div>

                    {/* --- Step Indicator --- */}
                    <div className="flex items-center mb-8">
                        {STEPS.map((label, i) => (
                            <div key={label} className="flex items-center flex-1 last:flex-none">
                                <div className="flex flex-col items-center gap-1">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                                            ${i < step
                                                ? "bg-emerald-500 text-white"
                                                : i === step
                                                    ? "bg-emerald-500 text-white ring-4 ring-emerald-100"
                                                    : "bg-gray-100 text-gray-400"
                                            }`}
                                    >
                                        {i < step ? <Check className="w-4 h-4" /> : i + 1}
                                    </div>
                                    <span className={`text-[11px] font-semibold whitespace-nowrap
                                        ${i === step ? "text-emerald-600" : i < step ? "text-emerald-500" : "text-gray-400"}`}>
                                        {label}
                                    </span>
                                </div>

                                {/* Connector */}
                                {i < STEPS.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-2 mb-4 transition-all duration-300
                                        ${i < step ? "bg-emerald-400" : "bg-gray-200"}`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Server error */}
                    {state?.error && (
                        <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                            <span className="mt-0.5">⚠</span>
                            <span>{state.error}</span>
                        </div>
                    )}

                    {/* Step Content */}
                    <div>
                        {step === 0 && <AccountStep data={formData} onNext={handleNext} />}
                        {step === 1 && <PersonalStep data={formData} onNext={handleNext} onBack={handleBack} />}
                        {step === 2 && <MedicalStep data={formData} onBack={handleBack} onSubmit={handleFinalSubmit} pending={pending} />}
                    </div>

                    {/* Footer */}
                    <p className="mt-6 text-center text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link href="/login" className="text-emerald-600 font-medium hover:underline">
                            Log in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}