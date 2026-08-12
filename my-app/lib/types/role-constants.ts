// ============================================================
// SMART CAMPUS MANAGEMENT SYSTEM — Role Constants (Edge Compliant)
// Pure data constants for Middleware & Edge Runtime
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

export const ROLE_DASHBOARDS: Record<UserRole, string> = {
  super_admin: "/admin/dashboard",
  student: "/dashboard",
  faculty: "/faculty/dashboard",
  librarian: "/librarian/dashboard",
  event_organizer: "/event-organizer/dashboard",
  bus_driver: "/driver/dashboard",
  hostel_warden: "/warden/dashboard",
  mess_manager: "/mess-manager/dashboard",
};

export const ROLE_ROUTES: Record<UserRole, string[]> = {
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
