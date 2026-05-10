import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../lib/generated/prisma/client"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const medicines = [
    { name: "Panadol", genericName: "Paracetamol", category: "Painkiller", unit: "tablets", defaultDosage: "500mg", price: 2.50 },
    { name: "Brufen", genericName: "Ibuprofen", category: "Painkiller", unit: "tablets", defaultDosage: "400mg", price: 3.00 },
    { name: "Mefenamic Acid", genericName: "Mefenamic Acid", category: "Painkiller", unit: "tablets", defaultDosage: "500mg", price: 4.00 },
    { name: "Amoxil", genericName: "Amoxicillin", category: "Antibiotic", unit: "capsules", defaultDosage: "500mg", price: 8.00 },
    { name: "Augmentin", genericName: "Amoxicillin + Clavulanate", category: "Antibiotic", unit: "tablets", defaultDosage: "625mg", price: 15.00 },
    { name: "Flagyl", genericName: "Metronidazole", category: "Antibiotic", unit: "tablets", defaultDosage: "400mg", price: 5.00 },
    { name: "Septrin", genericName: "Cotrimoxazole", category: "Antibiotic", unit: "tablets", defaultDosage: "480mg", price: 4.50 },
    { name: "Omeprazole", genericName: "Omeprazole", category: "Antacid", unit: "capsules", defaultDosage: "20mg", price: 6.00 },
    { name: "Ranitidine", genericName: "Ranitidine", category: "Antacid", unit: "tablets", defaultDosage: "150mg", price: 3.50 },
    { name: "Gaviscon", genericName: "Alginate + Antacid", category: "Antacid", unit: "tablets", defaultDosage: "1 tablet", price: 5.00 },
    { name: "Piriton", genericName: "Chlorphenamine", category: "Antihistamine", unit: "tablets", defaultDosage: "4mg", price: 2.00 },
    { name: "Cetirizine", genericName: "Cetirizine", category: "Antihistamine", unit: "tablets", defaultDosage: "10mg", price: 3.00 },
    { name: "Loratadine", genericName: "Loratadine", category: "Antihistamine", unit: "tablets", defaultDosage: "10mg", price: 3.00 },
    { name: "Benadryl", genericName: "Diphenhydramine", category: "Cough & Cold", unit: "ml", defaultDosage: "10ml", price: 12.00 },
    { name: "Actifed", genericName: "Triprolidine + Pseudoephedrine", category: "Cough & Cold", unit: "tablets", defaultDosage: "1 tablet", price: 4.00 },
    { name: "Vitamin C", genericName: "Ascorbic Acid", category: "Vitamin", unit: "tablets", defaultDosage: "500mg", price: 1.50 },
    { name: "Zinc Sulphate", genericName: "Zinc", category: "Vitamin", unit: "tablets", defaultDosage: "20mg", price: 2.00 },
    { name: "B Complex", genericName: "Vitamin B Complex", category: "Vitamin", unit: "tablets", defaultDosage: "1 tablet", price: 2.00 },
    { name: "Fluconazole", genericName: "Fluconazole", category: "Antifungal", unit: "capsules", defaultDosage: "150mg", price: 10.00 },
    { name: "Metformin", genericName: "Metformin", category: "Diabetes", unit: "tablets", defaultDosage: "500mg", price: 5.00 },
    { name: "Amlodipine", genericName: "Amlodipine", category: "Antihypertensive", unit: "tablets", defaultDosage: "5mg", price: 7.00 },
    { name: "Atenolol", genericName: "Atenolol", category: "Antihypertensive", unit: "tablets", defaultDosage: "50mg", price: 6.00 },
]

// Initial stock batches — realistic quantities for a small clinic
// batchNumber, quantity, unitCost, expiryDate (months from now)
const initialBatches: Record<string, {
    batchNumber: string
    quantity: number
    unitCost: number
    expiryMonths: number  // months from today
}[]> = {
    "Panadol": [
        { batchNumber: "PN2025A", quantity: 500, unitCost: 1.80, expiryMonths: 18 },
        { batchNumber: "PN2025B", quantity: 300, unitCost: 1.90, expiryMonths: 24 },
    ],
    "Brufen": [
        { batchNumber: "BR2025A", quantity: 200, unitCost: 2.20, expiryMonths: 20 },
    ],
    "Mefenamic Acid": [
        { batchNumber: "MF2025A", quantity: 150, unitCost: 3.00, expiryMonths: 16 },
    ],
    "Amoxil": [
        { batchNumber: "AM2025A", quantity: 100, unitCost: 6.00, expiryMonths: 12 },
        { batchNumber: "AM2025B", quantity: 80, unitCost: 6.20, expiryMonths: 18 },
    ],
    "Augmentin": [
        { batchNumber: "AU2025A", quantity: 60, unitCost: 11.00, expiryMonths: 14 },
    ],
    "Flagyl": [
        { batchNumber: "FL2025A", quantity: 120, unitCost: 3.50, expiryMonths: 15 },
    ],
    "Septrin": [
        { batchNumber: "SE2025A", quantity: 100, unitCost: 3.20, expiryMonths: 18 },
    ],
    "Omeprazole": [
        { batchNumber: "OM2025A", quantity: 200, unitCost: 4.50, expiryMonths: 20 },
    ],
    "Ranitidine": [
        // Intentionally low — to test low stock alert
        { batchNumber: "RA2025A", quantity: 15, unitCost: 2.50, expiryMonths: 10 },
    ],
    "Gaviscon": [
        { batchNumber: "GA2025A", quantity: 80, unitCost: 3.80, expiryMonths: 18 },
    ],
    "Piriton": [
        { batchNumber: "PI2025A", quantity: 300, unitCost: 1.40, expiryMonths: 24 },
    ],
    "Cetirizine": [
        { batchNumber: "CE2025A", quantity: 200, unitCost: 2.00, expiryMonths: 22 },
    ],
    "Loratadine": [
        { batchNumber: "LO2025A", quantity: 150, unitCost: 2.10, expiryMonths: 20 },
    ],
    "Benadryl": [
        { batchNumber: "BE2025A", quantity: 40, unitCost: 9.00, expiryMonths: 12 },
    ],
    "Actifed": [
        { batchNumber: "AC2025A", quantity: 80, unitCost: 3.00, expiryMonths: 14 },
    ],
    "Vitamin C": [
        { batchNumber: "VC2025A", quantity: 400, unitCost: 1.00, expiryMonths: 24 },
    ],
    "Zinc Sulphate": [
        // Intentionally expiring soon — to test expiry alert
        { batchNumber: "ZN2025A", quantity: 50, unitCost: 1.50, expiryMonths: 1 },
    ],
    "B Complex": [
        { batchNumber: "BC2025A", quantity: 200, unitCost: 1.50, expiryMonths: 20 },
    ],
    "Fluconazole": [
        { batchNumber: "FC2025A", quantity: 30, unitCost: 7.50, expiryMonths: 18 },
    ],
    "Metformin": [
        { batchNumber: "MET2025A", quantity: 300, unitCost: 3.80, expiryMonths: 22 },
    ],
    "Amlodipine": [
        { batchNumber: "AML2025A", quantity: 200, unitCost: 5.20, expiryMonths: 20 },
    ],
    "Atenolol": [
        // Intentionally out of stock — no batch seeded, to test out of stock
    ],
}

async function main() {
    console.log("Seeding medicines...")

    // Upsert medicines — safe to run multiple times
    for (const medicine of medicines) {
        await prisma.medicine.upsert({
            where: { name_genericName: { name: medicine.name, genericName: medicine.genericName } },
            update: { price: medicine.price }, // update price if changed
            create: medicine,
        })
    }
    console.log(`✅ Seeded ${medicines.length} medicines`)

    // Seed inventory batches
    console.log("Seeding inventory batches...")
    let batchCount = 0

    for (const [medicineName, batches] of Object.entries(initialBatches)) {
        // Find the medicine
        const medicine = await prisma.medicine.findFirst({
            where: { name: medicineName }
        })
        if (!medicine) {
            console.warn(`⚠ Medicine not found: ${medicineName}`)
            continue
        }

        for (const batch of batches) {
            // Check if batch already exists — skip if so
            const existing = await prisma.inventoryBatch.findFirst({
                where: {
                    medicineId: medicine.id,
                    batchNumber: batch.batchNumber
                }
            })
            if (existing) continue

            // Calculate expiry date from months
            const expiryDate = new Date()
            expiryDate.setMonth(expiryDate.getMonth() + batch.expiryMonths)

            // Create batch + stock movement in transaction
            await prisma.$transaction(async (tx) => {
                const newBatch = await tx.inventoryBatch.create({
                    data: {
                        medicineId: medicine.id,
                        batchNumber: batch.batchNumber,
                        quantity: batch.quantity,
                        unitCost: batch.unitCost,
                        expiryDate,
                    }
                })

                // Record IN movement for audit trail
                await tx.stockMovement.create({
                    data: {
                        medicineId: medicine.id,
                        batchId: newBatch.id,
                        type: "IN",
                        quantity: batch.quantity,
                        reason: "initial_stock",
                        referenceId: newBatch.id,
                        createdBy: "system",
                    }
                })
            })

            batchCount++
        }
    }

    console.log(`✅ Seeded ${batchCount} inventory batches`)

    // Seed clinic settings
    const existingSettings = await prisma.clinicSettings.findFirst()
    if (!existingSettings) {
        await prisma.clinicSettings.create({
            data: {
                clinicName: "My Clinic",
                openTime: "09:00",
                closeTime: "17:00",
                slotDuration: 20,
                lunchStart: "13:00",
                lunchEnd: "13:30",
                consultFee: 1000,
            }
        })
        console.log("✅ Seeded clinic settings")
    } else {
        console.log("⏭ Clinic settings already exist")
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())