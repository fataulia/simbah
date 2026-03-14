import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user?.email) {
      const email = data.user.email;
      
      // Check if this email is whitelisted
      let admin = await prisma.admin.findUnique({
        where: { email }
      });

      // SMART LOGIC: If NO admins exist at all, make the first person who logs in the SUPERUSER
      const adminCount = await prisma.admin.count();
      if (!admin && adminCount === 0) {
        admin = await prisma.admin.create({
          data: {
            email,
            name: data.user?.user_metadata?.full_name || "Primary Admin",
            role: "SUPERUSER"
          }
        });
      }

      if (admin) {
        // Set admin access cookie
        cookieStore.set("simbah_admin_access", "true", {
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        });
        cookieStore.set("simbah_admin_email", email, {
          maxAge: 60 * 60 * 24 * 30,
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        });
      }
      
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
