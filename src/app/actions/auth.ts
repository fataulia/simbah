"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function verifyPasscode(code: string) {
  const lineage = await prisma.lineage.findUnique({
    where: { accessCode: code }
  });

  const masterCode = process.env.MASTER_CODE || "SimbahSuperAdmin777";

  let targetLineageId = lineage?.id;

  // Master code fallback to enter the first available lineage (useful for app owner)
  if (code === masterCode && !lineage) {
    const firstLineage = await prisma.lineage.findFirst();
    if (firstLineage) {
      targetLineageId = firstLineage.id;
    }
  }

  if (targetLineageId) {
    const cookieStore = await cookies();
    cookieStore.set("simbah_lineage_id", targetLineageId, {
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    return { success: true };
  }

  return { success: false, message: "Kode keluarga salah atau tidak ditemukan." };
}

export async function checkAccess() {
  const cookieStore = await cookies();
  return cookieStore.has("simbah_lineage_id");
}

export async function getSessionLineageId() {
  const cookieStore = await cookies();
  return cookieStore.get("simbah_lineage_id")?.value;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("simbah_lineage_id");
}

export async function checkIsAdmin() {
  return true;
}

export async function checkIsSuperuser() {
  return true;
}

export async function getPasscode() {
  const lineageId = await getSessionLineageId();
  if (!lineageId) return "";
  const lineage = await prisma.lineage.findUnique({ where: { id: lineageId } });
  return lineage?.accessCode || "";
}

export async function updatePasscode(newCode: string) {
  const lineageId = await getSessionLineageId();
  if (!lineageId) return { success: false, message: "Sesi telah habis, silakan login ulang." };

  if (!newCode || newCode.length < 4) {
    return { success: false, message: "Kode minimal 4 karakter." };
  }

  const taken = await prisma.lineage.findUnique({ where: { accessCode: newCode } });
  if (taken && taken.id !== lineageId) {
    return { success: false, message: "Kode sudah dipakai silsilah lain." };
  }

  await prisma.lineage.update({
    where: { id: lineageId },
    data: { accessCode: newCode }
  });

  return { success: true };
}

export async function createLineage(name: string, accessCode: string) {
  if (!name || name.trim().length < 3) return { success: false, message: "Nama silsilah terlalu pendek." };
  if (!accessCode || accessCode.length < 4) return { success: false, message: "Kode akses minimal 4 karakter." };

  const taken = await prisma.lineage.findUnique({ where: { accessCode } });
  if (taken) {
    return { success: false, message: "Kode akses sudah digunakan. Silakan pilih kode lain." };
  }

  const lineage = await prisma.lineage.create({
    data: { name: name.trim(), accessCode }
  });

  const cookieStore = await cookies();
  cookieStore.set("simbah_lineage_id", lineage.id, {
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  return { success: true };
}
