// components/shared/Pagination.tsx
// Reused on any page that has prev/next pagination

import Link from "next/link";

type Props = {
    currentPage: number
    totalPages: number
    search?: string
}

export default function Pagination({ currentPage, totalPages, search }: Props) {
    return (
        <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
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
    )
}