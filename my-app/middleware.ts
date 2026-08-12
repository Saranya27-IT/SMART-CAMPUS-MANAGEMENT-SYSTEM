import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/types/database.types";
import { ROLE_ROUTES, ROLE_DASHBOARDS, type UserRole } from "@/lib/types/role-constants";

// Routes accessible without authentication
const PUBLIC_ROUTES = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/api/health",
];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Guard against missing env variables on Vercel deployment
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Middleware warning: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Refresh session safely
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // Fetch role safely — prioritize user_metadata for fast Edge evaluation
    let role: UserRole | undefined = undefined;
    if (user) {
      const metaRole = user.user_metadata?.role as UserRole | undefined;
      if (metaRole && ROLE_DASHBOARDS[metaRole]) {
        role = metaRole;
      } else {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();
          role = ((profile as any)?.role || "student") as UserRole;
        } catch {
          role = "student";
        }
      }
    }

    // Allow public routes
    if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
      if (user && pathname.startsWith("/login")) {
        const target = role ? ROLE_DASHBOARDS[role] || "/dashboard" : "/dashboard";
        return NextResponse.redirect(new URL(target, request.url));
      }
      return supabaseResponse;
    }

    // Not authenticated → redirect to login
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check route access by role
    if (role) {
      const allowedPrefixes = ROLE_ROUTES[role] ?? [];
      const isAllowed =
        allowedPrefixes.length === 0 ||
        allowedPrefixes.some((prefix) => pathname.startsWith(prefix));

      if (!isAllowed) {
        const defaultDashboard = ROLE_DASHBOARDS[role] || "/dashboard";
        return NextResponse.redirect(new URL(defaultDashboard, request.url));
      }
    }

    return supabaseResponse;
  } catch (error) {
    console.error("Middleware execution error:", error);
    return supabaseResponse;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
