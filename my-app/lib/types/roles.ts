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
  super_admin: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
  student: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60",
  faculty: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/60",
  librarian: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/60",
  event_organizer: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800/60",
  bus_driver: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
  hostel_warden: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60",
  mess_manager: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
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
