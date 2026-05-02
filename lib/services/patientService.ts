// lib/services/patientService.ts

import { prisma } from "../prisma";

// Get paginated patients list with optional search
// Search works on name, NIC, or phone
export async function getPatients({
    search = "",
    page = 1,
    perPage = 20,
}: {
    search?: string,
    page?: number,
    perPage?: number
}) {
    const where = search
        ? {
            OR: [
                { profile: { name: { contains: search, mode: "insensitive" as const } } },
                { nic: { contains: search, mode: "insensitive" as const } },
                { phone: { contains: search } }
            ],
        } : {}

    // Run both queries in parallel - total count + actual page data
    const [total, patients] = await Promise.all([
        prisma.patient.count({ where }),
        prisma.patient.findMany({
            where,
            include: {
                profile: { select: { name: true } }, // get name from profile
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * perPage,
            take: perPage
        })
    ])

    return {
        patients,
        total,
        totalPages: Math.ceil(total / perPage),
        currentPage: page
    }
}

// Get patient with full details
export async function getPatientById(id: string) {
    return prisma.patient.findUnique({
        where: { id },
        include: {
            profile: { select: { name: true, createdAt: true } }
        }
    })
}


export async function updatePatient(
    id: string,
    data: {
        phone?: string
        email?: string | null
        dateOfBirth?: Date | null
        gender?: string | null
        address?: string | null
        bloodGroup?: string | null
        knownAllergies?: string | null
    }
) {
    return prisma.patient.update({
        where: { id },
        data,
    })
}

// Get vitals history for a patient - newest first
export async function getPatientVitals(patientId: string) {
    return prisma.vitals.findMany({
        where: { patientId },
        orderBy: { recordedAt: "desc" },
        take: 10
    })
}

// Record new vitals
export async function recordVitals(data: {
    patientId: string
    recordedBy: string
    bloodPressure?: string
    weight?: number
    temperature?: number
    pulse?: number
    notes?: string
}) {
    return prisma.vitals.create({
        data
    })
}


// Used by portal - finds patient using their auth session ID
export async function getPatientByAuthId(authId: string) {
    return prisma.patient.findUnique({
        where: { id: authId }, // patient.id = profile.id = auth.id
        include: {
            profile: { select: { name: true, createdAt: true } },
        },
    })
}