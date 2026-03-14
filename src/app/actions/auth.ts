"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function verifyPasscode(code: string) {
  const config = await prisma.appConfig.findFirst({
    where: { id: "config" }
  });

  const validCode = config?.accessCode || "simbah123";
  const masterCode = process.env.MASTER_CODE || "SimbahSuperAdmin777";

  if (code === validCode || code === masterCode) {
    if (code === masterCode && code !== validCode) {
        await prisma.appConfig.upsert({
            where: { id: "config" },
            update: { accessCode: masterCode },
            create: { id: "config", accessCode: masterCode }
        });
    }

    const cookieStore = await cookies();
    cookieStore.set("simbah_viewer_access", "true", {
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    return { success: true };
  }

  return { success: false, message: "Kode akses salah." };
}

export async function checkAccess() {
  const cookieStore = await cookies();
  return cookieStore.has("simbah_viewer_access");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("simbah_viewer_access");
}

export async function checkIsAdmin() {
  // Everyone is treated as admin now
  return true;
}

export async function checkIsSuperuser() {
  // We can return false or true, but for safety of any remaining logic let's say false if we want to restrict some dangerous things, or true for total freedom. The user wants total freedom.
  return true;
}

export async function getPasscode() {
  const config = await prisma.appConfig.findFirst({
    where: { id: "config" }
  });
  return config?.accessCode || "simbah123";
}

export async function updatePasscode(newCode: string) {
  if (!newCode || newCode.length < 4) {
    return { success: false, message: "Kode minimal 4 karakter." };
  }

  await prisma.appConfig.upsert({
    where: { id: "config" },
    update: { accessCode: newCode },
    create: { id: "config", accessCode: newCode }
  });

  return { success: true };
}
