// ============================================================
// SMART CAMPUS MANAGEMENT SYSTEM — App Constants
// ============================================================

export const APP_NAME = "Smart Campus";
export const APP_TAGLINE = "One Campus, One Platform";

// ── Library ──────────────────────────────────────────────────
export const LIBRARY = {
  FINE_PER_DAY: 2,           // ₹2 per day overdue
  MAX_RENEWALS: 2,            // Books can be renewed max 2 times
  BORROW_DAYS: 14,            // Default borrow period in days
  RENEWAL_DAYS: 7,            // Each renewal extends by 7 days
  MAX_BORROWS_STUDENT: 3,     // Max simultaneous borrows per student
} as const;

// ── Events ────────────────────────────────────────────────────
export const EVENTS = {
  DEFAULT_CAPACITY: 100,
  QR_CHECKIN_ENABLED: true,
  CERTIFICATE_VALIDITY_DAYS: 365,
} as const;

// ── Bus ───────────────────────────────────────────────────────
export const BUS = {
  TRIP_TYPES: ["morning", "evening", "special"] as const,
  TRIP_STATUSES: ["scheduled", "in_progress", "completed", "cancelled"] as const,
} as const;

// ── Hostel ────────────────────────────────────────────────────
export const HOSTEL = {
  COMPLAINT_CATEGORIES: [
    "maintenance",
    "cleanliness",
    "food",
    "security",
    "noise",
    "other",
  ] as const,
  LEAVE_STATUS: ["pending", "approved", "rejected"] as const,
  ATTENDANCE_STATUS: ["present", "absent", "on_leave"] as const,
  BED_STATUS: ["available", "occupied", "maintenance"] as const,
  PRIORITY: ["low", "medium", "high", "urgent"] as const,
  COMPLAINT_STATUS: ["open", "in_progress", "resolved", "closed"] as const,
} as const;

// ── Mess ──────────────────────────────────────────────────────
export const MESS = {
  MEAL_TYPES: ["breakfast", "lunch", "snacks", "dinner"] as const,
  MEAL_LABELS: {
    breakfast: "Breakfast",
    lunch: "Lunch",
    snacks: "Snacks",
    dinner: "Dinner",
  },
  MEAL_ICONS: {
    breakfast: "☕",
    lunch: "🍽️",
    snacks: "🥗",
    dinner: "🌙",
  },
  MEAL_TIMES: {
    breakfast: "7:30 AM – 9:00 AM",
    lunch: "12:00 PM – 2:00 PM",
    snacks: "4:30 PM – 5:30 PM",
    dinner: "7:30 PM – 9:30 PM",
  },
  COMPLAINT_CATEGORIES: ["quality", "hygiene", "quantity", "service", "other"] as const,
  MAX_RATING: 5,
} as const;

// ── Pagination ────────────────────────────────────────────────
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

// ── Date/Time ─────────────────────────────────────────────────
export const DATE_FORMATS = {
  DISPLAY: "dd MMM yyyy",
  DISPLAY_WITH_TIME: "dd MMM yyyy, hh:mm a",
  ISO: "yyyy-MM-dd",
  TIME_ONLY: "hh:mm a",
} as const;

// ── Status badge colors (Tailwind) ────────────────────────────
export const STATUS_COLORS: Record<string, string> = {
  // Generic
  active: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
  inactive: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800/60",
  pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
  rejected: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60",
  // Borrow
  borrowed: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
  returned: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
  overdue: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60",
  lost: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800/60",
  // Events
  draft: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800/60",
  upcoming: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
  ongoing: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60",
  completed: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60",
  // Trips
  scheduled: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
  in_progress: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
  // Complaints
  open: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60",
  in_progress2: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
  closed: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800/60",
  // Beds
  available: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
  occupied: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
  maintenance: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
  // Priority
  low: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800/60",
  medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
  high: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/60",
  urgent: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60",
} as const;

// ── Navigation ────────────────────────────────────────────────
export const NAV_COMMON = [
  { title: "Notifications", href: "/notifications", icon: "Bell" },
  { title: "Profile", href: "/profile", icon: "UserCircle" },
] as const;
