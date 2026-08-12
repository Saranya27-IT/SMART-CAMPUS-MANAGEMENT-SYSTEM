"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function sendNotification(userId: string, title: string, message: string, type: string, link?: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("notifications").insert({ user_id: userId, title, message, type, link } as any);
  return { error: error?.message };
}

export async function broadcastNotification(role: string, title: string, message: string, type: string) {
  const supabase = await createClient();
  const { data: usersData } = await supabase.from("profiles").select("id").eq("role", role);
  const users = (usersData ?? []) as any[];
  if (users.length === 0) return { error: "No users found." };

  const notifications = users.map(u => ({ user_id: u.id, title, message, type }));
  const { error } = await supabase.from("notifications").insert(notifications as any);
  return { error: error?.message };
}

export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient();
  const { error } = await (supabase.from("notifications") as any).update({ read: true }).eq("id", notificationId);
  if (!error) revalidatePath("/notifications");
  return { error: error?.message };
}

export async function markAllNotificationsRead(userId: string) {
  const supabase = await createClient();
  const { error } = await (supabase.from("notifications") as any).update({ read: true }).eq("user_id", userId).eq("read", false);
  if (!error) revalidatePath("/notifications");
  return { error: error?.message };
}

export async function deleteNotification(notificationId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("notifications").delete().eq("id", notificationId);
  if (!error) revalidatePath("/notifications");
  return { error: error?.message };
}
