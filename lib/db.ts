import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
    pgPool: Pool | undefined;
};

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
} else {
    if (!globalForPrisma.prisma) {
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        const adapter = new PrismaPg(pool);
        globalForPrisma.pgPool = pool;
        globalForPrisma.prisma = new PrismaClient({
            adapter,
            log: ["query", "error", "warn"],
        });
    }
    prisma = globalForPrisma.prisma;
}

export { prisma };
export default prisma;
export type { TimeEntry, AdminUser, UploadLog } from "../generated/prisma/client";