// app/(auth)/login/action.ts
"use server"

import { createClient } from "@/lib/supabase/server";
import { ActionState, getErrorMessage } from "@/lib/utils/actionError";
import { loginSchema } from "@/lib/validation/auth";
import { redirect } from "next/navigation";

export async function loginAction(
    prevState: { error: string } | null,
    formData: FormData
): Promise<ActionState> {
    // pull raw values from form
    const raw = {
        email: formData.get("email"),
        password: formData.get("password"),
    }

    // validate with zod
    const result = loginSchema.safeParse(raw)
    if (!result.success) {
        return { error: result.error.issues[0].message }
    }

    try {
        const supabase = await createClient()
        const { error } = await supabase.auth.signInWithPassword({
            email: result.data.email,
            password: result.data.password
        })

        if (error) {
            return { error: "Invalid email or password" }
        }
    } catch (error) {
        return { error: getErrorMessage(error) }
    }

    // Success — redirect to home (middleware handles role-based routing)
    redirect("/")

}