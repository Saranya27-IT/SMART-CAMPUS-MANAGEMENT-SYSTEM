import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { markAllNotificationsRead } from "@/lib/actions/notifications";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Metadata } from "next";

import { getCurrentUser } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Notifications — Smart Campus",
};

export default async function NotificationsPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const supabase = await createClient();

  const { data: notificationsData } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const notifications = (notificationsData ?? []) as any[];

  const unreadCount = (notifications ?? []).filter(n => !n.read).length;

  const TYPE_COLORS: Record<string, string> = {
    library: "bg-indigo-100 text-indigo-700 border-indigo-200",
    event: "bg-amber-100 text-amber-700 border-amber-200",
    bus: "bg-emerald-100 text-emerald-700 border-emerald-200",
    hostel: "bg-cyan-100 text-cyan-700 border-cyan-200",
    mess: "bg-pink-100 text-pink-700 border-pink-200",
    system: "bg-gray-100 text-gray-600 border-gray-200",
    general: "bg-violet-100 text-violet-700 border-violet-200",
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Notifications"
        description={unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.` : "You're all caught up!"}
        actions={
          unreadCount > 0 ? (
            <form action={async () => {
              "use server";
              await markAllNotificationsRead(profile.id);
            }}>
              <Button type="submit" variant="outline" id="mark-all-read-btn">
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark all read
              </Button>
            </form>
          ) : null
        }
      />

      {!notifications || notifications.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center space-y-3">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground/30" />
            <p className="font-medium">No notifications</p>
            <p className="text-sm text-muted-foreground">You'll see updates about library, events, hostel, and mess here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              className={cn(
                "transition-colors",
                !notif.read && "border-primary/30 bg-primary/5"
              )}
            >
              <CardContent className="py-4 px-5">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "mt-0.5 h-2 w-2 rounded-full flex-shrink-0",
                    notif.read ? "bg-muted-foreground/20" : "bg-primary"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-sm", !notif.read && "font-semibold")}>
                        {notif.title}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn("text-xs flex-shrink-0 capitalize", TYPE_COLORS[notif.type])}
                      >
                        {notif.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      {format(new Date(notif.created_at), "d MMM yyyy, h:mm a")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
