// lib/supabase/server.ts

// This client runs ON THE SERVER (NextJs server components, API routes)
// It reads cookies to know who is logged in
// Never run in browser

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,

        {
            cookies: {
                // How Supabase reads the session cookie
                getAll() {
                    return cookieStore.getAll()
                },
                // How supabase updates the session cookie
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )

                    } catch {
                        // Server components can't set cookies - middleware handle this
                    }
                }
            }
        }
    )
}