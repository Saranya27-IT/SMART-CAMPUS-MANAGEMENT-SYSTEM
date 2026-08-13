import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  BookOpen, BookMarked, IndianRupee, Users, TrendingUp, Library,
  FolderTree, UserCheck, Layers, AlertCircle, Plus, ChevronRight
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
    { name: "Borrowed", value: analytics.borrowedCopies, color: "#3b82f6" },
    { name: "Overdue", value: analytics.overdueBorrows, color: "#f43f5e" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={isLibrarianOrAdmin ? "Library Management" : "Smart Library"}
        description={
          isLibrarianOrAdmin
            ? "Overview of library catalogue, physical copies, loans, overdue records, and fines."
            : "Browse books, view copy availability, manage active borrows, and track fines."
        }
        actions={
          isLibrarianOrAdmin ? (
            <div className="flex items-center gap-2">
              <Link href="/library/borrows">
                <Button variant="outline" size="sm">
                  <BookMarked className="mr-2 h-4 w-4" />
                  Issue Book
                </Button>
              </Link>
              <Link href="/library/books/new">
                <Button size="sm" className="gradient-primary text-white border-0 hover:opacity-90" id="add-book-btn">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Book
                </Button>
              </Link>
            </div>
          ) : null
        }
      />

      {/* 9 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard title="Total Books" value={analytics.totalBooks} icon={Library} color="indigo" />
        <StatCard title="Total Copies" value={analytics.totalCopies} icon={Layers} color="cyan" />
        <StatCard title="Available Copies" value={analytics.availableCopies} icon={BookOpen} color="emerald" />
        <StatCard title="Borrowed Copies" value={analytics.borrowedCopies} icon={BookMarked} color="cyan" />
        <StatCard title="Overdue Books" value={analytics.overdueBorrows} icon={AlertCircle} color="rose" />
        <StatCard title="Active Borrows" value={analytics.activeBorrows} icon={TrendingUp} color="amber" />
        <StatCard title="Total Fines" value={`₹${analytics.totalFines}`} icon={IndianRupee} color="violet" />
        <StatCard title="Authors" value={analytics.totalAuthors} icon={Users} color="indigo" />
        <StatCard title="Categories" value={analytics.totalCategories} icon={FolderTree} color="amber" />
      </div>

      {/* Quick Access Navigation Bar */}
      <Card>
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Library Sections
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <Link href="/library/books">
              <div className="p-3 rounded-lg border bg-card hover:border-primary/50 transition-colors cursor-pointer text-center space-y-1">
                <BookOpen className="h-5 w-5 mx-auto text-indigo-600" />
                <p className="text-xs font-medium truncate">Books</p>
              </div>
            </Link>
            <Link href="/library/authors">
              <div className="p-3 rounded-lg border bg-card hover:border-primary/50 transition-colors cursor-pointer text-center space-y-1">
                <Users className="h-5 w-5 mx-auto text-blue-600" />
                <p className="text-xs font-medium truncate">Authors</p>
              </div>
            </Link>
            <Link href="/library/categories">
              <div className="p-3 rounded-lg border bg-card hover:border-primary/50 transition-colors cursor-pointer text-center space-y-1">
                <FolderTree className="h-5 w-5 mx-auto text-amber-600" />
                <p className="text-xs font-medium truncate">Categories</p>
              </div>
            </Link>
            <Link href="/library/publishers">
              <div className="p-3 rounded-lg border bg-card hover:border-primary/50 transition-colors cursor-pointer text-center space-y-1">
                <UserCheck className="h-5 w-5 mx-auto text-emerald-600" />
                <p className="text-xs font-medium truncate">Publishers</p>
              </div>
            </Link>
            <Link href="/library/copies">
              <div className="p-3 rounded-lg border bg-card hover:border-primary/50 transition-colors cursor-pointer text-center space-y-1">
                <Layers className="h-5 w-5 mx-auto text-cyan-600" />
                <p className="text-xs font-medium truncate">Copies</p>
              </div>
            </Link>
            <Link href="/library/borrows">
              <div className="p-3 rounded-lg border bg-card hover:border-primary/50 transition-colors cursor-pointer text-center space-y-1">
                <BookMarked className="h-5 w-5 mx-auto text-purple-600" />
                <p className="text-xs font-medium truncate">{isLibrarianOrAdmin ? "Borrows" : "My Borrows"}</p>
              </div>
            </Link>
            <Link href="/library/fines">
              <div className="p-3 rounded-lg border bg-card hover:border-primary/50 transition-colors cursor-pointer text-center space-y-1">
                <IndianRupee className="h-5 w-5 mx-auto text-rose-600" />
                <p className="text-xs font-medium truncate">Fines</p>
              </div>
            </Link>
            <Link href="/library/analytics">
              <div className="p-3 rounded-lg border bg-card hover:border-primary/50 transition-colors cursor-pointer text-center space-y-1">
                <TrendingUp className="h-5 w-5 mx-auto text-teal-600" />
                <p className="text-xs font-medium truncate">Analytics</p>
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">
            {isLibrarianOrAdmin ? "Recent Library Borrowing Activity" : "My Recent Borrows"}
          </CardTitle>
          <Link href="/library/borrows">
            <Button variant="ghost" size="sm" className="text-xs">
              View all <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentBorrows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No recent borrowing activity recorded.</p>
          ) : (
            <div className="space-y-3">
              {recentBorrows.map((borrow) => {
                const isOverdue =
                  borrow.status === "overdue" ||
                  (borrow.status === "borrowed" && new Date(borrow.due_date) < new Date());
                const statusKey = isOverdue ? "overdue" : borrow.status;

                return (
                  <div
                    key={borrow.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border bg-card hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {borrow.books?.title ?? "Untitled Book"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Due: {format(new Date(borrow.due_date), "dd MMM yyyy")}
                          {isLibrarianOrAdmin && borrow.profiles?.full_name
                            ? ` · Borrower: ${borrow.profiles.full_name} (${borrow.profiles.roll_number || borrow.profiles.email})`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <Badge className={cn("border text-xs capitalize", STATUS_COLORS[statusKey])}>
                        {isOverdue ? "Overdue" : borrow.status}
                      </Badge>
                      {borrow.fine_amount > 0 && (
                        <Badge variant="outline" className="text-xs text-rose-600 border-rose-200 bg-rose-50">
                          Fine: ₹{borrow.fine_amount}
                        </Badge>
                      )}
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
