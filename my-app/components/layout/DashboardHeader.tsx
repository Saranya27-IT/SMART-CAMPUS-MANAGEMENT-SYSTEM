"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut, Menu, Settings, User, GraduationCap, LayoutDashboard, BookOpen, CalendarDays, Bus, Building2, UtensilsCrossed, Users, ScrollText, Settings2, Route, BedDouble, UserCheck, ClipboardList, AlertCircle, CalendarCheck, CreditCard, BarChart3, BookMarked, IndianRupee, Star, UserCircle, ChevronRight, Lightbulb, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ROLE_NAV, ROLE_LABELS, ROLE_COLORS } from "@/lib/types/roles";
import { useNotifications } from "@/hooks/use-notifications";
import { logout } from "@/lib/actions/auth";
import type { Profile } from "@/lib/types/database.types";
import type { UserRole } from "@/lib/types/roles";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, BookOpen, CalendarDays, Bus, Building2, UtensilsCrossed,
  Users, ScrollText, Settings2, Route, BedDouble, UserCheck, ClipboardList,
  AlertCircle, CalendarCheck, CreditCard, BarChart3, BookMarked, IndianRupee,
  Star, UserCircle, Bell, Award, Lightbulb,
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

interface DashboardHeaderProps {
  profile: Profile;
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { unreadCount } = useNotifications(profile.id);
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

  // Get current page title
  const allItems = navGroups.flatMap((g) => g.items);
  const currentItem = allItems.find((item) => isActive(item.href));
  const pageTitle = currentItem?.title ?? "Dashboard";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/90 backdrop-blur-md px-4 md:px-6 shadow-xs">
      {/* Mobile menu trigger */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-foreground hover:bg-accent hover:text-accent-foreground md:hidden" id="mobile-menu-btn">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 bg-sidebar w-64">
          {/* Mobile sidebar content */}
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-5 py-5 border-b border-sidebar-border/70">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-md">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-white">Smart Campus</p>
                  <p className="text-[11px] text-sidebar-foreground/60">One Campus, One Platform</p>
                </div>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-6">
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
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              "sidebar-item rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 flex items-center gap-3",
                              accentClass
                            )}
                          >
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            <span className="flex-1 truncate">{item.title}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
            <div className="border-t border-sidebar-border/70 p-3 space-y-2">
              <div className="flex items-center gap-3 p-2.5">
                <Avatar className="h-8 w-8 ring-2 ring-white/10">
                  <AvatarImage src={profile.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-sidebar-foreground truncate">{profile.full_name}</p>
                  <p className={cn("text-[10px] px-2 py-0.5 rounded-full inline-block font-semibold border mt-0.5", ROLE_COLORS[role])}>
                    {ROLE_LABELS[role]}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sidebar-foreground/70 hover:text-rose-400 hover:bg-rose-500/10 gap-2 px-2.5 text-xs font-semibold rounded-lg"
                onClick={async () => {
                  setMobileOpen(false);
                  await logout();
                }}
                id="mobile-sidebar-logout-btn"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Page title & Breadcrumbs */}
      <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
        <h2 className="text-base font-bold text-foreground tracking-tight">{pageTitle}</h2>
        <Breadcrumbs />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2.5">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Link href="/notifications">
          <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-muted/80" id="notifications-btn">
            <Bell className="h-4.5 w-4.5 text-muted-foreground hover:text-foreground transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4.5 min-w-4.5 px-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        </Link>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="relative h-9 w-9 rounded-full outline-none ring-2 ring-primary/20 hover:ring-primary/40 transition-all focus-visible:outline-none"
            id="user-menu-btn"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5 shadow-lg border">
            <DropdownMenuLabel className="p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold text-foreground leading-none">{profile.full_name}</p>
                <p className="text-xs leading-none text-muted-foreground font-mono truncate">{profile.email}</p>
                <div className="pt-1">
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold border inline-block", ROLE_COLORS[role])}>
                    {ROLE_LABELS[role]}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-lg p-0">
              <Link href="/profile" className="flex items-center w-full px-2.5 py-2 text-xs font-medium cursor-pointer">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                My Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg p-0">
              <Link href="/notifications" className="flex items-center w-full px-2.5 py-2 text-xs font-medium cursor-pointer">
                <Bell className="mr-2 h-4 w-4 text-muted-foreground" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="ml-auto text-[10px] bg-amber-500 text-white border-0">{unreadCount}</Badge>
                )}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="rounded-lg text-rose-600 dark:text-rose-400 focus:text-rose-700 focus:bg-rose-50 dark:focus:bg-rose-950/30 px-2.5 py-2 text-xs font-semibold cursor-pointer"
              onClick={async () => {
                await logout();
              }}
              id="logout-btn"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
