"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BookOpen, CalendarDays, Bus, Building2,
  UtensilsCrossed, Users, ScrollText, Settings2, Route,
  BedDouble, UserCheck, ClipboardList, AlertCircle, CalendarCheck,
  CreditCard, BarChart3, BookMarked, IndianRupee, Star, UserCircle,
  Bell, ChevronRight, GraduationCap, LogOut, Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_NAV, ROLE_LABELS, ROLE_COLORS } from "@/lib/types/roles";
import type { Profile } from "@/lib/types/database.types";
import type { UserRole } from "@/lib/types/roles";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions/auth";

// Map icon names to Lucide components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, BookOpen, CalendarDays, Bus, Building2,
  UtensilsCrossed, Users, ScrollText, Settings2, Route,
  BedDouble, UserCheck, ClipboardList, AlertCircle, CalendarCheck,
  CreditCard, BarChart3, BookMarked, IndianRupee, Star, UserCircle,
  Bell, Award,
};

interface AppSidebarProps {
  profile: Profile;
}

export function AppSidebar({ profile }: AppSidebarProps) {
  const pathname = usePathname();
  const role = profile.role as UserRole;
  const studentType = (profile as any)?.student_type || "HOSTELLER";

  const rawGroups = ROLE_NAV[role] ?? [];
  const navGroups = rawGroups.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (role === "student") {
        if (studentType === "DAY_SCHOLAR") {
          if (item.href.startsWith("/hostel") || item.href.startsWith("/mess")) return false;
        } else {
          if (item.href.startsWith("/bus")) return false;
        }
      }
      return true;
    }),
  }));

  const initials = profile.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <aside className="hidden md:flex w-64 flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Brand header */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl gradient-primary shadow-md flex-shrink-0">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-sidebar-foreground truncate">Smart Campus</p>
          <p className="text-xs text-sidebar-foreground/50 truncate">One Campus, One Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3">
        <nav className="px-3 space-y-6">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1.5 text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-widest">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "sidebar-item",
                          active
                            ? "sidebar-item-active"
                            : "sidebar-item-inactive"
                        )}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1 truncate">{item.title}</span>
                        {item.badge && (
                          <Badge className="ml-auto text-xs py-0 px-1.5 h-5">
                            {item.badge}
                          </Badge>
                        )}
                        {active && (
                          <ChevronRight className="h-3 w-3 opacity-50" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* User profile footer */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        <Link
          href="/profile"
          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-sidebar-accent/50 transition-colors group"
        >
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name} />
            <AvatarFallback className="gradient-primary text-white text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {profile.full_name}
            </p>
            <p className={cn(
              "text-xs px-1.5 py-0.5 rounded-full inline-block font-medium border",
              ROLE_COLORS[role]
            )}>
              {ROLE_LABELS[role]}
            </p>
          </div>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 gap-2 px-2.5 text-xs font-medium"
          onClick={async () => {
            await logout();
          }}
          id="sidebar-logout-btn"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </aside>
  );
}
