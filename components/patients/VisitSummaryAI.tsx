// components/patients/VisitSummaryAI.tsx
// Shown inside the visit timeline — patient portal only
// Fetches AI summary lazily when the visit card is expanded
"use client"

import { useState } from "react"
import { Sparkles, Loader2, RefreshCw } from "lucide-react"

type Props = {
    consultationId: string
}

export default function VisitSummaryAI({ consultationId }: Props) {
    const [summary, setSummary] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [_fetched, setFetched] = useState(false)

    async function fetchSummary() {
        setLoading(true)
        setError(null)

        try {
            const res = await fetch(
                `/api/ai/visits/summary?consultationId=${consultationId}`
            )
            const data = await res.json()

            if (!res.ok) {
                setError(data.error ?? "Could not generate summary")
                return
            }

            setSummary(data.summary)
            setFetched(true)

        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    // Auto-fetch on first render
    // We use a button instead so patient controls when to call AI
    // Saves free tier quota

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-xs text-purple-500 py-2">
                <Loader2 size={12} className="animate-spin" />
                Generating summary...
            </div>
        )
    }

    if (summary) {
        return (
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-purple-600">
                        <Sparkles size={12} />
                        Visit Summary
                    </div>
                    {/* Allow regenerating */}
                    <button
                        onClick={fetchSummary}
                        className="text-purple-400 hover:text-purple-600"
                    >
                        <RefreshCw size={11} />
                    </button>
                </div>
                <p className="text-sm text-purple-800 leading-relaxed">{summary}</p>
                <p className="text-xs text-purple-400 italic">
                    AI-generated summary — for reference only
                </p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-between text-xs
                text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                <span>{error}</span>
                <button onClick={fetchSummary} className="underline ml-2">
                    Retry
                </button>
            </div>
        )
    }

    // Initial state — show button
    return (
        <button
            onClick={fetchSummary}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg
                bg-purple-50 text-purple-600 border border-purple-200
                hover:bg-purple-100 transition-colors w-full justify-center"
        >
            <Sparkles size={12} />
            Understand this visit
        </button>
    )
}