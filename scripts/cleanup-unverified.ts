import { prisma } from './prisma';

export async function main() {
    const result = await prisma.user.deleteMany({
        where: {
            emailVerified: false,
            emailTokenExpires: {
                lt: new Date()
            }
        }
    });

    console.log(`Deleted ${result.count} unverified users.`);
}
