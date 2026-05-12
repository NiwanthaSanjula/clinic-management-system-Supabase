// app/page.tsx
// Public landing page — shown to unauthenticated users, or acts as a portal for logged-in users.

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import {
  HeartPulse, Calendar, FileText,
  CreditCard, Shield, Clock, ArrowRight, LayoutDashboard, ArrowUpRight
} from "lucide-react"

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let dashboardUrl = null
  if (user) {
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { role: true }
    })

    if (profile?.role === "DOCTOR") dashboardUrl = "/doctor/dashboard"
    else if (profile?.role === "ASSISTANT") dashboardUrl = "/assistant/dashboard"
    else if (profile?.role === "PATIENT") dashboardUrl = "/portal/dashboard"
  }

  return (
    <div className="min-h-screen bg-[#f5f3ee] font-sans selection:bg-emerald-800 selection:text-white">

      {/* ── Noise texture overlay ── */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "256px 256px" }}
      />

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-stone-300/60 bg-[#f5f3ee]/90 backdrop-blur-sm">
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-sm bg-emerald-900 flex items-center justify-center">
              <HeartPulse size={15} className="text-emerald-100" />
            </div>
            <span className="font-semibold text-stone-900 text-base tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
              ClinicMS
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-stone-500 font-medium">
            <span>Features</span>
            <span>For Patients</span>
            <span>For Clinics</span>
          </div>

          <div className="flex items-center gap-3">
            {dashboardUrl ? (
              <Link
                href={dashboardUrl}
                className="flex items-center gap-2 text-sm bg-emerald-900 hover:bg-emerald-800 text-emerald-50 px-4 py-2 rounded-sm font-medium transition-colors"
              >
                <LayoutDashboard size={14} />
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm text-stone-500 hover:text-stone-900 font-medium transition-colors">
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="text-sm bg-emerald-900 hover:bg-emerald-800 text-emerald-50 px-4 py-2 rounded-sm font-medium transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative max-w-7xl mx-auto px-8 pt-36 pb-24">

        {/* Large decorative number */}
        <div className="absolute top-28 right-8 text-[220px] font-black text-stone-200/70 leading-none select-none pointer-events-none hidden xl:block"
          style={{ fontFamily: "'Georgia', serif" }}>
          Rx
        </div>

        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-10">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          </div>
          <span className="text-xs font-semibold tracking-[0.15em] text-emerald-800 uppercase">
            Healthcare Management Platform
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-6xl md:text-8xl font-black text-stone-900 leading-[0.9] tracking-tight mb-8 max-w-4xl"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          Your health,<br />
          <em className="not-italic text-emerald-800">beautifully</em><br />
          managed.
        </h1>

        {/* Sub + CTA row */}
        <div className="flex flex-col md:flex-row md:items-end gap-10 mt-12">
          <p className="text-stone-500 text-lg leading-relaxed max-w-md">
            Book appointments, access digital prescriptions, track vitals, and manage everything about your healthcare in one precise, private platform.
          </p>

          <div className="flex items-center gap-4 md:pb-1">
            {dashboardUrl ? (
              <Link
                href={dashboardUrl}
                className="group flex items-center gap-2 bg-emerald-900 hover:bg-emerald-800 text-white px-7 py-3.5 rounded-sm font-semibold transition-colors text-sm"
              >
                Go to Dashboard
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="group flex items-center gap-2 bg-emerald-900 hover:bg-emerald-800 text-white px-7 py-3.5 rounded-sm font-semibold transition-colors text-sm"
                >
                  <Calendar size={15} />
                  Book appointment
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="text-sm text-stone-500 hover:text-stone-900 underline underline-offset-4 decoration-stone-300 hover:decoration-stone-600 transition-colors font-medium"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Thin ruled line */}
        <div className="mt-20 border-t border-stone-300" />

        {/* Stats row */}
        <div className="grid grid-cols-3 divide-x divide-stone-300 mt-0">
          {[
            { value: "< 2 min", label: "Average booking time" },
            { value: "100%", label: "Records encrypted" },
            { value: "24 / 7", label: "Access anytime" },
          ].map((s) => (
            <div key={s.label} className="px-8 py-6 first:pl-0">
              <p className="text-3xl font-black text-stone-900 tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>{s.value}</p>
              <p className="text-xs text-stone-400 mt-1 font-medium tracking-wide uppercase">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-stone-900 relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "60px 60px" }}
        />

        <div className="relative max-w-7xl mx-auto px-8 py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-stone-700 pb-10">
            <h2
              className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Everything <em className="not-italic text-emerald-400">you need,</em><br />
              nothing you don't.
            </h2>
            <p className="text-stone-400 max-w-xs text-sm leading-relaxed">
              A complete suite of tools designed around the actual needs of patients and clinic staff.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-stone-700">
            <FeatureCard
              icon={<Calendar size={18} />}
              index="01"
              title="Easy Booking"
              description="Book appointments online anytime. Choose your preferred date and time slot with real-time availability."
              accent="text-blue-400"
            />
            <FeatureCard
              icon={<FileText size={18} />}
              index="02"
              title="Digital Prescriptions"
              description="Access your prescriptions, medical certificates, and visit history straight from your mobile device."
              accent="text-emerald-400"
            />
            <FeatureCard
              icon={<CreditCard size={18} />}
              index="03"
              title="Payment Tracking"
              description="View all your invoices, outstanding balances, and complete payment history in one transparent place."
              accent="text-amber-400"
            />
            <FeatureCard
              icon={<Shield size={18} />}
              index="04"
              title="Secure Records"
              description="Your medical records are encrypted, private, and protected using industry-leading security standards."
              accent="text-violet-400"
            />
            <FeatureCard
              icon={<HeartPulse size={18} />}
              index="05"
              title="Vitals History"
              description="Track your blood pressure, weight, temperature, and other key vitals over time with visual charts."
              accent="text-rose-400"
            />
            <FeatureCard
              icon={<Clock size={18} />}
              index="06"
              title="Real-time Queue"
              description="Know your exact position in the clinic queue before you arrive to minimize wait times."
              accent="text-teal-400"
            />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-8 py-28">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left: big type */}
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-emerald-700 uppercase mb-6">
              {dashboardUrl ? "Welcome back" : "Start today"}
            </p>
            <h2
              className="text-5xl md:text-6xl font-black text-stone-900 leading-tight tracking-tight mb-6"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              {dashboardUrl
                ? "Your health dashboard awaits."
                : "Take control of your health journey."}
            </h2>
            <p className="text-stone-500 text-base leading-relaxed max-w-md">
              {dashboardUrl
                ? "Access your dashboard to manage appointments, view records, and stay on top of your health journey."
                : "Join thousands of patients who are already experiencing a better way to manage their healthcare."}
            </p>
          </div>

          {/* Right: action card */}
          <div className="bg-emerald-900 rounded-sm p-10 flex flex-col gap-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-emerald-800/50 blur-2xl pointer-events-none" />
            <div className="w-10 h-10 rounded-sm bg-emerald-800 flex items-center justify-center">
              <HeartPulse size={20} className="text-emerald-300" />
            </div>
            <div>
              <p className="text-white font-semibold text-lg mb-1">
                {dashboardUrl ? "Continue to your dashboard" : "Create your free account"}
              </p>
              <p className="text-emerald-300/70 text-sm">
                {dashboardUrl ? "Everything is waiting for you." : "No credit card required. Set up in minutes."}
              </p>
            </div>

            {dashboardUrl ? (
              <Link
                href={dashboardUrl}
                className="group self-start flex items-center gap-2 bg-white hover:bg-emerald-50 text-emerald-900 px-6 py-3 rounded-sm font-semibold text-sm transition-colors"
              >
                <LayoutDashboard size={15} />
                Access Dashboard
                <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  href="/register"
                  className="group self-start flex items-center gap-2 bg-white hover:bg-emerald-50 text-emerald-900 px-6 py-3 rounded-sm font-semibold text-sm transition-colors"
                >
                  Get started free
                  <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
                <p className="text-sm text-emerald-300/60">
                  Already have an account?{" "}
                  <Link href="/login" className="text-emerald-300 hover:text-white transition-colors font-medium">
                    Sign in →
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-stone-300/60 bg-[#f5f3ee]">
        <div className="max-w-7xl mx-auto px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-sm bg-emerald-900 flex items-center justify-center">
              <HeartPulse size={11} className="text-emerald-100" />
            </div>
            <span className="font-semibold text-stone-700 text-sm" style={{ fontFamily: "'Georgia', serif" }}>ClinicMS</span>
            <span className="text-stone-400 text-xs ml-1">© {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-stone-400">
            <Link href="#" className="hover:text-stone-800 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-stone-800 transition-colors">Terms</Link>
            {!dashboardUrl && (
              <Link href="/login" className="hover:text-stone-800 transition-colors">Staff Login</Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, index, title, description, accent }: {
  icon: React.ReactNode
  index: string
  title: string
  description: string
  accent: string
}) {
  return (
    <div className="bg-stone-900 p-8 group hover:bg-stone-800 transition-colors duration-200 flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className={`${accent}`}>{icon}</div>
        <span className="text-xs font-bold text-stone-600 tracking-widest">{index}</span>
      </div>
      <div>
        <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
        <p className="text-stone-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  )
}