import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const people = await prisma.person.findMany({ take: 1 });
    console.log("DB Sample Person:", JSON.stringify(people[0], null, 2));
    console.log("SUCCESS: Database is accessible.");
  } catch (err: any) {
    console.error("DB ERROR:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
