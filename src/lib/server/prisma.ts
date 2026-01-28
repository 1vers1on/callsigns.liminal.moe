import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../../generated/prisma/client';

declare global {
    var prisma: PrismaClient | undefined;
}

const createPrismaClient = () => {
    const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);

    return new PrismaClient({
        adapter,
        log: ['query', 'info', 'warn', 'error']
    });
};

export const prisma = globalThis.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
}
