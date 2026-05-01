// One place for all auth-related data fetching

import { redirect } from "next/navigation";
import { prisma } from "../prisma";
import { createClient } from "../supabase/server";
import { cache } from "react";

// cache() means: if requireAuth() is called multiple times in the SAME request,
// the DB is only hit ONCE — subsequent calls return the cached result
// Cache is automatically cleared on every new request — no stale data risk
// Return the profile or redirect - never returns null
export const requireAuth = cache(async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const profile = await prisma.profile.findUnique({
        where: { id: user.id }
    })

    if (!profile) redirect("/login")

    // { id, role, name,...}
    return profile
})

// Role specific guards - call these in layouts
export async function requireDoctor() {
    const profile = await requireAuth()
    if (profile.role !== "DOCTOR") redirect("/")
    return profile
}
export async function requireAssistant() {
    const profile = await requireAuth()
    if (profile.role !== "ASSISTANT") redirect("/")
    return profile
}

export async function requirePatient() {
    const profile = await requireAuth()
    if (profile.role !== "PATIENT") redirect("/login")
    return profile
}

