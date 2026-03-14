const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const people = await prisma.person.findMany({
    include: {
      asChild: true
    }
  });
  
  const children = await prisma.child.findMany();
  
  console.log('--- PEOPLE ---');
  people.forEach(p => {
    console.log(`${p.name} (id: ${p.id}, gen: ${p.generation}) - isChild: ${p.asChild.length > 0}`);
  });

  console.log('\n--- CHILD RECORDS ---');
  children.forEach(c => {
    console.log(`ChildID: ${c.childId} is child of FamilyID: ${c.familyId}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
