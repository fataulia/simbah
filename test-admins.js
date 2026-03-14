const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.admin.findMany();
  console.log('Admins in DB:', admins);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
