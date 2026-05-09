// prisma/seed.ts
// Run this once to populate the medicines table with common clinic medicines
// Command: npx tsx prisma/seed.ts


import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import * as dotenv from "dotenv"

// 1. Force the script to read your .env.local file
dotenv.config({ path: ".env.local" })

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!
})

const prisma = new PrismaClient({ adapter });

const medicines = [
    // Painkillers
    { name: "Panadol", genericName: "Paracetamol", category: "Painkiller", unit: "tablets", defaultDosage: "500mg", price: 2.50 },
    { name: "Brufen", genericName: "Ibuprofen", category: "Painkiller", unit: "tablets", defaultDosage: "400mg", price: 3.00 },
    { name: "Mefenamic Acid", genericName: "Mefenamic Acid", category: "Painkiller", unit: "tablets", defaultDosage: "500mg", price: 4.00 },

    // Antibiotics
    { name: "Amoxil", genericName: "Amoxicillin", category: "Antibiotic", unit: "capsules", defaultDosage: "500mg", price: 8.00 },
    { name: "Augmentin", genericName: "Amoxicillin + Clavulanate", category: "Antibiotic", unit: "tablets", defaultDosage: "625mg", price: 15.00 },
    { name: "Flagyl", genericName: "Metronidazole", category: "Antibiotic", unit: "tablets", defaultDosage: "400mg", price: 5.00 },
    { name: "Septrin", genericName: "Cotrimoxazole", category: "Antibiotic", unit: "tablets", defaultDosage: "480mg", price: 4.50 },

    // Antacids
    { name: "Omeprazole", genericName: "Omeprazole", category: "Antacid", unit: "capsules", defaultDosage: "20mg", price: 6.00 },
    { name: "Ranitidine", genericName: "Ranitidine", category: "Antacid", unit: "tablets", defaultDosage: "150mg", price: 3.50 },
    { name: "Gaviscon", genericName: "Alginate + Antacid", category: "Antacid", unit: "tablets", defaultDosage: "1 tablet", price: 5.00 },

    // Antihistamines
    { name: "Piriton", genericName: "Chlorphenamine", category: "Antihistamine", unit: "tablets", defaultDosage: "4mg", price: 2.00 },
    { name: "Cetirizine", genericName: "Cetirizine", category: "Antihistamine", unit: "tablets", defaultDosage: "10mg", price: 3.00 },
    { name: "Loratadine", genericName: "Loratadine", category: "Antihistamine", unit: "tablets", defaultDosage: "10mg", price: 3.00 },

    // Cough & Cold
    { name: "Benadryl", genericName: "Diphenhydramine", category: "Cough & Cold", unit: "ml", defaultDosage: "10ml", price: 12.00 },
    { name: "Actifed", genericName: "Triprolidine + Pseudoephedrine", category: "Cough & Cold", unit: "tablets", defaultDosage: "1 tablet", price: 4.00 },

    // Vitamins
    { name: "Vitamin C", genericName: "Ascorbic Acid", category: "Vitamin", unit: "tablets", defaultDosage: "500mg", price: 1.50 },
    { name: "Zinc Sulphate", genericName: "Zinc", category: "Vitamin", unit: "tablets", defaultDosage: "20mg", price: 2.00 },
    { name: "B Complex", genericName: "Vitamin B Complex", category: "Vitamin", unit: "tablets", defaultDosage: "1 tablet", price: 2.00 },

    // Antifungals
    { name: "Fluconazole", genericName: "Fluconazole", category: "Antifungal", unit: "capsules", defaultDosage: "150mg", price: 10.00 },

    // Diabetes
    { name: "Metformin", genericName: "Metformin", category: "Diabetes", unit: "tablets", defaultDosage: "500mg", price: 5.00 },

    // Blood Pressure
    { name: "Amlodipine", genericName: "Amlodipine", category: "Antihypertensive", unit: "tablets", defaultDosage: "5mg", price: 7.00 },
    { name: "Atenolol", genericName: "Atenolol", category: "Antihypertensive", unit: "tablets", defaultDosage: "50mg", price: 6.00 },
]

async function main() {
    console.log("Seeding medicines...")

    // upsert = insert if not exists, update if exists
    // Safe to run multiple times without duplicates
    for (const medicine of medicines) {
        await prisma.medicine.upsert({
            where: {
                // unique on name + genericName combination
                name_genericName: {
                    name: medicine.name,
                    genericName: medicine.genericName,
                }
            },
            update: {

            },
            create: medicine,
        })
    }

    console.log(`✅ Seeded ${medicines.length} medicines`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())