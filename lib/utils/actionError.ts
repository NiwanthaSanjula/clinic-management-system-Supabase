// lib/utils/actionError.ts
// Consistent error handling for all server actions

// The golden rules:
// - NEVER put redirect() inside try/catch
// - Always return { error: string } | null - never throw to the client
// - Use this helper to safely extract error message

import { isRedirectError } from "next/dist/client/components/redirect-error";

// Safely extract a readable message from any error
export function getErrorMessage(error: unknown): string {
    // NextJs redirect() throws a special error internally
    // We must re-throw it or the redirect never happens
    if (isRedirectError(error)) throw error

    if (error instanceof Error) return error.message
    if (typeof error === "string") return error
    return "Something went wrong. Please try again."
}

// Standard return type for ALL server actions in this app
export type ActionState = { error: string } | null;