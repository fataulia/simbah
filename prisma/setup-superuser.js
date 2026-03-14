const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Promoting to Superuser...');
  
  const email = 'fataulia@gmail.com';
  
  const admin = await prisma.admin.upsert({
    where: { email },
    update: {
      role: 'SUPERUSER'
    },
    create: {
      email,
      name: 'Fataulia',
      role: 'SUPERUSER',
    },
  });

  console.log(`Success! ${email} is now a SUPERUSER.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
