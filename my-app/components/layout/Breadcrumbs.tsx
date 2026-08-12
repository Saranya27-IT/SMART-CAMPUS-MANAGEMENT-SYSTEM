"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const SEGMENT_NAME_MAP: Record<string, string> = {
  dashboard: "Dashboard",
  admin: "Admin",
  users: "Users",
  "audit-logs": "Audit Logs",
  library: "Library",
  books: "Books",
  borrows: "Borrows",
  fines: "Fines",
  categories: "Categories",
  authors: "Authors",
  publishers: "Publishers",
  copies: "Book Copies",
  events: "Events",
  manage: "Manage",
  "check-in": "QR Check-in",
  certificates: "Certificates",
  bus: "Bus Services",
  trips: "Trips",
  routes: "Routes & Stops",
  hostel: "Hostel",
  rooms: "Rooms & Beds",
  allocations: "Allocations",
  leaves: "Leave Requests",
  complaints: "Complaints",
  attendance: "Attendance",
  fees: "Fees",
  mess: "Mess Facilities",
  menu: "Menu",
  feedback: "Feedback",
  analytics: "Analytics",
  profile: "My Profile",
  notifications: "Notifications",
  faculty: "Faculty",
  librarian: "Librarian",
  "event-organizer": "Event Organizer",
  driver: "Bus Driver",
  warden: "Hostel Warden",
  "mess-manager": "Mess Manager",
};

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("hidden sm:flex items-center space-x-1 text-xs text-muted-foreground", className)}>
      <Link href="/dashboard" className="flex items-center gap-1 hover:text-foreground transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;
        const displayName = SEGMENT_NAME_MAP[segment] || segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

        return (
          <div key={href} className="flex items-center">
            <ChevronRight className="h-3.5 w-3.5 mx-1 opacity-50" />
            {isLast ? (
              <span className="font-semibold text-foreground truncate max-w-[150px]">{displayName}</span>
            ) : (
              <Link href={href} className="hover:text-foreground transition-colors truncate max-w-[120px]">
                {displayName}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
