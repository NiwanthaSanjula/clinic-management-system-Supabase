// Prisma need ONE shared connection - not a new one every time
// In development, Nextjs "hot reload" on every save
// Without this singleton, each reload creates a NEW database connection
// Eventually run our of the connections

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

// prisma 7 need an expilict adapter - it no longer connect automatically
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!
})

// Store the client on the global object in development
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

// reuse existing client or create new one (in dev only)
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma; // save it globally in dev only
}

