"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BookOpen, CalendarDays, Bus, Building2,
  UtensilsCrossed, Users, ScrollText, Settings2, Route,
  BedDouble, UserCheck, ClipboardList, AlertCircle, CalendarCheck,
  CreditCard, BarChart3, BookMarked, IndianRupee, Star, UserCircle,
  Bell, ChevronRight, GraduationCap, LogOut, Award, Lightbulb,
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
  Bell, Award, Lightbulb,
};

function getModuleAccent(href: string, active: boolean) {
  if (href.startsWith("/admin")) {
    return active
      ? "text-blue-400 bg-blue-500/10 border-l-2 border-blue-500"
      : "text-blue-400/80 hover:bg-blue-500/5 hover:text-blue-300";
  }
  if (href.startsWith("/library") || href.startsWith("/librarian")) {
    return active
      ? "text-cyan-400 bg-cyan-500/10 border-l-2 border-cyan-500"
      : "text-cyan-400/80 hover:bg-cyan-500/5 hover:text-cyan-300";
  }
  if (href.startsWith("/events") || href.startsWith("/event-organizer") || href.startsWith("/faculty")) {
    return active
      ? "text-pink-400 bg-pink-500/10 border-l-2 border-pink-500"
      : "text-pink-400/80 hover:bg-pink-500/5 hover:text-pink-300";
  }
  if (href.startsWith("/bus") || href.startsWith("/driver")) {
    return active
      ? "text-emerald-400 bg-emerald-500/10 border-l-2 border-emerald-500"
      : "text-emerald-400/80 hover:bg-emerald-500/5 hover:text-emerald-300";
  }
  if (href.startsWith("/hostel") || href.startsWith("/warden")) {
    return active
      ? "text-purple-400 bg-purple-500/10 border-l-2 border-purple-500"
      : "text-purple-400/80 hover:bg-purple-500/5 hover:text-purple-300";
  }
  if (href.startsWith("/mess") || href.startsWith("/mess-manager")) {
    return active
      ? "text-amber-400 bg-amber-500/10 border-l-2 border-amber-500"
      : "text-amber-400/80 hover:bg-amber-500/5 hover:text-amber-300";
  }
  if (href.startsWith("/notifications")) {
    return active
      ? "text-yellow-400 bg-yellow-500/10 border-l-2 border-yellow-500"
      : "text-yellow-400/80 hover:bg-yellow-500/5 hover:text-yellow-300";
  }
  return active
    ? "text-white bg-primary/20 border-l-2 border-primary"
    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground";
}

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
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border/70">
        <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-md flex-shrink-0">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-white tracking-tight truncate">Smart Campus</p>
          <p className="text-[11px] text-sidebar-foreground/60 font-medium truncate">One Campus, One Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3">
        <nav className="px-3 space-y-6">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-2 text-[10px] font-bold text-sidebar-foreground/45 uppercase tracking-widest">
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;
                  const active = isActive(item.href);
                  const accentClass = getModuleAccent(item.href, active);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "sidebar-item group rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 flex items-center gap-3",
                          accentClass
                        )}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0 transition-transform duration-150 group-hover:scale-110" />
                        <span className="flex-1 truncate">{item.title}</span>
                        {item.badge && (
                          <Badge className="ml-auto text-[10px] py-0 px-1.5 h-4.5 bg-primary/20 text-white border-0">
                            {item.badge}
                          </Badge>
                        )}
                        {active && (
                          <ChevronRight className="h-3.5 w-3.5 opacity-70" />
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
      <div className="border-t border-sidebar-border/70 p-3 space-y-2">
        <Link
          href="/profile"
          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-sidebar-accent/50 transition-colors group"
        >
          <Avatar className="h-9 w-9 flex-shrink-0 ring-2 ring-white/10">
            <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">
              {profile.full_name}
            </p>
            <p className={cn(
              "text-[10px] px-2 py-0.5 rounded-full inline-block font-semibold border mt-0.5",
              ROLE_COLORS[role]
            )}>
              {ROLE_LABELS[role]}
            </p>
          </div>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/70 hover:text-rose-400 hover:bg-rose-500/10 gap-2 px-2.5 text-xs font-semibold rounded-lg"
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
