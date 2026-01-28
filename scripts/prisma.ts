import { PrismaClient } from '../generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

import dotenv from 'dotenv';
dotenv.config();

const createPrismaClient = () => {
    const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);

    return new PrismaClient({
        adapter
    });
};

declare global {
    // eslint-disable-next-line no-var
    var prisma: ReturnType<typeof createPrismaClient> | undefined;
}

export const prisma = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
}
