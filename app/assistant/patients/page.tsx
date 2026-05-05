// app/(assistant)/assistant/patients/page.tsx
import { requireAssistant } from "@/lib/services/authService";
import { getPatients } from "@/lib/services/patientService";
import Link from "next/link";
import { UserPlus, Users } from "lucide-react";
import SearchBar from "@/components/shared/SearchBar";
import { Suspense } from "react";
import PatientData from "@/components/patients/PatientData";

type Props = {
    searchParams: Promise<{ search?: string; page?: string }>
}

export default async function PatientsPage({ searchParams }: Props) {
    await requireAssistant()

    const { search, page } = await searchParams

    const currentSearch = search ?? ""
    const currentPage = Number(page ?? 1)

    /*const { patients, total, totalPages, currentPage } = await getPatients({
        search: search ?? "",
        page: Number(page ?? 1)
    })*/

    return (
        <div className="space-y-4 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users size={45} className="text-emerald-500" />
                    <div className="">
                        <h1 className="text-2xl font-bold">Patients</h1>
                        { /*<p className="text-gray-500 text-sm">{total} total patients</p>*/}
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

            {/* Shared table - assistant sees phone column */}
            {/*<PatientTable
                patients={patients}
                search={search}
                basePath="/assistant/patients"
                showPhone
            />*/}

            {/* pagination */}
            {/*<Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                search={search ?? ""}
            />*/}

            <Suspense
                key={currentSearch + currentPage}
                fallback={<TableSkeleton />}
            >
                <PatientData
                    search={currentSearch}
                    page={currentPage}
                    basePath="/assistant/patients"
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

