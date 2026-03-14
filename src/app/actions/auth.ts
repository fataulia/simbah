"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function verifyPasscode(code: string) {
  const config = await prisma.appConfig.findFirst({
    where: { id: "config" }
  });

  const validCode = config?.accessCode || "simbah123";

  if (code === validCode) {
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

export async function loginAdmin(username: string, password: string) {
  const admin = await prisma.admin.findUnique({
    where: { username }
  });

  if (!admin || admin.password !== password) {
    return { success: false, message: "Username atau password salah." };
  }

  const cookieStore = await cookies();
  cookieStore.set("simbah_admin_access", "true", {
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  cookieStore.set("simbah_admin_username", username, {
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  return { success: true };
}

export async function checkAccess() {
  const cookieStore = await cookies();
  const hasViewerAccess = cookieStore.has("simbah_viewer_access");
  const hasAdminAccess = cookieStore.has("simbah_admin_access");
  return hasViewerAccess || hasAdminAccess;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("simbah_viewer_access");
  cookieStore.delete("simbah_admin_access");
  cookieStore.delete("simbah_admin_username");
}

export async function checkIsAdmin() {
  const cookieStore = await cookies();
  if (!cookieStore.has("simbah_admin_access")) return false;

  const username = cookieStore.get("simbah_admin_username")?.value;
  if (!username) return false;

  const admin = await prisma.admin.findUnique({
    where: { username }
  });

  return admin !== null;
}

export async function checkIsSuperuser() {
  const cookieStore = await cookies();
  const username = cookieStore.get("simbah_admin_username")?.value;
  if (!username) return false;

  const admin = await prisma.admin.findUnique({
    where: { username }
  });

  return admin?.role === 'SUPERUSER';
}

// Whitelist Management (Server Actions)
export async function getWhitelist() {
  const isSuper = await checkIsSuperuser();
  if (!isSuper) throw new Error("Unauthorized");

  return prisma.admin.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function addToWhitelist(username: string, password: string, name?: string) {
  const isSuper = await checkIsSuperuser();
  if (!isSuper) throw new Error("Unauthorized");

  return prisma.admin.create({
    data: { username, password, name }
  });
}

export async function removeFromWhitelist(id: string) {
  const isSuper = await checkIsSuperuser();
  if (!isSuper) throw new Error("Unauthorized");

  // Prevent deleting self?
  const cookieStore = await cookies();
  const myUsername = cookieStore.get("simbah_admin_username")?.value;
  const target = await prisma.admin.findUnique({ where: { id } });
  
  if (target?.username === myUsername) throw new Error("Cannot remove yourself");

  return prisma.admin.delete({
    where: { id }
  });
}
