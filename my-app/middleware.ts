import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ============================================================
// Inline Role Definitions for 100% Self-Contained Edge Middleware
// ============================================================
export const USER_ROLES = [
  "super_admin",
  "student",
  "faculty",
  "librarian",
  "event_organizer",
  "bus_driver",
  "hostel_warden",
  "mess_manager",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

const ROLE_DASHBOARDS: Record<UserRole, string> = {
  super_admin: "/admin/dashboard",
  student: "/dashboard",
  faculty: "/faculty/dashboard",
  librarian: "/librarian/dashboard",
  event_organizer: "/event-organizer/dashboard",
  bus_driver: "/driver/dashboard",
  hostel_warden: "/warden/dashboard",
  mess_manager: "/mess-manager/dashboard",
};

const ROLE_ROUTES: Record<UserRole, string[]> = {
  super_admin: [], // unrestricted
  student: [
    "/dashboard",
    "/library",
    "/events",
    "/bus",
    "/hostel",
    "/mess",
    "/profile",
    "/notifications",
  ],
  faculty: [
    "/faculty/dashboard",
    "/dashboard",
    "/events",
    "/events/certificates",
    "/profile",
    "/notifications",
  ],
  librarian: [
    "/librarian/dashboard",
    "/dashboard",
    "/library",
    "/profile",
    "/notifications",
  ],
  event_organizer: [
    "/event-organizer/dashboard",
    "/dashboard",
    "/events",
    "/profile",
    "/notifications",
  ],
  bus_driver: [
    "/driver/dashboard",
    "/dashboard",
    "/bus",
    "/profile",
    "/notifications",
  ],
  hostel_warden: [
    "/warden/dashboard",
    "/dashboard",
    "/hostel",
    "/profile",
    "/notifications",
  ],
  mess_manager: [
    "/mess-manager/dashboard",
    "/dashboard",
    "/mess",
    "/profile",
    "/notifications",
  ],
};

// Routes accessible without authentication
const PUBLIC_ROUTES = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/api/health",
];

function parseRole(rawRole: unknown): UserRole {
  if (typeof rawRole !== "string") return "student";
  const normalized = rawRole.trim().toLowerCase();
  if ((USER_ROLES as readonly string[]).includes(normalized)) {
    return normalized as UserRole;
  }
  return "student";
}

function createRedirectResponse(
  targetUrl: URL | string,
  request: NextRequest,
  supabaseResponse: NextResponse
) {
  const redirectResponse = NextResponse.redirect(
    typeof targetUrl === "string" ? new URL(targetUrl, request.url) : targetUrl
  );
  try {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
  } catch {
    // Ignore cookie copy errors if any
  }
  return redirectResponse;
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Guard against missing env variables on Vercel deployment
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "Middleware warning: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            try {
              request.cookies.set(name, value);
            } catch {
              // Edge Runtime request cookies fallback
            }
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              supabaseResponse.cookies.set(name, value, options);
            } catch {
              // Edge Runtime response cookies fallback
            }
          });
        },
      },
    });

    // Refresh session safely
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // Fetch role safely — prioritize user_metadata for fast Edge evaluation
    let role: UserRole | undefined = undefined;
    if (user) {
      const metaRole = user.user_metadata?.role;
      if (metaRole) {
        role = parseRole(metaRole);
      } else {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();
          role = parseRole(profile?.role);
        } catch {
          role = "student";
        }
      }
    }

    // Allow public routes
    if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
      if (user && pathname.startsWith("/login")) {
        const target = role ? ROLE_DASHBOARDS[role] || "/dashboard" : "/dashboard";
        return createRedirectResponse(target, request, supabaseResponse);
      }
      return supabaseResponse;
    }

    // Not authenticated → redirect to login
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return createRedirectResponse(loginUrl, request, supabaseResponse);
    }

    // Check route access by role
    if (role) {
      const allowedPrefixes = ROLE_ROUTES[role] ?? [];
      const isAllowed =
        allowedPrefixes.length === 0 ||
        allowedPrefixes.some((prefix) => pathname.startsWith(prefix));

      if (!isAllowed) {
        const defaultDashboard = ROLE_DASHBOARDS[role] || "/dashboard";
        return createRedirectResponse(defaultDashboard, request, supabaseResponse);
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

