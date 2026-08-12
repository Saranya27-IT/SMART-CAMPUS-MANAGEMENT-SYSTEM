"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROLE_DASHBOARDS, type UserRole } from "@/lib/types/roles";
import type { Database } from "@/lib/types/database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !authData.user) {
    return { error: error?.message || "Invalid credentials" };
  }

  // Get user profile/role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  const role = ((profile as any)?.role || authData.user.user_metadata?.role || "student") as UserRole;
  const targetDashboard = ROLE_DASHBOARDS[role] || "/dashboard";

  revalidatePath("/", "layout");
  redirect(targetDashboard);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Password reset email sent. Check your inbox." };
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();

  const password = formData.get("password") as string;

  const { data: userData, error } = await supabase.auth.updateUser({ password });

  if (error || !userData.user) {
    return { error: error?.message || "Failed to reset password" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();

  const role = ((profile as any)?.role || userData.user.user_metadata?.role || "student") as UserRole;
  const targetDashboard = ROLE_DASHBOARDS[role] || "/dashboard";

  revalidatePath("/", "layout");
  redirect(targetDashboard);
}

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const studentType = (profile as any)?.student_type || user.user_metadata?.student_type || "HOSTELLER";

  if (!profile) {
    return {
      id: user.id,
      role: user.user_metadata?.role || "student",
      full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
      email: user.email!,
      phone: null,
      avatar_url: null,
      department: null,
      roll_number: null,
      employee_id: null,
      gender: null,
      date_of_birth: null,
      address: null,
      is_active: true,
      student_type: studentType,
      created_at: user.created_at,
      updated_at: user.created_at,
    };
  }

  return {
    ...(profile as ProfileRow),
    student_type: studentType,
  };
}
