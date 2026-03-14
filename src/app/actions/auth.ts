"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";

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
  cookieStore.delete("simbah_admin_email");
}

export async function signInWithGoogle() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) throw error;
  if (data.url) redirect(data.url);
}

export async function checkIsAdmin() {
  const cookieStore = await cookies();
  if (!cookieStore.has("simbah_admin_access")) return false;

  const email = cookieStore.get("simbah_admin_email")?.value;
  if (!email) return false;

  const admin = await prisma.admin.findUnique({
    where: { email }
  });

  return admin !== null;
}

export async function checkIsSuperuser() {
  const cookieStore = await cookies();
  const email = cookieStore.get("simbah_admin_email")?.value;
  if (!email) return false;

  const admin = await prisma.admin.findUnique({
    where: { email }
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

export async function addToWhitelist(email: string, name?: string) {
  const isSuper = await checkIsSuperuser();
  if (!isSuper) throw new Error("Unauthorized");

  return prisma.admin.create({
    data: { email, name }
  });
}

export async function removeFromWhitelist(id: string) {
  const isSuper = await checkIsSuperuser();
  if (!isSuper) throw new Error("Unauthorized");

  // Prevent deleting self?
  const cookieStore = await cookies();
  const myEmail = cookieStore.get("simbah_admin_email")?.value;
  const target = await prisma.admin.findUnique({ where: { id } });
  
  if (target?.email === myEmail) throw new Error("Cannot remove yourself");

  return prisma.admin.delete({
    where: { id }
  });
}
