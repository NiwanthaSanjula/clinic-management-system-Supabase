// proxy.ts (middleware)

// This run on EVERY REQUEST before the page loads
// it checks: are you logged in? what is your role?
// Then decides: let you through or redirect

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    // Create a Supabase client that can read/write cookies
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Get the current logged-in user ( null if not logged in )
    const { data: { user } } = await supabase.auth.getUser()
    const path = request.nextUrl.pathname

    // --- Note logged in and trying to access protected pages ---
    if (!user && (
        path.startsWith("/doctor") ||
        path.startsWith("/assistant") ||
        path.startsWith("/portal")
    )) {
        return NextResponse.redirect(new URL("/login", request.url))
    }

    // --- Already logged in, trying to go to /login ---
    if (user && path === "/login") {
        // We dont know the role here yet, redirect to landing page
        // The dashboard layout will handle role-based redirect
        return NextResponse.redirect(new URL("/", request.url))
    }

    return supabaseResponse
}

// Tell nextjs which route this middleware runs on
// Skip static files, images, etc - only run o real pages
export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}