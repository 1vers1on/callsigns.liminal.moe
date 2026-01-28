import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../../generated/prisma/client';

declare global {
    var prisma: PrismaClient | undefined;
}

const createPrismaClient = () => {
    const adapter = new PrismaMariaDb({
        host: process.env.DATABASE_HOST,
        port: Number(process.env.DATABASE_PORT || '3306'),
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        connectionLimit: 5,
        ssl: false,
        allowPublicKeyRetrieval: true
    });

    return new PrismaClient({
        adapter,
        log: ['query', 'info', 'warn', 'error']
    });
};

export const prisma = globalThis.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
}
