// app/(assistant)/assistant/patients/page.tsx

import { requireAssistant } from "@/lib/services/authService";
import { getPatients } from "@/lib/services/patientService";
import Link from "next/link";
import SearchBar from "./SearchBar";
import { UserPlus, Users } from "lucide-react";

type Props = {
    searchParams: Promise<{ search?: string; page?: string }>
}

const TABLE_HEADERS = ["Name", "NIC", "Phone", "Blood Group", "Registered", "Actions"];

export default async function PatientsPage({ searchParams }: Props) {
    await requireAssistant()

    const { search, page } = await searchParams

    const { patients, total, totalPages, currentPage } = await getPatients({
        search: search ?? "",
        page: Number(page ?? 1)
    })

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users size={45} className="text-emerald-500" />
                    <div className="">
                        <h1 className="text-2xl font-bold">Patients</h1>
                        <p className="text-gray-500 text-sm">{total} total patients</p>
                    </div>
                </div>
                <Link
                    href={"/assistant/patients/new"}
                    className="flex items-center gap-2 bg-emerald-500 text-white font-bold px-4 py-2 rounded-md text-sm hover:bg-emerald-600 transition-colors"
                >
                    <UserPlus size={20} />
                    <span>Add New Patient</span>
                </Link>
            </div>
            {/* Search */}
            <SearchBar defaultValue={search ?? ""} />

            {/* table */}
            <div className="bg-white rounded-lg border overflow-hidden shadow-md">
                <table className="w-full text-xs">
                    <thead className="bg-blue-500 border-b">
                        <tr className="">
                            {TABLE_HEADERS.map((header) => (
                                <th
                                    key={header}
                                    className="text-left px-4 py-3 font-medium text-white"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {patients.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-gray-500">
                                    {search ? `No results for "${search}"` : "No patients found."}
                                </td>
                            </tr>
                        ) : (
                            patients.map((patient) => (
                                <tr
                                    key={patient.id} className="hover:bg-gray-50"
                                >
                                    <td className="px-4 py-3 font-medium">{patient.profile.name}</td>
                                    <td className="px-4 py-3 text-gray-500">{patient.nic}</td>
                                    <td className="px-4 py-3 text-gray-500">{patient.phone}</td>
                                    <td className="px-4 py-3">
                                        {patient.bloodGroup ? (
                                            <span className="bg-red-100 text-red-500 px-2 py-0.5 rounded text-xs font-medium">
                                                {patient.bloodGroup}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">
                                                No record
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {new Date(patient.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/assistant/patients/${patient.id}`}
                                            className="text-blue-500 hover:underline text-xs"
                                        >
                                            View →
                                        </Link>
                                    </td>

                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* pagination */}
            <div className="flex items-center justify-center text-sm text-gray-500">
                <p>Page {currentPage} of {totalPages}</p>
                <div className="flex gap-2">
                    {currentPage > 1 && (
                        <Link
                            href={`?search=${search ?? ""}&page=${currentPage - 1}`}
                            className="px-3 py-1 border rounded hover:bg-gray-50"
                        >
                            ← Prev
                        </Link>
                    )}
                    {currentPage < totalPages && (
                        <Link
                            href={`?search=${search ?? ""}&page=${currentPage + 1}`}
                            className="px-3 py-1 border rounded hover:bg-gray-50"
                        >
                            Next →
                        </Link>
                    )}
                </div>
            </div>

        </div>
    )
}