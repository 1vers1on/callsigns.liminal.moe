import { PrismaClient } from '../generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

import dotenv from 'dotenv';
dotenv.config();

const createPrismaClient = () => {
    const adapter = new PrismaMariaDb({
        host: process.env.DATABASE_HOST,
        port: Number(process.env.DATABASE_PORT || '3306'),
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        connectionLimit: 5
    });

    return new PrismaClient({
        adapter,
        log: []
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
