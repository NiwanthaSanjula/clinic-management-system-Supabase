// app/(doctor)/doctor/inventory/page.tsx
// Doctor sees stock levels — read only, no receive stock or add medicine buttons
import { requireDoctor } from "@/lib/services/authService"
import { getStockLevels } from "@/lib/services/inventoryService"
import InventoryView from "@/components/inventory/InventoryView"

export default async function DoctorInventoryPage() {
    await requireDoctor()
    const stockLevels = await getStockLevels()

    return (
        <InventoryView
            stockLevels={stockLevels}
            role="DOCTOR"
            basePath="/doctor/inventory"
        />
    )
}