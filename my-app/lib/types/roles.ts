import { USER_ROLES, type UserRole, ROLE_DASHBOARDS, ROLE_ROUTES } from "./role-constants";

export { USER_ROLES, type UserRole, ROLE_DASHBOARDS, ROLE_ROUTES };

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  student: "Student",
  faculty: "Faculty",
  librarian: "Librarian",
  event_organizer: "Event Organizer",
  bus_driver: "Bus Driver",
  hostel_warden: "Hostel Warden",
  mess_manager: "Mess Manager",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: "bg-rose-100 text-rose-700 border-rose-200",
  student: "bg-blue-100 text-blue-700 border-blue-200",
  faculty: "bg-violet-100 text-violet-700 border-violet-200",
  librarian: "bg-amber-100 text-amber-700 border-amber-200",
  event_organizer: "bg-emerald-100 text-emerald-700 border-emerald-200",
  bus_driver: "bg-orange-100 text-orange-700 border-orange-200",
  hostel_warden: "bg-cyan-100 text-cyan-700 border-cyan-200",
  mess_manager: "bg-pink-100 text-pink-700 border-pink-200",
};


export type NavItem = {
  title: string;
  href: string;
  icon: string; // Lucide icon name
  badge?: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

/**
 * Sidebar navigation config per role.
 */
export const ROLE_NAV: Record<UserRole, NavGroup[]> = {
  super_admin: [
    {
      label: "Overview",
      items: [
        { title: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard" },
      ],
    },
    {
      label: "Administration",
      items: [
        { title: "Users & Roles", href: "/admin/users", icon: "Users" },
        { title: "Audit Logs", href: "/admin/audit-logs", icon: "ScrollText" },
      ],
    },
    {
      label: "Modules",
      items: [
        { title: "Library", href: "/library", icon: "BookOpen" },
        { title: "Events", href: "/events", icon: "CalendarDays" },
        { title: "Bus", href: "/bus/manage", icon: "Bus" },
        { title: "Hostel", href: "/hostel/manage", icon: "Building2" },
        { title: "Mess", href: "/mess/manage", icon: "UtensilsCrossed" },
      ],
    },
  ],

  student: [
    {
      label: "Overview",
      items: [
        { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
        { title: "My Profile", href: "/profile", icon: "UserCircle" },
      ],
    },
    {
      label: "Campus Services",
      items: [
        { title: "Library", href: "/library", icon: "BookOpen" },
        { title: "Events", href: "/events", icon: "CalendarDays" },
        { title: "My Bus", href: "/bus", icon: "Bus" },
        { title: "Hostel", href: "/hostel", icon: "Building2" },
        { title: "Mess", href: "/mess", icon: "UtensilsCrossed" },
      ],
    },
  ],

  faculty: [
    {
      label: "Overview",
      items: [
        { title: "Dashboard", href: "/faculty/dashboard", icon: "LayoutDashboard" },
        { title: "My Profile", href: "/profile", icon: "UserCircle" },
      ],
    },
    {
      label: "Events",
      items: [
        { title: "All Events", href: "/events", icon: "CalendarDays" },
      ],
    },
  ],

  librarian: [
    {
      label: "Overview",
      items: [
        { title: "Dashboard", href: "/librarian/dashboard", icon: "LayoutDashboard" },
      ],
    },
    {
      label: "Library",
      items: [
        { title: "Books", href: "/library/books", icon: "BookOpen" },
        { title: "Borrows", href: "/library/borrows", icon: "BookMarked" },
        { title: "Fines", href: "/library/fines", icon: "IndianRupee" },
        { title: "Analytics", href: "/library/analytics", icon: "BarChart3" },
      ],
    },
  ],

  event_organizer: [
    {
      label: "Overview",
      items: [
        { title: "Dashboard", href: "/event-organizer/dashboard", icon: "LayoutDashboard" },
      ],
    },
    {
      label: "Events",
      items: [
        { title: "All Events", href: "/events", icon: "CalendarDays" },
      ],
    },
  ],

  bus_driver: [
    {
      label: "Overview",
      items: [
        { title: "Dashboard", href: "/driver/dashboard", icon: "LayoutDashboard" },
      ],
    },
    {
      label: "My Trips",
      items: [
        { title: "Trips", href: "/bus/trips", icon: "Route" },
      ],
    },
  ],

  hostel_warden: [
    {
      label: "Overview",
      items: [
        { title: "Dashboard", href: "/warden/dashboard", icon: "LayoutDashboard" },
      ],
    },
    {
      label: "Hostel Management",
      items: [
        { title: "Overview", href: "/hostel/manage", icon: "Building2" },
        { title: "Rooms & Beds", href: "/hostel/rooms", icon: "BedDouble" },
        { title: "Allocations", href: "/hostel/allocations", icon: "UserCheck" },
        { title: "Leave Requests", href: "/hostel/leaves", icon: "ClipboardList" },
        { title: "Complaints", href: "/hostel/complaints", icon: "AlertCircle" },
        { title: "Attendance", href: "/hostel/attendance", icon: "CalendarCheck" },
        { title: "Fees", href: "/hostel/fees", icon: "CreditCard" },
        { title: "Analytics", href: "/hostel/analytics", icon: "BarChart3" },
      ],
    },
  ],

  mess_manager: [
    {
      label: "Overview",
      items: [
        { title: "Dashboard", href: "/mess-manager/dashboard", icon: "LayoutDashboard" },
      ],
    },
    {
      label: "Mess Management",
      items: [
        { title: "Overview", href: "/mess/manage", icon: "UtensilsCrossed" },
        { title: "Weekly Menu", href: "/mess/menu", icon: "ClipboardList" },
        { title: "Attendance", href: "/mess/attendance", icon: "CalendarCheck" },
        { title: "Feedback", href: "/mess/feedback", icon: "Star" },
        { title: "Complaints", href: "/mess/complaints", icon: "AlertCircle" },
        { title: "Suggestions", href: "/mess/suggestions", icon: "Lightbulb" },
        { title: "Analytics", href: "/mess/analytics", icon: "BarChart3" },
      ],
    },
  ],
};
