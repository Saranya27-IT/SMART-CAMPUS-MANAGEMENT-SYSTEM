"use client";

import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/lib/types/database.types";
import { useEffect, useState } from "react";

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    async function fetchNotifications() {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(50);

      const list = ((data ?? []) as any[]) as Notification[];
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.read).length);
      setLoading(false);
    }

    fetchNotifications();

    // Subscribe to realtime notifications
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as Notification;
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? updated : n))
          );
          if (updated.read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  async function markAsRead(notificationId: string) {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ read: true } as never)
      .eq("id", notificationId);
  }

  async function markAllAsRead() {
    if (!userId) return;
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ read: true } as never)
      .eq("user_id", userId)
      .eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead };
}
