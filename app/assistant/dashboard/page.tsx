// app/(assistant)/assistant/dashboard/page.tsx
import { requireAssistant } from "@/lib/services/authService"
import {
  getAssistantDashboardStats,
  getWeeklyAppointmentData,
  getTodayRevenue,
  getRecentPatients,
} from "@/lib/services/dashboardService"
import { getUnpaidInvoices } from "@/lib/services/billingService"
import AppointmentsChart from "@/components/dashboard/AppointmentsChart"
import {
  Users, Calendar, CreditCard, Package,
  Clock, CheckCircle, Stethoscope,
  AlertTriangle, TrendingUp, UserPlus
} from "lucide-react"
import Link from "next/link"

export default async function AssistantDashboard() {
  const profile = await requireAssistant()

  // Load all data in parallel
  const [stats, weeklyData, todayRevenue, unpaidInvoices, recentPatients] =
    await Promise.all([
      getAssistantDashboardStats(),
      getWeeklyAppointmentData(),
      getTodayRevenue(),
      getUnpaidInvoices(),
      getRecentPatients(),
    ])

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric",
    month: "long", year: "numeric"
  })

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-em"><span className="text-emerald-500"> Good morning, </span> {profile.name}</h1>
        <p className="text-gray-500 text-sm mt-0.5">{today}</p>
      </div>

      {/* Today's queue stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard
          label="Today's Total"
          value={stats.today.total}
          icon={<Calendar size={64} />}
          color="blue"
          href="/assistant/appointments"
        />
        <StatCard
          label="Waiting"
          value={stats.today.waiting}
          icon={<Clock size={64} />}
          color="amber"
          href="/assistant/appointments"
        />
        <StatCard
          label="Completed"
          value={stats.today.completed}
          icon={<CheckCircle size={64} />}
          color="green"
          href="/assistant/appointments"
        />
      </div>

      {/* Revenue + Patients + Stock row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* Today's revenue */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-emerald-600">
              Today's Revenue
            </span>
            <TrendingUp size={18} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-700">
            Rs. {todayRevenue.toFixed(0)}
          </p>
          <p className="text-xs text-emerald-500 mt-1">
            From paid invoices
          </p>
        </div>


        <StatCard
          label="Unpaid Invoices"
          value={stats.unpaidInvoices}
          icon={<CreditCard size={64} />}
          color={stats.unpaidInvoices > 0 ? "red" : "gray"}
          href="/assistant/billing"
        />

        <StatCard
          label="Stock Alerts"
          value={stats.stockAlerts.outOfStock + stats.stockAlerts.lowStock}
          icon={<Package size={64} />}
          color={
            stats.stockAlerts.outOfStock > 0 ? "red" :
              stats.stockAlerts.lowStock > 0 ? "amber" : "gray"
          }
          href="/assistant/inventory"
        />


      </div>

      {/* Chart + Unpaid invoices side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Weekly chart */}
        <AppointmentsChart data={weeklyData} />

        {/* Unpaid invoices */}
        <div className="bg-white rounded-lg border overflow-hidden shadow-md">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <CreditCard size={14} className="text-red-400" />
              Pending Payments
            </h2>
            <Link href="/assistant/billing"
              className="text-xs text-blue-500 hover:underline">
              View all →
            </Link>
          </div>

          {unpaidInvoices.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <CheckCircle size={24} className="mx-auto mb-2 text-emerald-300" />
              <p className="text-sm">All invoices paid</p>
            </div>
          ) : (
            <div className="divide-y">
              {unpaidInvoices.slice(0, 5).map(invoice => (
                <div key={invoice.id}
                  className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">
                      {invoice.patient.profile.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {invoice.appointment.date}
                    </p>
                  </div>
                  <span className="font-semibold text-emerald-600 text-sm">
                    Rs. {invoice.totalAmount.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent patients + Stock alerts side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Recent registrations */}
        <div className="bg-white rounded-lg border overflow-hidden shadow-md">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <UserPlus size={14} className="text-emerald-500" />
              Recent Patients
            </h2>
            <Link href="/assistant/patients"
              className="text-xs text-blue-500 hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y">
            {recentPatients.map(patient => (
              <div key={patient.id}
                className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">
                    {patient.profile.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    NIC: {patient.nic}
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(patient.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stock alerts */}
        {(stats.stockAlerts.outOfStock > 0 ||
          stats.stockAlerts.lowStock > 0 ||
          stats.stockAlerts.expiringSoon > 0) ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm w-full">
                <p className="font-semibold text-amber-800 mb-2">
                  Stock Alerts
                </p>
                <div className="space-y-2">
                  {stats.stockAlerts.outOfStock > 0 && (
                    <AlertRow
                      count={stats.stockAlerts.outOfStock}
                      label="medicines out of stock"
                      color="red"
                    />
                  )}
                  {stats.stockAlerts.lowStock > 0 && (
                    <AlertRow
                      count={stats.stockAlerts.lowStock}
                      label="medicines running low"
                      color="amber"
                    />
                  )}
                  {stats.stockAlerts.expiringSoon > 0 && (
                    <AlertRow
                      count={stats.stockAlerts.expiringSoon}
                      label="medicines expiring soon"
                      color="orange"
                    />
                  )}
                </div>
                <Link href="/assistant/inventory"
                  className="text-amber-700 underline text-xs mt-3 inline-block">
                  View inventory →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4
                        flex items-center gap-3">
            <CheckCircle size={20} className="text-emerald-500" />
            <div>
              <p className="font-medium text-emerald-700 text-sm">
                Stock is healthy
              </p>
              <p className="text-xs text-emerald-500 mt-0.5">
                No alerts at this time
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

function StatCard({ label, value, icon, color, href }: {
  label: string
  value: number
  icon: React.ReactNode
  color: "blue" | "amber" | "purple" | "green" | "red" | "gray"
  href: string
}) {
  const colors = {
    blue: "bg-blue-500/15 text-blue-500 border-blue-100 border-l-3 border-l-blue-500",
    amber: "bg-amber-500/15 text-amber-500 border-amber-100 border-l-3 border-l-amber-500",
    purple: "bg-purple-500/15 text-purple-500 border-purple-100 border-l-3 border-l-purple-500",
    green: "bg-emerald-500/15 text-emerald-500 border-emerald-100 border-l-3 border-l-emerald-500",
    red: "bg-red-500/15 text-red-500 border-red-100 border-l-3 border-l-red-500",
    gray: "bg-gray-500/15 text-gray-500 border-gray-100 border-l-3 border-l-gray-500",
  }
  return (
    <Link href={href}>
      <div className={`relative overflow-hidden rounded-lg border p-4 shadow-md hover:shadow-lg hover:-translate-y-2 transition-all duration-300
                cursor-pointer ${colors[color]}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold">{label}</span>
          <div className="absolute right-0 top-0 opacity-25">
            {icon}
          </div>
        </div>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </Link>
  )
}

function AlertRow({ count, label, color }: {
  count: number
  label: string
  color: "red" | "amber" | "orange"
}) {
  const colors = {
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-700",
    orange: "bg-orange-100 text-orange-700",
  }
  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors[color]}`}>
        {count}
      </span>
      <span className="text-xs text-amber-700">{label}</span>
    </div>
  )
}