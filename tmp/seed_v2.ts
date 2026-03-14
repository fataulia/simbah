import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Family Tree v2 (Family Unit Model)...");

  // 1. Generation 0
  const william = await prisma.person.create({
    data: { name: "William", gender: "MALE", generation: 0, birthDate: new Date(1940, 0, 1) }
  });
  const elizabeth = await prisma.person.create({
    data: { name: "Elizabeth", gender: "FEMALE", generation: 0, birthDate: new Date(1945, 0, 1) }
  });

  const fam0 = await prisma.family.create({
    data: { partner1Id: william.id, partner2Id: elizabeth.id }
  });

  // 2. Generation 1
  const george = await prisma.person.create({
    data: { name: "George", gender: "MALE", generation: 1, birthDate: new Date(1970, 0, 1) }
  });
  const margaret = await prisma.person.create({
    data: { name: "Margaret", gender: "FEMALE", generation: 1, birthDate: new Date(1975, 0, 1) }
  });

  await prisma.child.createMany({
    data: [
      { familyId: fam0.id, childId: george.id },
      { familyId: fam0.id, childId: margaret.id }
    ]
  });

  const fam1 = await prisma.family.create({
    data: { partner1Id: george.id, partner2Id: margaret.id }
  });

  // 3. Generation 2
  const edward = await prisma.person.create({
    data: { name: "Edward", gender: "MALE", generation: 2, birthDate: new Date(1995, 0, 1) }
  });
  const catherine = await prisma.person.create({
    data: { name: "Catherine", gender: "FEMALE", generation: 2, birthDate: new Date(1998, 0, 1) }
  });

  await prisma.child.create({
    data: { familyId: fam1.id, childId: edward.id }
  });

  const fam2 = await prisma.family.create({
    data: { partner1Id: edward.id, partner2Id: catherine.id }
  });

  // 4. Generation 3
  const charles = await prisma.person.create({
    data: { name: "Charles", gender: "MALE", generation: 3, birthDate: new Date(2015, 0, 1) }
  });
  const diana = await prisma.person.create({
    data: { name: "Diana", gender: "FEMALE", generation: 3, birthDate: new Date(2018, 0, 1) }
  });

  await prisma.child.create({
    data: { familyId: fam2.id, childId: charles.id }
  });

  const fam3 = await prisma.family.create({
    data: { partner1Id: charles.id, partner2Id: diana.id }
  });

  // 5. Generation 4
  const williamJr = await prisma.person.create({
    data: { name: "William Jr", gender: "MALE", generation: 4, birthDate: new Date(2035, 0, 1) }
  });

  await prisma.child.create({
    data: { familyId: fam3.id, childId: williamJr.id }
  });

  console.log("Seeding Complete.");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
