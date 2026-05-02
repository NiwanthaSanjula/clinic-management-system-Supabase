// app/(doctor)/doctor/patients/page.tsx
// Doctor can view patient list — read only, no create button

import { requireDoctor } from "@/lib/services/authService"
import { getPatients } from "@/lib/services/patientService"
import Link from "next/link"
import SearchBar from "@/app/assistant/patients/SearchBar"
import { Users } from "lucide-react"

type Props = {
    searchParams: Promise<{ search?: string; page?: string }>
}

export default async function DoctorPatientsPage({ searchParams }: Props) {
    await requireDoctor()

    const { search, page } = await searchParams
    const { patients, total, totalPages, currentPage } = await getPatients({
        search: search ?? "",
        page: Number(page ?? 1),
    })

    return (
        <div className="space-y-4">

            <div className="flex items-center gap-2">
                <Users size={46} className="text-emerald-500" />

                <div>
                    <h1 className="text-2xl font-bold">Patients</h1>
                    <p className="text-gray-500 text-sm">{total} total patients</p>
                </div>
            </div>

            <SearchBar defaultValue={search ?? ""} />

            <div className="bg-white rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="border-b bg-blue-500 text-white font-medium">
                        <tr>
                            <th className="text-left px-4 py-3">Name</th>
                            <th className="text-left px-4 py-3">NIC</th>
                            <th className="text-left px-4 py-3">Blood Group</th>
                            <th className="text-left px-4 py-3">Allergies</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {patients.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-gray-400">
                                    No patients found
                                </td>
                            </tr>
                        ) : (
                            patients.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{p.profile.name}</td>
                                    <td className="px-4 py-3 text-gray-600">{p.nic}</td>
                                    <td className="px-4 py-3">
                                        {p.bloodGroup ? (
                                            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-medium">
                                                {p.bloodGroup}
                                            </span>
                                        ) : "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        {p.knownAllergies ? (
                                            <span className="text-red-500 text-xs font-medium">⚠ {p.knownAllergies}</span>
                                        ) : (
                                            <span className="text-gray-400 text-xs">None</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link href={`/doctor/patients/${p.id}`} className="text-blue-600 hover:underline text-xs">
                                            View →
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>


            <div className="flex items-center justify-center text-sm text-gray-600">
                <p>Page {currentPage} of {totalPages}</p>
                <div className="flex gap-2">
                    {currentPage > 1 && (
                        <Link href={`?search=${search ?? ""}&page=${currentPage - 1}`}
                            className="px-3 py-1 border rounded hover:bg-gray-50">← Prev</Link>
                    )}
                    {currentPage < totalPages && (
                        <Link href={`?search=${search ?? ""}&page=${currentPage + 1}`}
                            className="px-3 py-1 border rounded hover:bg-gray-50">Next →</Link>
                    )}
                </div>
            </div>

        </div>
    )
}