// app/doctor/audit/page.tsx
// Doctor views full audit trail of all actions in the system
// Read only — shows who did what and when

import { requireDoctor } from "@/lib/services/authService"
import { getAuditLogs } from "@/lib/services/dashboardService"
import Pagination from "@/components/shared/Pagination"
import { ScrollText } from "lucide-react"

type Props = {
    searchParams: Promise<{ page?: string }>
}

// Color per action type — makes log easier to scan
function getActionColor(action: string) {
    if (action.includes("CREATE")) return "bg-emerald-100 text-emerald-700"
    if (action.includes("UPDATE")) return "bg-blue-100 text-blue-700"
    if (action.includes("DELETE")) return "bg-red-100 text-red-700"
    if (action.includes("INVOICE") || action.includes("PAYMENT")) return "bg-amber-100 text-amber-700"
    if (action.includes("CONSULTATION")) return "bg-purple-100 text-purple-700"
    if (action.includes("STOCK")) return "bg-teal-100 text-teal-700"
    return "bg-gray-100 text-gray-600"
}

export default async function AuditLogPage({ searchParams }: Props) {
    await requireDoctor()

    const { page } = await searchParams
    const { logs, total, totalPages, currentPage } = await getAuditLogs({
        page: Number(page ?? 1)
    })

    return (
        <div className="space-y-4 max-w-5xl mx-auto">

            {/* Header */}
            <div className="flex items-center gap-3">
                <ScrollText size={36} className="text-blue-500" />
                <div>
                    <h1 className="text-2xl font-bold">Audit Log</h1>
                    <p className="text-gray-500 text-sm">
                        {total} total records — complete action history
                    </p>
                </div>
            </div>

            {/* Log table */}
            <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
                <table className="w-full text-xs">
                    <thead className="bg-blue-500">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium text-white">Action</th>
                            <th className="text-left px-4 py-3 font-medium text-white">Entity</th>
                            <th className="text-left px-4 py-3 font-medium text-white">Actor</th>
                            <th className="text-left px-4 py-3 font-medium text-white">Changes</th>
                            <th className="text-left px-4 py-3 font-medium text-white">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-gray-400">
                                    No audit logs yet
                                </td>
                            </tr>
                        ) : (
                            logs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50">

                                    {/* Action badge */}
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                                            ${getActionColor(log.action)}`}>
                                            {log.action.replace(/_/g, " ")}
                                        </span>
                                    </td>

                                    {/* Entity type + ID */}
                                    <td className="px-4 py-3">
                                        <p className="font-medium capitalize">
                                            {log.entityType}
                                        </p>
                                        <p className="text-gray-400 font-mono text-xs">
                                            {log.entityId.slice(0, 12)}...
                                        </p>
                                    </td>

                                    {/* Who did it */}
                                    <td className="px-4 py-3 font-mono text-gray-500">
                                        {log.userId === "system"
                                            ? <span className="text-gray-400 italic">system</span>
                                            : log.userId.slice(0, 8) + "..."
                                        }
                                    </td>

                                    {/* What changed */}
                                    <td className="px-4 py-3 max-w-xs">
                                        {log.newValue && (
                                            <p className="text-gray-500 truncate">
                                                {JSON.stringify(log.newValue)
                                                    .slice(0, 60)}
                                                {JSON.stringify(log.newValue).length > 60
                                                    ? "..." : ""}
                                            </p>
                                        )}
                                    </td>

                                    {/* Timestamp */}
                                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                                        {new Date(log.createdAt).toLocaleDateString("en-GB", {
                                            day: "numeric",
                                            month: "short",
                                        })}
                                        {" "}
                                        {new Date(log.createdAt).toLocaleTimeString("en-GB", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                search=""
            />
        </div>
    )
}