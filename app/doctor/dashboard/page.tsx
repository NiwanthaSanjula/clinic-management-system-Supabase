// app/(doctor)/doctor/dashboard/page.tsx
import { requireDoctor } from "@/lib/services/authService"
import {
    getDoctorDashboardStats,
    getWeeklyConsultationData,
    getTopDiagnosesThisMonth,
    getTodayCompletedVisits,
} from "@/lib/services/dashboardService"
import { getDoctorQueue } from "@/lib/services/appointmentService"
import ConsultationsChart from "@/components/dashboard/ConsultationsChart"
import {
    Clock, Stethoscope, CheckCircle,
    Package, AlertTriangle, ArrowRight,
    BarChart2
} from "lucide-react"
import Link from "next/link"

export default async function DoctorDashboard() {
    const profile = await requireDoctor()

    const today = new Date().toISOString().split("T")[0]

    const [stats, weeklyData, topDiagnoses, completedToday, queue] =
        await Promise.all([
            getDoctorDashboardStats(),
            getWeeklyConsultationData(),
            getTopDiagnosesThisMonth(),
            getTodayCompletedVisits(),
            getDoctorQueue(today),
        ])

    const hour = new Date().getHours()
    const greeting = hour < 12 ? "Good morning"
        : hour < 17 ? "Good afternoon"
            : "Good evening"

    return (
        <div className="space-y-5">

            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold">
                    {greeting}, Dr. {profile.name}
                </h1>
                <p className="text-gray-500 text-sm mt-0.5">
                    {new Date().toLocaleDateString("en-GB", {
                        weekday: "long", day: "numeric",
                        month: "long", year: "numeric"
                    })}
                </p>
            </div>

            {/* Today stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-amber-600">Waiting Now</span>
                        <Clock size={18} className="text-amber-500" />
                    </div>
                    <p className="text-3xl font-bold text-amber-600">{stats.waitingNow}</p>
                    {stats.waitingNow > 0 && (
                        <Link href="/doctor/appointments"
                            className="text-xs text-amber-600 underline mt-1 inline-block">
                            View queue →
                        </Link>
                    )}
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-blue-600">In Consultation</span>
                        <Stethoscope size={18} className="text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold text-blue-600">{stats.inConsultation}</p>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-emerald-600">Completed Today</span>
                        <CheckCircle size={18} className="text-emerald-500" />
                    </div>
                    <p className="text-3xl font-bold text-emerald-600">{stats.completedToday}</p>
                </div>
            </div>

            {/* Chart + Top diagnoses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <ConsultationsChart data={weeklyData} />

                {/* Top diagnoses this month */}
                <div className="bg-white rounded-lg border overflow-hidden">
                    <div className="px-4 py-3 border-b flex items-center gap-2">
                        <BarChart2 size={14} className="text-blue-500" />
                        <h2 className="font-semibold text-sm">Top Diagnoses This Month</h2>
                    </div>

                    {topDiagnoses.length === 0 ? (
                        <p className="text-center text-gray-400 py-8 text-sm">
                            No consultations this month yet
                        </p>
                    ) : (
                        <div className="p-4 space-y-3">
                            {topDiagnoses.map((item, index) => {
                                // Bar width as percentage of highest count
                                const maxCount = topDiagnoses[0].count
                                const width = Math.round((item.count / maxCount) * 100)

                                return (
                                    <div key={index}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-medium text-gray-700 truncate max-w-[200px]">
                                                {item.diagnosis}
                                            </span>
                                            <span className="text-xs text-gray-400 ml-2">
                                                {item.count} case{item.count !== 1 ? "s" : ""}
                                            </span>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div
                                                className="bg-blue-400 h-1.5 rounded-full transition-all"
                                                style={{ width: `${width}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Live queue + completed today */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Current queue */}
                <div className="bg-white rounded-lg border overflow-hidden">
                    <div className="px-4 py-3 border-b flex items-center justify-between">
                        <h2 className="font-semibold text-sm">Current Queue</h2>
                        <Link href="/doctor/appointments"
                            className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                            Full queue <ArrowRight size={11} />
                        </Link>
                    </div>

                    {queue.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            <Clock size={24} className="mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Queue is empty</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {queue.slice(0, 4).map(appt => (
                                <div key={appt.id}
                                    className="px-4 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="text-center w-12 bg-blue-50 text-blue-700
                                            border border-blue-100 rounded-md py-1">
                                            {appt.timeSlot ? (
                                                <p className="font-bold text-xs">{appt.timeSlot}</p>
                                            ) : (
                                                <p className="text-xs">Walk-in</p>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">
                                                {appt.patient.profile.name}
                                            </p>
                                            <span className={`text-xs px-1.5 py-0.5 rounded-full
                                                ${appt.status === "WAITING"
                                                    ? "bg-yellow-50 text-yellow-700"
                                                    : "bg-blue-50 text-blue-700"
                                                }`}>
                                                {appt.status === "WAITING"
                                                    ? "Waiting"
                                                    : "In Consultation"}
                                            </span>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/doctor/consultations/${appt.id}`}
                                        className="text-xs text-emerald-600 font-medium hover:underline"
                                    >
                                        {appt.consultation ? "Continue →" : "Start →"}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Completed today */}
                <div className="bg-white rounded-lg border overflow-hidden">
                    <div className="px-4 py-3 border-b">
                        <h2 className="font-semibold text-sm flex items-center gap-2">
                            <CheckCircle size={14} className="text-emerald-500" />
                            Completed Today
                        </h2>
                    </div>

                    {completedToday.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            <p className="text-sm">No completed visits yet today</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {completedToday.map(appt => (
                                <div key={appt.id} className="px-4 py-3">
                                    <p className="font-medium text-sm">
                                        {appt.patient.profile.name}
                                    </p>
                                    {appt.consultation?.diagnosis && (
                                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                                            {appt.consultation.diagnosis}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Stock alert */}
            {(stats.stockAlerts.outOfStock > 0 || stats.stockAlerts.lowStock > 0) && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4
                    flex items-start gap-3">
                    <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-medium text-amber-800">Stock Alert</p>
                        <div className="mt-1 space-y-0.5 text-amber-700 text-xs">
                            {stats.stockAlerts.outOfStock > 0 && (
                                <p>{stats.stockAlerts.outOfStock} medicines out of stock</p>
                            )}
                            {stats.stockAlerts.lowStock > 0 && (
                                <p>{stats.stockAlerts.lowStock} medicines running low</p>
                            )}
                        </div>
                        <Link href="/doctor/inventory"
                            className="text-amber-700 underline text-xs mt-1 inline-block">
                            View inventory →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}