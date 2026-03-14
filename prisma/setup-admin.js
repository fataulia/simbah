const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Registering Super Admin...');
  
  const email = 'fataulia@gmail.com';
  
  const admin = await prisma.admin.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'Super Admin',
    },
  });

  // Also ensure app config exists
  await prisma.appConfig.upsert({
    where: { id: 'config' },
    update: {},
    create: {
      id: 'config',
      accessCode: 'simbah123',
    },
  });

  console.log(`Success! ${email} is now an Admin.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
