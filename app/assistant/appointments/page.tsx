
import { getAppointmentsByDate } from "@/lib/services/appointmentService"
import { requireAssistant } from "@/lib/services/authService"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import QueueBoard from "./QueueBoard"


type Props = {
    searchParams: Promise<{ date?: string }>
}

export default async function AppointmentsPage({ searchParams }: Props) {

    await requireAssistant()

    const { date } = await searchParams
    const today = new Date().toISOString().split("T")[0]
    const viewing = date ?? today

    const appointments = await getAppointmentsByDate(viewing)

    return (
        <div className="space-y-4 max-w-6xl mx-auto">
            { /** --- header --- */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">
                        Appointments
                    </h1>
                    <p className="text-gray-500">
                        {viewing === today ? "Today" : viewing}
                    </p>
                </div>

                <div>
                    <Link
                        href={"/assistant/appointments/walkin"}
                        className="border px-4 py-2 rounded-md text-sm hover:bg-gray-50"
                    >
                        + Walk-In
                    </Link>

                    <Link
                        href="/assistant/appointments/new"
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                    >
                        + Book
                    </Link>
                </div>
            </div>

            {/* --- Date navigation --- */}
            <div className="flex items-center gap-2">
                <Link
                    href={`?date=${getPrevDate(viewing)}`}
                    className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
                >
                    <ChevronLeft size={20} />
                </Link>

                <input
                    type="date"
                    defaultValue={viewing}
                    onChange={e => window.location.href = `?date=${e.target.value}`}
                    className="border rounded px-3 py-1 text-sm"
                />

                <Link
                    href={`?date=${getNextDate(viewing)}`}
                    className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
                >
                    <ChevronRight size={20} />
                </Link>

                {viewing !== today && (
                    <Link
                        href="?" className="text-blue-600 text-sm hover:underline"
                    >
                        Today
                    </Link>
                )}
            </div>

            {/* Queue board — client component for status updates */}
            <QueueBoard
                appointments={appointments}
                date={viewing}
            />
        </div>
    )
}

function getPrevDate(date: string) {
    const d = new Date(date)
    d.setDate(d.getDate() - 1)
    return d.toISOString().split("T")[0]
}

function getNextDate(date: string) {
    const d = new Date(date)
    d.setDate(d.getDate() + 1)
    return d.toISOString().split("T")[0]
}