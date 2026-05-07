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
    { name: "Panadol", genericName: "Paracetamol", category: "Painkiller", unit: "tablets", defaultDosage: "500mg" },
    { name: "Brufen", genericName: "Ibuprofen", category: "Painkiller", unit: "tablets", defaultDosage: "400mg" },
    { name: "Mefenamic Acid", genericName: "Mefenamic Acid", category: "Painkiller", unit: "tablets", defaultDosage: "500mg" },

    // Antibiotics
    { name: "Amoxil", genericName: "Amoxicillin", category: "Antibiotic", unit: "capsules", defaultDosage: "500mg" },
    { name: "Augmentin", genericName: "Amoxicillin + Clavulanate", category: "Antibiotic", unit: "tablets", defaultDosage: "625mg" },
    { name: "Flagyl", genericName: "Metronidazole", category: "Antibiotic", unit: "tablets", defaultDosage: "400mg" },
    { name: "Septrin", genericName: "Cotrimoxazole", category: "Antibiotic", unit: "tablets", defaultDosage: "480mg" },

    // Antacids & Stomach
    { name: "Omeprazole", genericName: "Omeprazole", category: "Antacid", unit: "capsules", defaultDosage: "20mg" },
    { name: "Ranitidine", genericName: "Ranitidine", category: "Antacid", unit: "tablets", defaultDosage: "150mg" },
    { name: "Gaviscon", genericName: "Alginate + Antacid", category: "Antacid", unit: "tablets", defaultDosage: "1 tablet" },

    // Antihistamines
    { name: "Piriton", genericName: "Chlorphenamine", category: "Antihistamine", unit: "tablets", defaultDosage: "4mg" },
    { name: "Cetirizine", genericName: "Cetirizine", category: "Antihistamine", unit: "tablets", defaultDosage: "10mg" },
    { name: "Loratadine", genericName: "Loratadine", category: "Antihistamine", unit: "tablets", defaultDosage: "10mg" },

    // Cough & Cold
    { name: "Benadryl", genericName: "Diphenhydramine", category: "Cough & Cold", unit: "ml", defaultDosage: "10ml" },
    { name: "Actifed", genericName: "Triprolidine + Pseudoephedrine", category: "Cough & Cold", unit: "tablets", defaultDosage: "1 tablet" },

    // Vitamins & Supplements
    { name: "Vitamin C", genericName: "Ascorbic Acid", category: "Vitamin", unit: "tablets", defaultDosage: "500mg" },
    { name: "Zinc Sulphate", genericName: "Zinc", category: "Vitamin", unit: "tablets", defaultDosage: "20mg" },
    { name: "B Complex", genericName: "Vitamin B Complex", category: "Vitamin", unit: "tablets", defaultDosage: "1 tablet" },

    // Antifungals
    { name: "Fluconazole", genericName: "Fluconazole", category: "Antifungal", unit: "capsules", defaultDosage: "150mg" },

    // Diabetes
    { name: "Metformin", genericName: "Metformin", category: "Diabetes", unit: "tablets", defaultDosage: "500mg" },

    // Blood Pressure
    { name: "Amlodipine", genericName: "Amlodipine", category: "Antihypertensive", unit: "tablets", defaultDosage: "5mg" },
    { name: "Atenolol", genericName: "Atenolol", category: "Antihypertensive", unit: "tablets", defaultDosage: "50mg" },
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
            update: {}, // don't change anything if already exists
            create: medicine,
        })
    }

    console.log(`✅ Seeded ${medicines.length} medicines`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())