import z, { email } from "zod";

export const loginSchema = z.object({
    email: z.email("Please enter valid email"),
    password: z.string().min(6, "Password must be at least 6 characters")
})

// This give TS type automatically
export type LoginInput = z.infer<typeof loginSchema>

// Patient portal uses same shape - but separate for future flexibility
export const portalLoginSchema = loginSchema