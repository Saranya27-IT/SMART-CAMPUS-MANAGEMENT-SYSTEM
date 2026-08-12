import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/types/database.types";
import { ROLE_ROUTES, ROLE_DASHBOARDS, type UserRole } from "@/lib/types/roles";

// Routes accessible without authentication
const PUBLIC_ROUTES = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/api/health",
];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Fetch role
  let role: UserRole | undefined = undefined;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = ((profile as any)?.role || user.user_metadata?.role || "student") as UserRole;
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
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
