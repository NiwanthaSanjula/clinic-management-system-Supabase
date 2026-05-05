import { getPatients } from "@/lib/services/patientService"
import Pagination from "../shared/Pagination"
import Link from "next/link"

// --- types ---
type Patient = {
    id: string
    nic: string
    phone: string
    bloodGroup: string | null
    knownAllergies: string | null
    createdAt: Date
    profile: { name: string }
}

type Props = {
    search: string
    page: number
    basePath: string
    showPhone?: boolean
    showAllergies?: boolean
}

export default async function PatientData({
    search,
    page,
    basePath,
    showPhone = false,
    showAllergies = false
}: Props) {
    // 1. Do the heavy lifting here
    const { patients, total, totalPages, currentPage } = await getPatients({
        search,
        page
    })

    // 2. Return the finished UI
    return (
        <>
            <PatientTable
                patients={patients}
                search={search}
                basePath={basePath}
                showPhone={showPhone}
                showAllergies={showAllergies}
            />
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                search={search}
            />
        </>
    )
}



// --- Internal Component ---
// Not exported

function PatientTable({
    patients,
    search,
    basePath,
    showPhone = false,
    showAllergies = false,
}: {
    patients: Patient[]
    search?: string
    basePath: string
    showPhone?: boolean
    showAllergies?: boolean
}) {
    if (patients.length === 0) {
        return (
            <div className="bg-white rounded-lg border p-12 text-center text-gray-400">
                {search ? `No results for "${search}"` : "No patients found."}
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg border overflow-hidden shadow-sm"
        >
            <table className="w-full text-xs">
                <thead className="bg-blue-500">
                    <tr>
                        <th className="text-left px-4 py-3 font-medium text-white">Name</th>
                        <th className="text-left px-4 py-3 font-medium text-white">NIC</th>
                        {showPhone && (
                            <th className="text-left px-4 py-3 font-medium text-white">Phone</th>
                        )}
                        <th className="text-left px-4 py-3 font-medium text-white">Blood Group</th>
                        {showAllergies && (
                            <th className="text-left px-4 py-3 font-medium text-white">Allergies</th>
                        )}
                        <th className="text-left px-4 py-3 font-medium text-white">Registered</th>
                        <th className="px-4 py-3"></th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {patients.map((patient) => (
                        <tr key={patient.id} className="hover:bg-gray-50">

                            <td className="px-4 py-3 font-medium">{patient.profile.name}</td>
                            <td className="px-4 py-3 text-gray-500">{patient.nic}</td>

                            {showPhone && (
                                <td className="px-4 py-3 text-gray-500">{patient.phone}</td>
                            )}

                            <td className="px-4 py-3">
                                {patient.bloodGroup ? (
                                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-medium">
                                        {patient.bloodGroup}
                                    </span>
                                ) : (
                                    <span className="text-gray-400">—</span>
                                )}
                            </td>

                            {showAllergies && (
                                <td className="px-4 py-3">
                                    {patient.knownAllergies ? (
                                        <span className="text-red-500 text-xs font-medium">
                                            ⚠ {patient.knownAllergies}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">None</span>
                                    )}
                                </td>
                            )}

                            <td className="px-4 py-3 text-gray-500">
                                {new Date(patient.createdAt).toLocaleDateString()}
                            </td>

                            <td className="px-4 py-3">
                                <Link
                                    href={`${basePath}/${patient.id}`}
                                    className="text-blue-500 hover:underline"
                                >
                                    View →
                                </Link>
                            </td>

                        </tr>
                    ))}

                </tbody>

            </table>
        </div>
    )
}
