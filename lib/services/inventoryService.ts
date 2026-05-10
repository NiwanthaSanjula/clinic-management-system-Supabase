// lib/services/inventoryService.ts
// All stock management logic
// FEFO = First Expiry First Out
// When deducting stock, always use the batch expiring soonest first

import { da } from "zod/v4/locales";
import { prisma } from "../prisma";

// ------ Stock receiving ------

// Add a new batch of medicine to inventory
export async function receiveBatch(data: {
    medicineId: string
    batchNumber: string
    quantity: number
    unitCost: number
    expiryDate: Date
    notes?: string
    receivedBy: string
}) {
    return prisma.$transaction(async (tx) => {
        // Create the batch
        const batch = await tx.inventoryBatch.create({
            data: {
                medicineId: data.medicineId,
                batchNumber: data.batchNumber,
                quantity: data.quantity,
                unitCost: data.unitCost,
                expiryDate: data.expiryDate,
                notes: data.notes
            }
        })

        // Record IN movement - full audit trail
        await tx.stockMovement.create({
            data: {
                medicineId: data.medicineId,
                batchId: batch.id,
                type: "IN",
                quantity: data.quantity,
                reason: "stock_received",
                referenceId: batch.id,
                createdBy: data.receivedBy,
            }
        })

        // Audit log
        await tx.auditLog.create({
            data: {
                userId: data.receivedBy,
                action: "RECEIVE_STOCK",
                entityType: "inventory_batch",
                entityId: batch.id,
                newValue: {
                    medicineId: batch.medicineId,
                    quantity: batch.quantity,
                    batchNumber: data.batchNumber
                }
            }
        })

        return batch
    })
}



// ------ FEFO Deduction ------
// Deduct stock for one medicine using FEFO
// Called once per prescription item when invoice is generated
// Returns false if insufficient stock
export async function deductStock(data: {
    medicineId: string
    quantityNeeded: number
    reason: string
    referenceId?: string // invoiceId
    createdBy: string
}): Promise<{ success: boolean; shortfall: number }> {

    // Get all batches for this medicine
    // FEFO order = soonest expiry first, then oldest received
    const batches = await prisma.inventoryBatch.findMany({
        where: {
            medicineId: data.medicineId,
            quantity: { gt: 0 }, // Only batches with stock
            expiryDate: { gt: new Date() }, // Only non-expired batches
        },
        orderBy: [
            { expiryDate: "asc" }, // FEFO: soonest expiry first
            { receivedDate: "asc" } // tiebreak: oldest batch first
        ]
    })

    // Check total available stock
    const totalAvailable = batches.reduce((sum, b) => sum + b.quantity, 0)
    if (totalAvailable < data.quantityNeeded) {
        return {
            success: false,
            shortfall: data.quantityNeeded - totalAvailable
        }
    }

    // Deduct from batches using FEFO
    let remaining = data.quantityNeeded

    for (const batch of batches) {
        if (remaining <= 0) break

        // How mutch to take from this batch
        const toDeduct = Math.min(batch.quantity, remaining)

        await prisma.$transaction(async (tx) => {
            // Reduce batch quantity
            await tx.inventoryBatch.update({
                where: { id: batch.id },
                data: { quantity: { decrement: toDeduct } }
            })

            // Record OUT movement
            await tx.stockMovement.create({
                data: {
                    medicineId: data.medicineId,
                    batchId: batch.id,
                    type: "OUT",
                    quantity: toDeduct,
                    reason: data.reason,
                    referenceId: data.referenceId,
                    createdBy: data.createdBy
                }
            })
        })

        remaining -= toDeduct
    }

    return { success: true, shortfall: 0 }
}


// ------ Stock Queries ------

// Total available stock per medicine
// Used for the stock leves page and low stock alerts
export async function getStockLevels() {
    const medicines = await prisma.medicine.findMany({
        where: { isActive: true },
        include: {
            batches: {
                where: {
                    quantity: { gt: 0 },
                    expiryDate: { gt: new Date() }
                },
                orderBy: { expiryDate: "asc" }
            }
        },
        orderBy: { name: "asc" }
    })

    // Calculate total and flag low/expiring stock
    return medicines.map(med => {
        const totalStock = med.batches.reduce((sum, b) => sum + b.quantity, 0)

        // Soonest expiring batch
        const nearestExpiry = med.batches[0]?.expiryDate ?? null

        // Flag expiring within 30 days
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
        const isExpiringSoon = nearestExpiry
            ? nearestExpiry <= thirtyDaysFromNow
            : false

        return {
            id: med.id,
            name: med.name,
            genericName: med.genericName,
            category: med.category,
            unit: med.unit,
            price: med.price,
            totalStock,
            batches: med.batches,
            nearestExpiry,
            isExpiringSoon,
            // Low stock = less than 20 units
            isLowStock: totalStock < 20 && totalStock > 0,
            isOutOfStock: totalStock === 0
        }

    })
}

// Get stock movements for a medicine — for history view
export async function getStockMovements(medicineId: string) {
    return prisma.stockMovement.findMany({
        where: { medicineId },
        include: {
            batch: {
                select: { batchNumber: true, expiryDate: true }
            }
        },
        orderBy: { createdAt: "desc" },
        take: 50
    })
}

// Get all batches for a specific medicine
export async function getMedicineBatches(medicineId: string) {
    return prisma.inventoryBatch.findMany({
        where: { medicineId },
        orderBy: { expiryDate: "asc" },
    })
}

// Count of low stock + out of stock medicines — for dashboard alert
export async function getLowStockCount() {
    const levels = await getStockLevels()
    return {
        lowStock: levels.filter(m => m.isLowStock).length,
        outOfStock: levels.filter(m => m.isOutOfStock).length,
        expiringSoon: levels.filter(m => m.isExpiringSoon).length
    }
}