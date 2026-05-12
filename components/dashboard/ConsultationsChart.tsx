// components/dashboard/ConsultationsChart.tsx
// Bar chart for doctor — consultations per day last 7 days
"use client"

import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, Cell
} from "recharts"

type DataPoint = {
    day: string
    consultations: number
    isToday: boolean
}

type Props = { data: DataPoint[] }

export default function ConsultationsChart({ data }: Props) {
    return (
        <div className="bg-white rounded-lg border p-5 shadow-md">
            <div className="mb-4">
                <h2 className="font-semibold text-sm text-gray-700">
                    Consultations — Last 7 Days
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                    Completed consultations only
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
                        formatter={(value: any) => [value, "Consultations"]}
                    />
                    <Bar dataKey="consultations" radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell
                                key={index}
                                fill={entry.isToday ? "#3b82f6" : "#c7d2fe"}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            <div className="flex items-center gap-3 mt-2 justify-end">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-indigo-200" />
                    <span className="text-xs text-gray-400">Past days</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-blue-500" />
                    <span className="text-xs text-gray-400">Today</span>
                </div>
            </div>
        </div>
    )
}