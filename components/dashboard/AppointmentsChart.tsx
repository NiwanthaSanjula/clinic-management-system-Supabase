// components/dashboard/AppointmentsChart.tsx
// Bar chart showing appointments per day for last 7 days
// Used on assistant dashboard
"use client"

import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, Cell
} from "recharts"

type DataPoint = {
    day: string
    appointments: number
    isToday: boolean
}

type Props = { data: DataPoint[] }

export default function AppointmentsChart({ data }: Props) {
    return (
        <div className="bg-white rounded-lg border shadow-md p-5">
            <div className="mb-4">
                <h2 className="font-semibold text-sm text-gray-700">
                    Appointments — Last 7 Days
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                    Excluding cancelled
                </p>
            </div>

            <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data} barSize={32}>
                    <XAxis
                        dataKey="day"
                        tick={{ fontSize: 12, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 12, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                        width={24}
                    />
                    <Tooltip
                        cursor={{ fill: "#f9fafb" }}
                        contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                            fontSize: "12px"
                        }}
                        formatter={(value: any) => [value, "Appointments"]}
                    />
                    <Bar dataKey="appointments" radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell
                                key={index}
                                // Today's bar is highlighted
                                fill={entry.isToday ? "#10b981" : "#bfdbfe"}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            <div className="flex items-center gap-3 mt-2 justify-end">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-blue-200" />
                    <span className="text-xs text-gray-400">Past days</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                    <span className="text-xs text-gray-400">Today</span>
                </div>
            </div>
        </div>
    )
}