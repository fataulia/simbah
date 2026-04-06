"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSessionLineageId } from "./auth";

export async function getFamilyData() {
  try {
    const lineageId = await getSessionLineageId();
    if (!lineageId) throw new Error("Akses ditolak: Silakan masuk dengan kode silsilah Anda.");

    const people = await prisma.person.findMany({
      where: { lineageId },
      orderBy: { generation: 'asc' }
    });

    const families = await (prisma as any).family.findMany({
      where: { lineageId },
      include: { children: true }
    });

    const children = await (prisma as any).child.findMany({
       where: { family: { lineageId } }
    });

    return {
      people: people.map(p => ({
        ...p,
        birthDate: p.birthDate?.toISOString() || null,
        deathDate: p.deathDate?.toISOString() || null,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      families: families.map((f: any) => ({
        ...f,
        createdAt: f.createdAt.toISOString(),
        updatedAt: f.updatedAt.toISOString(),
      })),
      children: children.map((c: any) => ({
        ...c,
      }))
    };
  } catch (error: any) {
    console.error("Error fetching family data:", error);
    throw new Error(`Gagal mengambil data: ${error.message}`);
  }
}

export async function addPerson(data: any) {
  try {
    const lineageId = await getSessionLineageId();
    if (!lineageId) throw new Error("Akses ditolak: Sesi habis, silakan muat ulang halaman.");

    const person = await prisma.person.create({
      data: {
        lineageId,
        name: data.name,
        gender: data.gender,
        generation: typeof data.generation === 'number' ? data.generation : 1,
        birthDate: data.birthYear ? new Date(parseInt(data.birthYear), 0, 1) : null,
        isDeceased: !!data.isDeceased,
        deathDate: data.deathYear ? new Date(parseInt(data.deathYear), 0, 1) : null,
        photoUrl: data.photoUrl,
        phone: data.phone,
        address: data.address,
        latLong: data.latLong,
        bio: data.bio,
      } as any,
    });

    // Handle family link (Prioritize explicit familyId, fallback to parentId)
    if (data.familyId) {
        await (prisma as any).child.create({
            data: {
                familyId: data.familyId,
                childId: person.id,
            }
        });
    } else if (data.parentId) {
        let family = await (prisma as any).family.findFirst({
            where: { 
                lineageId, 
                OR: [{ partner1Id: data.parentId }, { partner2Id: data.parentId }] 
            }
        });

        if (!family) {
            family = await (prisma as any).family.create({
                data: { partner1Id: data.parentId, lineageId }
            });
        }

        await (prisma as any).child.create({
            data: {
                familyId: family.id,
                childId: person.id,
            }
        });
    }

    // Handle initial partner link
    if (data.partnerId) {
        await addSpouse(person.id, data.partnerId);
    }

    revalidatePath("/");
    return { success: true, id: person.id };
  } catch (error: any) {
    console.error("Add Person Error:", error);
    return { success: false, error: error.message };
  }
}

export async function updatePerson(id: string, data: any) {
    try {
        const lineageId = await getSessionLineageId();
        if (!lineageId) throw new Error("Akses ditolak.");

        // ensure the person belongs to this lineage before updating
        const existing = await prisma.person.findUnique({ where: { id } });
        if (existing?.lineageId !== lineageId) throw new Error("Data tidak valid untuk silsilah ini.");

        const person = await prisma.person.update({
            where: { id },
            data: {
                name: data.name,
                gender: data.gender,
                generation: data.generation,
                birthDate: data.birthYear ? new Date(parseInt(data.birthYear), 0, 1) : null,
                isDeceased: !!data.isDeceased,
                deathDate: data.deathDate || (data.deathYear ? new Date(parseInt(data.deathYear), 0, 1) : null),
                photoUrl: data.photoUrl,
                phone: data.phone,
                address: data.address,
                latLong: data.latLong,
                bio: data.bio,
            } as any,
        });
        revalidatePath("/");
        return { success: true, id: person.id };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function addSpouse(personId: string, spouseId: string) {
  try {
    const lineageId = await getSessionLineageId();
    if (!lineageId) throw new Error("Akses ditolak.");

    // Check if family exists between these two in this lineage
    let family = await (prisma as any).family.findFirst({
        where: {
            lineageId,
            OR: [
                { partner1Id: personId, partner2Id: spouseId },
                { partner1Id: spouseId, partner2Id: personId }
            ]
        }
    });

    if (!family) {
        family = await (prisma as any).family.create({
            data: {
                lineageId,
                partner1Id: personId,
                partner2Id: spouseId,
            },
        });
    }
    revalidatePath("/");
    return { success: true, id: family.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addChildToFamily(familyId: string, childId: string, type: 'BIOLOGICAL' | 'ADOPTED' | 'STEPCHILD' = 'BIOLOGICAL') {
  try {
    const lineageId = await getSessionLineageId();
    if (!lineageId) throw new Error("Akses ditolak.");

    // Verify family belongs to current lineage
    const familyCheck = await prisma.family.findUnique({ where: { id: familyId } });
    if (familyCheck?.lineageId !== lineageId) throw new Error("Silsilah keluarga salah.");

    const child = await (prisma as any).child.upsert({
        where: { familyId_childId: { familyId, childId } },
        create: { familyId, childId, relationshipType: type },
        update: { relationshipType: type }
    });
    revalidatePath("/");
    return { success: true, id: child.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deletePerson(id: string) {
    try {
        const lineageId = await getSessionLineageId();
        if (!lineageId) throw new Error("Akses ditolak.");

        // 1. Check if person exists AND belongs to lineage
        const person = await prisma.person.findUnique({
            where: { id },
            include: {
                partner1At: { include: { children: true } },
                partner2At: { include: { children: true } },
            } as any
        });

       if (!person || person.lineageId !== lineageId) {
            return { success: false, error: "Data anggota tidak ditemukan." };
        }

        // 2. Safety Check: Cannot delete if they have children
        const hasChildren = (person as any).partner1At.some((f: any) => f.children.length > 0) || 
                          (person as any).partner2At.some((f: any) => f.children.length > 0);
        
        if (hasChildren) {
            return { 
                success: false, 
                error: "Anggota ini memiliki anak. Silakan hapus data anak-anaknya terlebih dahulu dari yang paling bawah (paling muda) untuk menjaga silsilah." 
            };
        }

        // 3. Clean up relationships (Child relation handles itself with onDelete: Cascade? Actually child table doesn't have cascade for childId? Oh wait, it does! "onDelete: Cascade" is in schema)
        // Wait, the schema has: child Person @relation(fields: [childId], references: [id], onDelete: Cascade)
        // But to be safe, delete them manually first just like the old code.
        await (prisma as any).child.deleteMany({ where: { childId: id } });
        
        // Delete family units where this person is a partner
        await (prisma as any).family.deleteMany({ 
            where: { OR: [{ partner1Id: id }, { partner2Id: id }] } 
        });

        // 4. Finally delete the person
        await prisma.person.delete({ where: { id } });

        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        console.error("Delete Error:", error);
        return { success: false, error: "Gagal menghapus: " + (error.message || "Terjadi kesalahan sistem") };
    }
}
