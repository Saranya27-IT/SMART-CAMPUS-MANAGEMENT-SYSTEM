"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut, Menu, Search, Settings, User, X, GraduationCap, LayoutDashboard, BookOpen, CalendarDays, Bus, Building2, UtensilsCrossed, Users, ScrollText, Settings2, Route, BedDouble, UserCheck, ClipboardList, AlertCircle, CalendarCheck, CreditCard, BarChart3, BookMarked, IndianRupee, Star, UserCircle, ChevronRight } from "lucide-react";
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
  Star, UserCircle, Bell,
};

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
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
      {/* Mobile menu trigger */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-accent hover:text-accent-foreground md:hidden" id="mobile-menu-btn">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 bg-sidebar w-64">
          {/* Mobile sidebar content */}
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-5 py-5 border-b border-sidebar-border">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl gradient-primary shadow-md">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-sidebar-foreground">Smart Campus</p>
                  <p className="text-xs text-sidebar-foreground/50">One Campus, One Platform</p>
                </div>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-6">
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
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              "sidebar-item",
                              active ? "sidebar-item-active" : "sidebar-item-inactive"
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
            <div className="border-t border-sidebar-border p-3 space-y-2">
              <div className="flex items-center gap-3 p-2.5">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile.avatar_url ?? undefined} />
                  <AvatarFallback className="gradient-primary text-white text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{profile.full_name}</p>
                  <p className={cn("text-xs px-1.5 py-0.5 rounded-full inline-block font-medium border", ROLE_COLORS[role])}>
                    {ROLE_LABELS[role]}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 gap-2 px-2.5 text-xs font-medium"
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
        <h2 className="text-base font-semibold text-foreground">{pageTitle}</h2>
        <Breadcrumbs />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Link href="/notifications">
          <Button variant="ghost" size="icon" className="relative" id="notifications-btn">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full gradient-primary text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        </Link>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="relative h-9 w-9 rounded-full outline-none ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            id="user-menu-btn"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name} />
              <AvatarFallback className="gradient-primary text-white text-sm font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{profile.full_name}</p>
                <p className="text-xs leading-none text-muted-foreground">{profile.email}</p>
                <Badge variant="outline" className={cn("text-xs mt-1 w-fit", ROLE_COLORS[role])}>
                  {ROLE_LABELS[role]}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="p-0">
              <Link href="/profile" className="flex items-center w-full px-2 py-1.5 cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                My Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-0">
              <Link href="/profile" className="flex items-center w-full px-2 py-1.5 cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Account Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-0">
              <Link href="/notifications" className="flex items-center w-full px-2 py-1.5 cursor-pointer">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="ml-auto text-xs">{unreadCount}</Badge>
                )}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
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
