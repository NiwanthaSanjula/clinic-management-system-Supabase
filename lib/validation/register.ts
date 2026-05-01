// lib/validation/register.ts

import z from "zod";

export const baseAccountSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    email: z.email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters long"),
})

// REFINE Schema ( used only i the AccountStep.tsx form )
export const accountSchema = baseAccountSchema.refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"]
    }
)

export const personalInfoSchema = z.object({
    nic: z.string().min(10, "Invalid NIC").max(12, "Invalid NIC"),
    phone: z.string().min(10, "Invalid phone number").max(10, "Invalid phone number"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    gender: z.enum(["MALE", "FEMALE"], {
        message: "Please select a valid gender"
    }),
    address: z.string().optional()
});

export const medicalSchema = z.object({
    bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']).optional(),
    knownAllergies: z.string().optional()
})

// Full schema - all steps combined for final submission
export const registerSchema = baseAccountSchema
    .omit({ confirmPassword: true })
    .extend(personalInfoSchema.shape)
    .extend(medicalSchema.shape);

export type RegisterSchema = z.infer<typeof registerSchema>;