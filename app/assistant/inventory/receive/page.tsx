// app/assistant/inventory/receive/page.tsx
// Assistant receives new medicine stock into a batch

import { requireAssistant } from "@/lib/services/authService"
import { getMedicines } from "@/lib/services/consultationService"
import Link from "next/link"
import { PackagePlus } from "lucide-react"
import ReceiveBatchForm from "./ReceiveBatchForm"

export default async function ReceiveStockPage() {
    await requireAssistant()
    const medicines = await getMedicines()

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="flex flex-col gap-2">
                <Link href="/assistant/inventory" className="text-gray-400 hover:text-gray-600 text-sm">
                    ← Back
                </Link>

                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                        <PackagePlus size={24} className="text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Receive Stock</h1>
                        <p className="text-gray-500 text-sm">Add new medicine batch to inventory</p>
                    </div>
                </div>
            </div>

            <ReceiveBatchForm medicines={medicines} />
        </div>

    )
}

