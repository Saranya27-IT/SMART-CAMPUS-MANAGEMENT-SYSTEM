import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, Phone, MapPin, GraduationCap, IdCard, Edit } from "lucide-react";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/types/roles";
import type { UserRole } from "@/lib/types/roles";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Metadata } from "next";

import { getCurrentUser } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "My Profile — Smart Campus",
};

export default async function ProfilePage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const role = profile.role as UserRole;
  const initials = profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="My Profile"
        description="Your campus account details."
      />

      {/* Profile card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Avatar className="h-20 w-20 flex-shrink-0">
              <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name} />
              <AvatarFallback className="gradient-primary text-white text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{profile.full_name}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge className={cn("border", ROLE_COLORS[role])}>
                  {ROLE_LABELS[role]}
                </Badge>
                {profile.department && (
                  <Badge variant="outline">{profile.department}</Badge>
                )}
                <Badge variant={profile.is_active ? "outline" : "destructive"} className={profile.is_active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""}>
                  {profile.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { icon: Mail, label: "Email", value: profile.email },
            { icon: Phone, label: "Phone", value: profile.phone ?? "Not provided" },
            { icon: MapPin, label: "Address", value: profile.address ?? "Not provided" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium">{value}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Academic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.roll_number && (
            <div className="flex items-start gap-3">
              <IdCard className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Roll Number</p>
                <p className="text-sm font-medium font-mono">{profile.roll_number}</p>
              </div>
            </div>
          )}
          {profile.employee_id && (
            <div className="flex items-start gap-3">
              <IdCard className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Employee ID</p>
                <p className="text-sm font-medium font-mono">{profile.employee_id}</p>
              </div>
            </div>
          )}
          {profile.department && (
            <div className="flex items-start gap-3">
              <GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Department</p>
                <p className="text-sm font-medium">{profile.department}</p>
              </div>
            </div>
          )}
          {profile.date_of_birth && (
            <div className="flex items-start gap-3">
              <GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Date of Birth</p>
                <p className="text-sm font-medium">{format(new Date(profile.date_of_birth), "d MMMM yyyy")}</p>
              </div>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground">Account created</p>
            <p className="text-sm font-medium">{format(new Date(profile.created_at), "d MMMM yyyy")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
