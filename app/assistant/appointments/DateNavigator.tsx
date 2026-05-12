// DateNavigator.tsx
// Tiny client component — only exists because <input onChange>
// cannot live in a Server Component

"use client"

import { useRouter } from "next/navigation"

type Props = {
    viewing: string // current date string "2020-05-01"
    today: string
}

export default function DateNavigator({ viewing, today }: Props) {
    const router = useRouter()

    return (
        <input
            type="date"
            defaultValue={viewing}
            onChange={e => router.push(`?date=${e.target.value}`)}
            className="border rounded px-3 py-1 text-sm"
        />
    )
}