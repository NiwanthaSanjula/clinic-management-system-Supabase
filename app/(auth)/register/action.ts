// (auth)/register/action.ts
"use server"

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { ActionState, getErrorMessage } from "@/lib/utils/actionError";
import { registerSchema } from "@/lib/validation/register";
import { redirect } from "next/navigation";

export async function registerAction(
    prevState: { error: string } | null,
    formData: FormData
): Promise<ActionState> {
    // Collect all fields from form
    const raw = {
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        nic: formData.get("nic"),
        phone: formData.get("phone"),
        dateOfBirth: formData.get("dateOfBirth"),
        gender: formData.get("gender"),
        address: formData.get("address"),
        bloodGroup: formData.get("bloodGroup"),
        knownAllergies: formData.get("knownAllergies"),
    };

    // Validate with zod
    const result = registerSchema.safeParse(raw);
    if (!result.success) {
        return { error: result.error.issues[0].message }
    }

    const d = result.data

    try {

        // Check NIC not already exists
        const existing = await prisma.patient.findUnique({
            where: { nic: d.nic }
        })
        if (existing) return { error: "A patient with this NIC already exists." }

        // Create user in supabase
        const supabase = await createClient()
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: d.email,
            password: d.password
        })

        if (authError || !authData.user) {
            return { error: authError?.message ?? "Could not create account" }
        }

        const userId = authData.user.id;

        // Create Profile + Patient in one transaction
        // If either fails, both roll back - no orphaned records
        await prisma.$transaction(async (tx) => {
            await tx.profile.create({
                data: {
                    id: userId,
                    role: "PATIENT",
                    name: d.name
                }
            })

            await tx.patient.create({
                data: {
                    id: userId,
                    nic: d.nic,
                    email: d.email,
                    phone: d.phone,
                    dateOfBirth: d.dateOfBirth ? new Date(d.dateOfBirth) : null,
                    gender: d.gender,
                    address: d.address ?? null,
                    bloodGroup: d.bloodGroup ?? null,
                    knownAllergies: d.knownAllergies ?? null,
                }
            })
        })

        // Auto login immediately after registration
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: d.email,
            password: d.password
        })

        if (signInError) {
            // Account created but login failed - send to login page
            return { error: "Account created! Please log in." }
        }

    } catch (error) {
        return { error: getErrorMessage(error) }
    }

    redirect("/portal/dashboard")
}