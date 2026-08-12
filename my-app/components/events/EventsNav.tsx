"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CalendarDays, Settings2, Building2, QrCode, BarChart3, Award } from "lucide-react";
import type { UserRole } from "@/lib/types/roles";

interface EventsNavProps {
  role?: UserRole | string;
}

export function EventsNav({ role }: EventsNavProps) {
  const pathname = usePathname();

  const isOrganizerOrAdmin = role === "super_admin" || role === "event_organizer";
  const isAdmin = role === "super_admin";

  const tabs = [
    {
      title: "Browse Events",
      href: "/events",
      icon: CalendarDays,
      show: true,
    },
    {
      title: "Manage Events",
      href: "/events/manage",
      icon: Settings2,
      show: isOrganizerOrAdmin,
    },
    {
      title: "Hall Management",
      href: "/admin/halls",
      icon: Building2,
      show: isAdmin,
    },
    {
      title: "QR Check-in",
      href: "/events/check-in",
      icon: QrCode,
      show: isOrganizerOrAdmin,
    },
    {
      title: "Analytics",
      href: "/events/analytics",
      icon: BarChart3,
      show: isOrganizerOrAdmin,
    },
    {
      title: "Certificates",
      href: "/events/certificates",
      icon: Award,
      show: true,
    },
  ];

  const visibleTabs = tabs.filter((t) => t.show);

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border pb-3 mb-6 scrollbar-none">
      {visibleTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          tab.href === "/events"
            ? pathname === "/events"
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{tab.title}</span>
          </Link>
        );
      })}
    </div>
  );
}
