// lib/services/dashboardService.ts
// Stats for assistant and doctor dashboards
// Each function is small and focused

import { prisma } from "../prisma";
import { getLowStockCount } from "./inventoryService";

// Stats for assistant dashboard
export async function getAssistantDashboardStats() {
    const today = new Date().toISOString().split("T")[0];

    const [
        todayAppointments,
        waiting,
        inConsultation,
        completed,
        unpaidInvoices,
        totalPatients,
        stockAlerts,
    ] = await Promise.all([
        // Total appointments today
        prisma.appointment.count({
            where: {
                date: today, status: { not: "CANCELLED" }
            }
        }),
        // Waiting right now
        prisma.appointment.count({
            where: { date: today, status: "WAITING" }
        }),
        // In consultation right now
        prisma.appointment.count({
            where: { date: today, status: "IN_CONSULTATION" }
        }),
        // Completed today
        prisma.appointment.count({
            where: { date: today, status: "COMPLETED" }
        }),
        // Unpaid invoices
        prisma.invoice.count({
            where: { status: "UNPAID" }
        }),
        // Total patients in system
        prisma.patient.count(),
        // Low/out of stock medicines
        getLowStockCount(),
    ])

    return {
        today: { total: todayAppointments, waiting, inConsultation, completed },
        unpaidInvoices,
        totalPatients,
        stockAlerts,
    }
}


// Stats for doctor dashboard
export async function getDoctorDashboardStats() {
    const today = new Date().toISOString().split("T")[0]

    const [
        waitingNow,
        inConsultation,
        completedToday,
        totalConsultations,
        stockAlerts,
    ] = await Promise.all([
        prisma.appointment.count({
            where: { date: today, status: "WAITING" }
        }),
        prisma.appointment.count({
            where: { date: today, status: "IN_CONSULTATION" }
        }),
        prisma.appointment.count({
            where: { date: today, status: "COMPLETED" }
        }),
        // Total consultations ever done by this doctor
        prisma.consultation.count(),
        getLowStockCount(),
    ])

    return {
        waitingNow,
        inConsultation,
        completedToday,
        totalConsultations,
        stockAlerts,
    }
}

// Weekly appointment counts — last 7 days
// Used for the bar chart on both dashboards
export async function getWeeklyAppointmentData() {
    const days = []

    // Build last 7 days array
    for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split("T")[0]

        const count = await prisma.appointment.count({
            where: {
                date: dateStr,
                status: { not: "CANCELLED" }
            }
        })

        days.push({
            // Short day label e.g. "Mon", "Tue"
            day: date.toLocaleDateString("en-GB", { weekday: "short" }),
            date: dateStr,
            appointments: count,
            // Highlight today
            isToday: i === 0,
        })
    }

    return days
}


// Weekly consultation counts — for doctor chart
export async function getWeeklyConsultationData() {
    const days = []

    for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split("T")[0]

        // Count consultations via appointments on that date
        const count = await prisma.consultation.count({
            where: {
                appointment: { date: dateStr }
            }
        })

        days.push({
            day: date.toLocaleDateString("en-GB", { weekday: "short" }),
            date: dateStr,
            consultations: count,
            isToday: i === 0,
        })
    }

    return days
}


// Today's revenue — sum of PAID invoices today
export async function getTodayRevenue() {
    const today = new Date().toISOString().split("T")[0]

    const result = await prisma.invoice.aggregate({
        where: {
            status: "PAID",
            // paidAt is today
            paidAt: {
                gte: new Date(`${today}T00:00:00`),
                lte: new Date(`${today}T23:59:59`),
            }
        },
        _sum: { totalAmount: true }
    })

    return result._sum.totalAmount ?? 0
}

// Top 5 diagnoses this month — for doctor dashboard
export async function getTopDiagnosesThisMonth() {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const consultations = await prisma.consultation.findMany({
        where: {
            createdAt: { gte: startOfMonth }
        },
        select: { diagnosis: true }
    })

    // Count occurrences of each diagnosis
    const counts: Record<string, number> = {}
    for (const c of consultations) {
        const key = c.diagnosis.trim().toLowerCase()
        counts[key] = (counts[key] ?? 0) + 1
    }

    // Sort by count descending, take top 5
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([diagnosis, count]) => ({
            // Capitalize first letter
            diagnosis: diagnosis.charAt(0).toUpperCase() + diagnosis.slice(1),
            count,
        }))
}

// Recently completed visits today — for doctor dashboard
export async function getTodayCompletedVisits() {
    const today = new Date().toISOString().split("T")[0]

    return prisma.appointment.findMany({
        where: {
            date: today,
            status: "COMPLETED"
        },
        include: {
            patient: {
                include: { profile: { select: { name: true } } }
            },
            consultation: {
                select: { diagnosis: true }
            }
        },
        orderBy: { updateAt: "desc" },
        take: 5
    })
}

// Recent patient registrations — for assistant dashboard
export async function getRecentPatients() {
    return prisma.patient.findMany({
        include: {
            profile: { select: { name: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 5
    })
}

// Get paginated audit logs — newest first
export async function getAuditLogs({
    page = 1,
    perPage = 20,
}: {
    page?: number
    perPage?: number
}) {
    const [total, logs] = await Promise.all([
        prisma.auditLog.count(),
        prisma.auditLog.findMany({
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * perPage,
            take: perPage,
        })
    ])

    return {
        logs,
        total,
        totalPages: Math.ceil(total / perPage),
        currentPage: page,
    }
}