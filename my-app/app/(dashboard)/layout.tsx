import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Smart Campus Management System",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentUser();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <AppSidebar profile={profile} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader profile={profile} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
