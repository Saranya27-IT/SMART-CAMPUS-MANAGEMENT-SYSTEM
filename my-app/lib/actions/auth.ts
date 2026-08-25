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

export async function createUserByAdmin(input: {
  email: string;
  password?: string;
  full_name: string;
  role: UserRole;
  student_type?: string;
  department?: string;
  roll_number?: string;
  employee_id?: string;
  phone?: string;
}) {
  const current = await getCurrentUser();
  if (!current || current.role !== "super_admin") {
    return { error: "Unauthorized. Super Admin access required." };
  }

  const supabase = await createClient();
  const rawPassword = input.password?.trim() || "Campus@12345";

  // Create Auth User with user_metadata
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: rawPassword,
    options: {
      data: {
        full_name: input.full_name.trim(),
        role: input.role,
        student_type: input.student_type || (input.role === "student" ? "HOSTELLER" : undefined),
      },
    },
  });

  if (authError && !authData?.user) {
    return { error: authError.message };
  }

  const newUserId = authData.user?.id;
  if (!newUserId) {
    return { error: "Failed to generate user ID." };
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: newUserId,
    email: input.email.trim().toLowerCase(),
    full_name: input.full_name.trim(),
    role: input.role,
    student_type: input.student_type || (input.role === "student" ? "HOSTELLER" : "HOSTELLER"),
    department: input.department || null,
    roll_number: input.roll_number || null,
    employee_id: input.employee_id || null,
    phone: input.phone || null,
    is_active: true,
  } as never);

  if (profileError) {
    return { error: profileError.message };
  }

  await supabase.from("audit_logs").insert({
    actor_id: current.id,
    action: "CREATE_USER",
    entity_type: "profiles",
    entity_id: newUserId,
    metadata: { email: input.email, role: input.role, full_name: input.full_name },
  } as never);

  revalidatePath("/admin/users");
  revalidatePath("/admin/dashboard");
  return { success: true, userId: newUserId };
}

export async function updateUserByAdmin(
  userId: string,
  input: {
    full_name?: string;
    role?: UserRole;
    student_type?: string;
    department?: string;
    roll_number?: string;
    employee_id?: string;
    phone?: string;
    is_active?: boolean;
  }
) {
  const current = await getCurrentUser();
  if (!current || current.role !== "super_admin") {
    return { error: "Unauthorized. Super Admin access required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  await supabase.from("audit_logs").insert({
    actor_id: current.id,
    action: "UPDATE_USER",
    entity_type: "profiles",
    entity_id: userId,
    metadata: input,
  } as never);

  revalidatePath("/admin/users");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function toggleUserStatusByAdmin(userId: string, currentStatus: boolean) {
  const current = await getCurrentUser();
  if (!current || current.role !== "super_admin") {
    return { error: "Unauthorized. Super Admin access required." };
  }

  const supabase = await createClient();
  const nextStatus = !currentStatus;

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: nextStatus } as never)
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  await supabase.from("audit_logs").insert({
    actor_id: current.id,
    action: nextStatus ? "ACTIVATE_USER" : "DEACTIVATE_USER",
    entity_type: "profiles",
    entity_id: userId,
    metadata: { is_active: nextStatus },
  } as never);

  revalidatePath("/admin/users");
  revalidatePath("/admin/dashboard");
  return { success: true, is_active: nextStatus };
}
