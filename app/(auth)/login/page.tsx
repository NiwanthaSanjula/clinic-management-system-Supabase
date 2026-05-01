//app/(auth)/login/page.tsx

"use client"

import { useActionState, useState } from "react"
import { loginAction } from "./action"
import { Mail, LockIcon, EyeIcon, EyeOffIcon } from 'lucide-react';

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
        <div className="shadow-md flex items-center gap-4 w-full max-w-2xl border-t-blue-500 border-t-4 rounded-lg">

            {/* --- Image --- */}
            <div className="hidden md:block relative w-1/2 h-[400px] rounded-lg">
                <Image
                    src={loginImage}
                    fill
                    alt="login-image"
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 100vw, 50vw"
                />
            </div>

            <div className="w-full md:w-1/2 p-3 flex flex-col justify-center gap-6">
                {/* --- Form --- */}
                <form action={action} className="flex flex-col w-full">
                    <h2 className="text-center font-bold text-2xl md:text-3xl mb-2">
                        Welcome back
                    </h2>


                    {/* Show error from server action if any */}
                    {state?.error && (
                        <p className="text-red-500 bg-red-500/15 border border-red-500/25 animate-pulse rounded text-center p-1 text-sm">{state.error}</p>
                    )}


                    <FieldSet className="w-full mt-3">
                        <FieldGroup>
                            <Field>
                                <div className="flex items-center gap-1">
                                    <Mail size={16} className="text-blue-500" />
                                    <FieldLabel>Email</FieldLabel>
                                </div>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email address"
                                    required
                                />
                            </Field>

                            <Field>
                                <div className="flex items-center gap-1">
                                    <LockIcon size={16} className="text-blue-500" />
                                    <FieldLabel>Password</FieldLabel>
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
                                        className="absolute top-1/2 right-2 -translate-y-1/2 opacity-50"
                                    >
                                        {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                                    </button>
                                </div>
                            </Field>
                        </FieldGroup>
                    </FieldSet>

                    {/* Submit button */}
                    <Button
                        type="submit"
                        disabled={pending}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-md py-2 mt-3"
                    >
                        {pending ? "Logging in..." : "Login"}
                    </Button>
                </form>

                <div
                >
                    <p className="text-center text-sm text-gray-500">Don't have an account? <Link href="/register" className="text-blue-500 hover:underline">Register</Link></p>
                </div>

            </div>
        </div>
    )
}