// app/(doctor)/doctor/patients/page.tsx
// Doctor can view patient list — read only, no create button

import { requireDoctor } from "@/lib/services/authService"
import { getPatients } from "@/lib/services/patientService"
import Link from "next/link"
import { Users } from "lucide-react"
import Pagination from "@/components/shared/Pagination"
import SearchBar from "@/components/shared/SearchBar"
import { Suspense } from "react"
import PatientData from "@/components/patients/PatientData"

type Props = {
    searchParams: Promise<{ search?: string; page?: string }>
}

export default async function DoctorPatientsPage({ searchParams }: Props) {
    await requireDoctor()

    const { search, page } = await searchParams

    const currentSearch = search ?? ""
    const currentPage = Number(page ?? 1)

    /*const { patients, total, totalPages, currentPage } = await getPatients({
        search: search ?? "",
        page: Number(page ?? 1),
    })*/

    return (
        <div className="space-y-4">

            <div className="flex items-center gap-2">
                <Users size={46} className="text-emerald-500" />

                <div>
                    <h1 className="text-2xl font-bold">Patients</h1>

                </div>
            </div>

            <SearchBar defaultValue={search ?? ""} />

            <Suspense
                key={currentSearch + currentPage}
                fallback={<TableSkeleton />}
            >
                <PatientData
                    search={currentSearch}
                    page={currentPage}
                    basePath="/doctor/patients"
                    showPhone={true}
                />
            </Suspense>



        </div>
    )
}

function TableSkeleton() {
    return (
        <div className="flex flex-col gap-2 w-full">
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="w-full h-8 bg-gray-200 rounded animate-pulse" />
            ))}
        </div>
    )
}