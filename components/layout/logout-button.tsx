"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"

export default function LogoutButton() {
    const router = useRouter()

    async function handleLogout() {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/login")
    }

    return (
        <Button
            onClick={handleLogout}
        >
            Logout
        </Button>
    )
}