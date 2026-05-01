"use client"

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useTransition } from "react";

export default function SearchBar({ defaultValue }: { defaultValue: string }) {

    //localhost:3000/doctor/patients, pathname grabs exactly that string. router allows you to change the URL without doing a hard page refresh.
    const router = useRouter()
    const pathname = usePathname()
    const [pending, startTransition] = useTransition()

    function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value
        startTransition(() => {
            // update URL search param - triggers server component to re-fetch
            router.replace(`${pathname}?search=${value}&page=1`)
        })
    }

    return (
        <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
                defaultValue={defaultValue}
                onChange={handleSearch}
                placeholder="Search by name, NIC, or phone..."
                className="w-full pl-9 pr-4 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500"
            />
            {pending && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 animate-pulse">
                    Searching...
                </span>
            )}
        </div>
    )
}