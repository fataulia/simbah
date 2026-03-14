const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.parentChild.deleteMany();
  await prisma.asPartner.deleteMany();
  await prisma.person.deleteMany();

  console.log('Seeding initial family tree...');

  // 1. Generations 1
  const ahmad = await prisma.person.create({
    data: {
      name: 'Simbah Buyut Ahmad',
      gender: 'MALE',
      generation: 1,
      birthDate: new Date('1920-05-15'),
      deathDate: new Date('1995-10-20'),
      bio: 'Pendiri keluarga besar yang bijaksana.',
      address: 'Sleman, Yogyakarta',
    },
  });

  const siti = await prisma.person.create({
    data: {
      name: 'Simbah Buyut Siti',
      gender: 'FEMALE',
      generation: 1,
      birthDate: new Date('1925-08-10'),
      deathDate: new Date('2000-02-12'),
      address: 'Sleman, Yogyakarta',
    },
  });

  // Partner G1
  await prisma.asPartner.create({
    data: {
      personId: ahmad.id,
      partnerId: siti.id,
      type: 'MARRIED',
    },
  });

  // 2. Generation 2
  const subarjo = await prisma.person.create({
    data: {
      name: 'Bapak Subarjo',
      gender: 'MALE',
      generation: 2,
      birthDate: new Date('1950-03-20'),
      phone: '08123456789',
      address: 'Bantul, Yogyakarta',
    },
  });

  const ratna = await prisma.person.create({
    data: {
      name: 'Ibu Ratna',
      gender: 'FEMALE',
      generation: 2,
      birthDate: new Date('1955-09-05'),
      phone: '08198765432',
      address: 'Bantul, Yogyakarta',
    },
  });

  // Partner G2
  await prisma.asPartner.create({
    data: {
      personId: subarjo.id,
      partnerId: ratna.id,
      type: 'MARRIED',
    },
  });

  // Link G1 to G2 (Subarjo as child of Ahmad/Siti)
  await prisma.parentChild.createMany({
    data: [
      { parentId: ahmad.id, childId: subarjo.id },
      { parentId: siti.id, childId: subarjo.id },
    ],
  });

  // 3. Generation 3
  const putra = await prisma.person.create({
    data: {
      name: 'Ananda Putra',
      gender: 'MALE',
      generation: 3,
      birthDate: new Date('1980-01-15'),
      phone: '08564321098',
      address: 'Jakarta Selatan',
    },
  });

  const putri = await prisma.person.create({
    data: {
      name: 'Ananda Putri',
      gender: 'FEMALE',
      generation: 3,
      birthDate: new Date('1985-06-25'),
      phone: '08122334455',
      address: 'Bandung',
    },
  });

  // Link G2 to G3
  await prisma.parentChild.createMany({
    data: [
      { parentId: subarjo.id, childId: putra.id },
      { parentId: subarjo.id, childId: putri.id },
      { parentId: ratna.id, childId: putra.id },
      { parentId: ratna.id, childId: putri.id },
    ],
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
