// lib/validation/patient.ts

import z from "zod";

export const createPatientSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    nic: z.string().min(12, "Invalid NIC").max(12, "Invalid NIC"),
    phone: z.string().min(10, "Invalid phone number").max(10, "Invalid phone number"),
    email: z.email("Invalid email").optional().or(z.literal("")),
    dateOfBirth: z.string().optional(),
    gender: z.enum(["MALE", "FEMALE"]).optional(),
    address: z.string().optional(),
    bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""]).optional(),
    knownAllergies: z.string().optional(),
})

export type CreatePatientInput = z.infer<typeof createPatientSchema>

export const vitalsSchema = z.object({
    bloodPressure: z.string().optional(),
    weight: z.string().optional(), // string from form → convert to float
    temperature: z.string().optional(),
    pulse: z.string().optional(),
    notes: z.string().optional(),
})

export type VitalsInput = z.infer<typeof vitalsSchema>