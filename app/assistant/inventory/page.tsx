// app/(assistant)/assistant/inventory/page.tsx
import { requireAssistant } from "@/lib/services/authService"
import { getStockLevels } from "@/lib/services/inventoryService"
import InventoryView from "@/components/inventory/InventoryView"

export default async function AssistantInventoryPage() {
    await requireAssistant()
    const stockLevels = await getStockLevels()

    return (
        <InventoryView
            stockLevels={stockLevels}
            role="ASSISTANT"
            basePath="/assistant/inventory"
        />
    )
}