import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  BookOpen, BookMarked, IndianRupee, Users, TrendingUp, Library,
  FolderTree, UserCheck, Layers, AlertCircle, Plus, ChevronRight, Sparkles
} from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";
import { format } from "date-fns";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/actions/auth";
import { getLibraryAnalytics } from "@/lib/actions/library";
import { LibraryDashboardCharts } from "./LibraryDashboardCharts";

export const metadata: Metadata = {
  title: "Library — Smart Campus",
  description: "Manage library books, physical copies, borrows, returns, and fines.",
};

export default async function LibraryPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const isLibrarianOrAdmin = profile.role === "librarian" || profile.role === "super_admin";
  const isStudentOrFaculty = profile.role === "student" || profile.role === "faculty";

  const analytics = await getLibraryAnalytics();
  const supabase = await createClient();

  // Fetch recent borrowing activity
  let recentBorrowsQuery = supabase
    .from("book_borrows")
    .select(`
      id, due_date, return_date, status, fine_amount,
      books(title, isbn, cover_url),
      profiles!book_borrows_student_id_fkey(full_name, roll_number, email)
    `)
    .order("created_at", { ascending: false })
    .limit(6);

  if (isStudentOrFaculty) {
    recentBorrowsQuery = recentBorrowsQuery.eq("student_id", profile.id);
  }

  const { data: recentBorrowsData } = await recentBorrowsQuery;
  const recentBorrows = (recentBorrowsData ?? []) as any[];

  // Chart data setup
  const copyStatusData = [
    { name: "Available", value: analytics.availableCopies, color: "#10b981" },
    { name: "Borrowed", value: analytics.borrowedCopies, color: "#06b6d4" },
    { name: "Overdue", value: analytics.overdueBorrows, color: "#f43f5e" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={isLibrarianOrAdmin ? "Library Management System" : "Smart Campus Library"}
        description={
          isLibrarianOrAdmin
            ? "Unified catalogue control, physical copy inventory, circulating loans, and fine accounting."
            : "Explore repository books, check live shelf availability, renew loans, and track fines."
        }
        badge="Library"
        badgeColor="bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800"
        actions={
          isLibrarianOrAdmin ? (
            <div className="flex items-center gap-2">
              <Link href="/library/borrows">
                <Button variant="outline" size="sm" className="rounded-xl border-cyan-200 hover:bg-cyan-50 dark:border-cyan-800 dark:hover:bg-cyan-950/30 text-xs">
                  <BookMarked className="mr-1.5 h-4 w-4 text-cyan-600" />
                  Issue / Return
                </Button>
              </Link>
              <Link href="/library/books/new">
                <Button size="sm" className="gradient-library text-white border-0 hover:opacity-90 shadow-sm rounded-xl text-xs font-semibold" id="add-book-btn">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add New Book
                </Button>
              </Link>
            </div>
          ) : null
        }
      />

      {/* 9 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard title="Total Catalog Titles" value={analytics.totalBooks} icon={Library} color="cyan" />
        <StatCard title="Physical Inventory" value={analytics.totalCopies} icon={Layers} color="blue" />
        <StatCard title="Available on Shelves" value={analytics.availableCopies} icon={BookOpen} color="emerald" />
        <StatCard title="In Circulation" value={analytics.borrowedCopies} icon={BookMarked} color="indigo" />
        <StatCard title="Overdue Books" value={analytics.overdueBorrows} icon={AlertCircle} color="rose" />
        <StatCard title="Active Borrowers" value={analytics.activeBorrows} icon={TrendingUp} color="amber" />
        <StatCard title="Collected Fines" value={`₹${analytics.totalFines}`} icon={IndianRupee} color="purple" />
        <StatCard title="Authors Catalogued" value={analytics.totalAuthors} icon={Users} color="teal" />
      </div>

      {/* Quick Section Navigation Bar */}
      <Card className="rounded-2xl border shadow-xs overflow-hidden">
        <CardHeader className="py-3 px-5 border-b bg-muted/20">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Library Explorer & Sections
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <Link href="/library/books">
              <div className="p-3.5 rounded-2xl border bg-card hover:border-cyan-300 dark:hover:border-cyan-700/60 hover:shadow-xs transition-all cursor-pointer text-center space-y-1.5 group">
                <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-300 flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                  <BookOpen className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-foreground truncate">Books</p>
              </div>
            </Link>
            <Link href="/library/authors">
              <div className="p-3.5 rounded-2xl border bg-card hover:border-blue-300 dark:hover:border-blue-700/60 hover:shadow-xs transition-all cursor-pointer text-center space-y-1.5 group">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                  <Users className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-foreground truncate">Authors</p>
              </div>
            </Link>
            <Link href="/library/categories">
              <div className="p-3.5 rounded-2xl border bg-card hover:border-amber-300 dark:hover:border-amber-700/60 hover:shadow-xs transition-all cursor-pointer text-center space-y-1.5 group">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                  <FolderTree className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-foreground truncate">Categories</p>
              </div>
            </Link>
            <Link href="/library/publishers">
              <div className="p-3.5 rounded-2xl border bg-card hover:border-emerald-300 dark:hover:border-emerald-700/60 hover:shadow-xs transition-all cursor-pointer text-center space-y-1.5 group">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                  <UserCheck className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-foreground truncate">Publishers</p>
              </div>
            </Link>
            <Link href="/library/copies">
              <div className="p-3.5 rounded-2xl border bg-card hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:shadow-xs transition-all cursor-pointer text-center space-y-1.5 group">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                  <Layers className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-foreground truncate">Copies</p>
              </div>
            </Link>
            <Link href="/library/borrows">
              <div className="p-3.5 rounded-2xl border bg-card hover:border-purple-300 dark:hover:border-purple-700/60 hover:shadow-xs transition-all cursor-pointer text-center space-y-1.5 group">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                  <BookMarked className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-foreground truncate">{isLibrarianOrAdmin ? "Borrows" : "My Borrows"}</p>
              </div>
            </Link>
            <Link href="/library/fines">
              <div className="p-3.5 rounded-2xl border bg-card hover:border-rose-300 dark:hover:border-rose-700/60 hover:shadow-xs transition-all cursor-pointer text-center space-y-1.5 group">
                <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                  <IndianRupee className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-foreground truncate">Fines</p>
              </div>
            </Link>
            <Link href="/library/analytics">
              <div className="p-3.5 rounded-2xl border bg-card hover:border-teal-300 dark:hover:border-teal-700/60 hover:shadow-xs transition-all cursor-pointer text-center space-y-1.5 group">
                <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-300 flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-foreground truncate">Analytics</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Visual Analytics */}
      <LibraryDashboardCharts
        categoryDistribution={analytics.categoryDistribution}
        copyStatusData={copyStatusData}
      />

      {/* Recent Activity */}
      <Card className="rounded-2xl border shadow-xs overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b bg-muted/20">
          <CardTitle className="text-base font-bold">
            {isLibrarianOrAdmin ? "Recent Library Borrowing Activity" : "My Recent Borrows"}
          </CardTitle>
          <Link href="/library/borrows">
            <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary">
              View all <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-4">
          {recentBorrows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No borrowing activity recorded yet.
            </p>
          ) : (
            <div className="divide-y divide-border/60">
              {recentBorrows.map((borrow) => {
                const book = borrow.books as any;
                const student = borrow.profiles as any;
                const isOverdue = borrow.status === "overdue" || (borrow.status === "borrowed" && new Date(borrow.due_date) < new Date());

                return (
                  <div key={borrow.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-300 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">{book?.title ?? "Unknown Title"}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {isLibrarianOrAdmin ? `Issued to ${student?.full_name || "Student"} (${student?.roll_number || "—"})` : `Due date: ${format(new Date(borrow.due_date), "dd MMM yyyy")}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge className={cn("text-xs uppercase font-mono", STATUS_COLORS[isOverdue ? "overdue" : borrow.status])}>
                        {isOverdue ? "overdue" : borrow.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
