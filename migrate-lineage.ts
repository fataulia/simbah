import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Memulai migrasi data ke Lineage Utama...")

  // 1. Cek apakah ada konfigurasi lama
  const config = await prisma.appConfig.findFirst()
  const accessCode = config ? config.accessCode : "simbah123"

  // 2. Buat atu temukan "Keluarga Utama" (Lineage)
  let mainLineage = await prisma.lineage.findUnique({
    where: { accessCode: accessCode }
  })

  if (!mainLineage) {
    mainLineage = await prisma.lineage.create({
      data: {
        name: "Keluarga Utama",
        accessCode: accessCode
      }
    })
    console.log("Berhasil membuat Lineage 'Keluarga Utama'.")
  } else {
    console.log("Lineage 'Keluarga Utama' sudah ada.")
  }

  // 3. Masukkan semua orang (Person) yang belum punya Lineage ke Keluarga Utama
  const updatePersons = await prisma.person.updateMany({
    where: { lineageId: null },
    data: { lineageId: mainLineage.id }
  })
  console.log(`Berhasil mengupdate ${updatePersons.count} orang.`)

  // 4. Masukkan semua keluarga (Family) yang belum punya Lineage ke Keluarga Utama
  const updateFamilies = await prisma.family.updateMany({
    where: { lineageId: null },
    data: { lineageId: mainLineage.id }
  })
  console.log(`Berhasil mengupdate ${updateFamilies.count} data keluarga.`)

  console.log("✅ Migrasi selesai dengan sukses! Semua data lama aman.")
}

main()
  .catch(e => {
    console.error("Terjadi kesalahan:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
