// This client run in the browser (on the user's device)
// It uses the ANON key - which is sage to be public
// Use this inside client components

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,          // ! means "I know this exists"
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )
}