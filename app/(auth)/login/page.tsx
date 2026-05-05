"use client"

import { useActionState, useState } from "react"
import { loginAction } from "./action"
import { Mail, LockIcon, EyeIcon, EyeOffIcon, HeartPulse } from 'lucide-react';
import {
    FieldSet,
    FieldGroup,
    Field,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import loginImage from '@/public/LoginImage.jpg'
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginPage() {
    const [state, action, pending] = useActionState(loginAction, null)
    const [showPassword, setShowPassword] = useState(false)

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4 py-10">
            <div className="w-full max-w-3xl flex rounded-2xl shadow-xl overflow-hidden border border-gray-100 bg-white">


                {/* --- Right Form Panel --- */}
                <div className="flex-1 flex flex-col justify-center p-6 sm:px-10">

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-1">
                            <HeartPulse className="text-emerald-500 w-5 h-5" />
                            <span className="text-sm font-semibold text-emerald-500 tracking-wide uppercase">HealthCare Portal</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Sign In</h1>
                        <p className="text-sm text-gray-500 mt-1">Enter your credentials to continue.</p>
                    </div>

                    {/* Server error */}
                    {state?.error && (
                        <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                            <span className="mt-0.5">⚠</span>
                            <span>{state.error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form action={action} className="flex flex-col gap-5">
                        <FieldSet className="w-full">
                            <FieldGroup>
                                <Field>
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Mail size={14} className="text-emerald-500" />
                                        <FieldLabel className="text-sm font-medium text-gray-700">Email</FieldLabel>
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </Field>

                                <Field>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-1.5">
                                            <LockIcon size={14} className="text-emerald-500" />
                                            <FieldLabel className="text-sm font-medium text-gray-700">Password</FieldLabel>
                                        </div>
                                        <Link href="/forgot-password" className="text-xs text-emerald-600 hover:underline">
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="Enter your password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
                                        </button>
                                    </div>
                                </Field>
                            </FieldGroup>
                        </FieldSet>

                        <Button
                            type="submit"
                            disabled={pending}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-2.5 font-semibold transition-colors mt-1"
                        >
                            {pending ? "Signing in…" : "Sign In"}
                        </Button>
                    </form>

                    {/* Footer */}
                    <p className="mt-6 text-center text-sm text-gray-500">
                        Don't have an account?{" "}
                        <Link href="/register" className="text-emerald-600 font-medium hover:underline">
                            Register here
                        </Link>
                    </p>
                </div>

                {/* --- Left Image Panel (hidden on mobile) --- */}
                <div className="hidden md:block relative w-[45%] shrink-0 min-h-[520px]">
                    <Image
                        src={loginImage}
                        fill
                        alt="Health login"
                        className="object-cover"
                        sizes="45vw"
                        priority
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-emerald-900/60 via-transparent to-transparent" />
                    <div className="absolute bottom-8 left-6 right-6 text-white">
                        <p className="text-lg font-semibold leading-snug">Welcome back.</p>
                        <p className="text-sm text-emerald-100 mt-1">Sign in to access your health dashboard.</p>
                    </div>
                </div>

            </div>
        </div>
    )
}