import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Complex Family Tree...");
  
  try {
    // Clear existing data
    console.log("Cleaning Database...");
    await prisma.child.deleteMany();
    await prisma.family.deleteMany();
    await prisma.person.deleteMany();

    // Root: Simbah
    console.log("Creating Simbah...");
    const simbah = await prisma.person.create({
      data: { name: "Simbah Buyut", gender: "MALE", generation: 0, birthDate: new Date(1930, 0, 1) }
    });
    const simbahIstri = await prisma.person.create({
      data: { name: "Ibu Simbah", gender: "FEMALE", generation: 0, birthDate: new Date(1935, 0, 1) }
    });
    const famSimbah = await prisma.family.create({
      data: { partner1Id: simbah.id, partner2Id: simbahIstri.id }
    });

    // Anak Simbah (4 orang)
    const names = ["Bapak Subarjo", "Bapak Supraptama", "Ibu Ratna", "Paman Budi"];
    const anakSimbah = [];
    for (let i = 0; i < 4; i++) {
      console.log(`Creating Child ${i+1}: ${names[i]}`);
      const p = await prisma.person.create({
        data: { name: names[i], gender: i === 2 ? "FEMALE" : "MALE", generation: 1, birthDate: new Date(1960 + i*5, 0, 1) }
      });
      anakSimbah.push(p);
      await prisma.child.create({ data: { familyId: famSimbah.id, childId: p.id } });
    }

    // 3 dari 4 Anak Simbah sudah menikah dan punya anak
    for (let i = 0; i < 3; i++) {
      console.log(`Creating Marriage for ${anakSimbah[i].name}`);
      const partner = await prisma.person.create({
        data: { name: `Pasangan ${anakSimbah[i].name}`, gender: anakSimbah[i].gender === "MALE" ? "FEMALE" : "MALE", generation: 1 }
      });
      const family = await prisma.family.create({
        data: { partner1Id: anakSimbah[i].id, partner2Id: partner.id }
      });

      // Masing-masing punya 2 anak (Generasi Cucu)
      for (let j = 1; j <= 2; j++) {
        const cucu = await prisma.person.create({
          data: { name: `Cucu ${j} dari ${anakSimbah[i].name}`, gender: j % 2 === 0 ? "FEMALE" : "MALE", generation: 2 }
        });
        await prisma.child.create({ data: { familyId: family.id, childId: cucu.id } });

        // Salah satu cucu sudah menikah dan punya anak (Generasi Cicit)
        if (j === 1) {
          console.log(`Creating Marriage for Grandchild ${cucu.name}`);
          const suamiCucu = await prisma.person.create({
            data: { name: `Pasangan ${cucu.name}`, gender: cucu.gender === "MALE" ? "FEMALE" : "MALE", generation: 2 }
          });
          const famCucu = await prisma.family.create({
            data: { partner1Id: cucu.id, partner2Id: suamiCucu.id }
          });

          const cicit = await prisma.person.create({
            data: { name: `Cicit dari ${cucu.name}`, gender: "MALE", generation: 3 }
          });
          await prisma.child.create({ data: { familyId: famCucu.id, childId: cicit.id } });
        }
      }
    }

    console.log("Complex Seeding Complete.");
  } catch (err: any) {
    console.error("SEEDING ERROR:", err);
    process.exit(1);
  }
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(() => prisma.$disconnect());
