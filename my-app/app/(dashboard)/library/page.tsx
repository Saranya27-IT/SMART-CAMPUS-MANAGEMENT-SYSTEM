import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BookOpen, BookMarked, IndianRupee, Users, TrendingUp, Library } from "lucide-react";
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

export const metadata: Metadata = {
  title: "Library — Smart Campus",
  description: "Manage library books, borrows, returns, and fines.",
};

export default async function LibraryPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const isLibrarian = profile.role === "librarian" || profile.role === "super_admin";
  const isStudent = profile.role === "student";

  const supabase = await createClient();

  const [
    { count: totalBooks },
    { count: activeBorrows },
    { count: overdueBooks },
    { data: recentBorrowsData },
  ] = await Promise.all([
    supabase.from("books").select("*", { count: "exact", head: true }),
    supabase.from("book_borrows").select("*", { count: "exact", head: true }).in("status", ["borrowed", "overdue"]),
    supabase.from("book_borrows").select("*", { count: "exact", head: true }).eq("status", "overdue"),
    supabase.from("book_borrows")
      .select(`*, books(title, isbn), profiles!book_borrows_student_id_fkey(full_name, roll_number)`)
      .order("created_at", { ascending: false })
      .limit(isStudent ? 5 : 10)
      .eq(isStudent ? "student_id" : "librarian_id", isStudent ? profile.id : profile.id),
  ]);

  const recentBorrows = (recentBorrowsData ?? []) as any[];

  return (
    <div className="space-y-6">
      <PageHeader
        title={isStudent ? "Library" : "Library Management"}
        description={isStudent ? "Browse books, manage your borrows, and pay fines." : "Manage books, borrows, returns, and fines."}
        actions={
          isLibrarian ? (
            <Link href="/library/books/new">
              <Button className="gradient-primary text-white border-0 hover:opacity-90" id="add-book-btn">
                <BookOpen className="mr-2 h-4 w-4" />
                Add Book
              </Button>
            </Link>
          ) : null
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Books" value={totalBooks ?? 0} icon={Library} color="indigo" />
        <StatCard title="Active Borrows" value={activeBorrows ?? 0} icon={BookMarked} color="amber" />
        <StatCard title="Overdue" value={overdueBooks ?? 0} icon={TrendingUp} color="rose" />
        <StatCard title="Available to Borrow" value={Math.max(0, (totalBooks ?? 0) - (activeBorrows ?? 0))} icon={BookOpen} color="emerald" />
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link href="/library/books">
          <div className="p-4 rounded-xl border bg-card hover:border-primary/40 transition-colors cursor-pointer text-center space-y-2">
            <BookOpen className="h-6 w-6 mx-auto text-primary" />
            <p className="text-sm font-medium">Browse Books</p>
          </div>
        </Link>
        <Link href="/library/borrows">
          <div className="p-4 rounded-xl border bg-card hover:border-primary/40 transition-colors cursor-pointer text-center space-y-2">
            <BookMarked className="h-6 w-6 mx-auto text-amber-600" />
            <p className="text-sm font-medium">{isLibrarian ? "All Borrows" : "My Borrows"}</p>
          </div>
        </Link>
        <Link href="/library/fines">
          <div className="p-4 rounded-xl border bg-card hover:border-primary/40 transition-colors cursor-pointer text-center space-y-2">
            <IndianRupee className="h-6 w-6 mx-auto text-rose-600" />
            <p className="text-sm font-medium">Fines</p>
          </div>
        </Link>
        {isLibrarian && (
          <Link href="/library/analytics">
            <div className="p-4 rounded-xl border bg-card hover:border-primary/40 transition-colors cursor-pointer text-center space-y-2">
              <TrendingUp className="h-6 w-6 mx-auto text-emerald-600" />
              <p className="text-sm font-medium">Analytics</p>
            </div>
          </Link>
        )}
      </div>

      {/* Recent borrows */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">Recent Borrows</CardTitle>
          <Link href="/library/borrows">
            <Button variant="ghost" size="sm">View all</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {!recentBorrows || recentBorrows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No active borrows.</p>
          ) : (
            <div className="space-y-3">
              {recentBorrows.map((borrow) => {
                const isOverdue = borrow.status === "overdue" || (borrow.status === "borrowed" && new Date(borrow.due_date) < new Date());
                return (
                  <div key={borrow.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {(borrow as Record<string, unknown> & { books?: { title: string } }).books?.title ?? "Unknown Book"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Due: {format(new Date(borrow.due_date), "dd MMM yyyy")}
                        {isStudent ? "" : ` · ${(borrow as Record<string, unknown> & { profiles?: { full_name: string } }).profiles?.full_name}`}
                      </p>
                    </div>
                    <Badge className={cn("border text-xs", STATUS_COLORS[isOverdue ? "overdue" : borrow.status])}>
                      {isOverdue ? "Overdue" : borrow.status}
                    </Badge>
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
