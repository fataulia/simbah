import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding initial superuser...");
  const admin = await prisma.admin.create({
    data: {
      username: 'admin',
      password: 'password', // Simple password for now
      name: 'Super Admin',
      role: 'SUPERUSER',
    }
  });
  console.log("Superuser created successfully:", admin);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
