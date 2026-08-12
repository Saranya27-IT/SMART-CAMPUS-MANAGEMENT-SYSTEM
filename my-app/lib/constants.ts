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
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  inactive: "bg-gray-100 text-gray-600 border-gray-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-100 text-rose-700 border-rose-200",
  // Borrow
  borrowed: "bg-blue-100 text-blue-700 border-blue-200",
  returned: "bg-emerald-100 text-emerald-700 border-emerald-200",
  overdue: "bg-rose-100 text-rose-700 border-rose-200",
  lost: "bg-gray-100 text-gray-600 border-gray-200",
  // Events
  draft: "bg-gray-100 text-gray-600 border-gray-200",
  upcoming: "bg-blue-100 text-blue-700 border-blue-200",
  ongoing: "bg-emerald-100 text-emerald-700 border-emerald-200",
  completed: "bg-violet-100 text-violet-700 border-violet-200",
  cancelled: "bg-rose-100 text-rose-700 border-rose-200",
  // Trips
  scheduled: "bg-blue-100 text-blue-700 border-blue-200",
  in_progress: "bg-emerald-100 text-emerald-700 border-emerald-200",
  // Complaints
  open: "bg-rose-100 text-rose-700 border-rose-200",
  in_progress2: "bg-amber-100 text-amber-700 border-amber-200",
  resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  closed: "bg-gray-100 text-gray-600 border-gray-200",
  // Beds
  available: "bg-emerald-100 text-emerald-700 border-emerald-200",
  occupied: "bg-blue-100 text-blue-700 border-blue-200",
  maintenance: "bg-amber-100 text-amber-700 border-amber-200",
  // Priority
  low: "bg-gray-100 text-gray-600 border-gray-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  urgent: "bg-rose-100 text-rose-700 border-rose-200",
} as const;

// ── Navigation ────────────────────────────────────────────────
export const NAV_COMMON = [
  { title: "Notifications", href: "/notifications", icon: "Bell" },
  { title: "Profile", href: "/profile", icon: "UserCircle" },
] as const;
