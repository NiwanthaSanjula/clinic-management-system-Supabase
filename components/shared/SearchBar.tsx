// components/shared/SearchBar.tsx
// Used by assistant, doctor, and any future list pages

"use client"

import { Search } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { ChangeEvent, startTransition, useTransition } from "react"
import { Input } from "../ui/input"

type Props = {
    defaultValue: string
    placeholder?: string
}

export default function SearchBar({
    defaultValue,
    placeholder = "Search by name, NIC, or phone..."
}: Props) {

    //localhost:3000/doctor/patients, pathname grabs exactly that string. router allows you to change the URL without doing a hard page refresh.
    const router = useRouter()
    const pathname = usePathname()
    //const [pending, startTransition] = useTransition()

    function handleSearch(e: ChangeEvent<HTMLInputElement>) {

        router.replace(`${pathname}?search=${e.target.value}&page=1`)
        /*startTransition(() => {
            // update URL search param - triggers server component to re-fetch
            router.replace(`${pathname}?search=${e.target.value}&page=1`)
        })*/
    }

    return (
        <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
                defaultValue={defaultValue}
                onChange={handleSearch}
                placeholder={placeholder}
                className="pl-9"
            />
            {/*pending && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 animate-pulse">
                    Searching...
                </span>
            )*/}
        </div>
    )
}