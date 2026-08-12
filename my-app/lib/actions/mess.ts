"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { format, startOfWeek, endOfWeek, addDays } from "date-fns";
import { messMenuSchema, messFeedbackSchema, messComplaintSchema, complaintUpdateSchema, messSuggestionSchema } from "@/lib/schemas/mess";

// ── Helper: RBAC Role Check ──────────────────────────────────────────────────

async function getAuthRole() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { user: null, role: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile as any)?.role || user.user_metadata?.role || "student";
  return { user, role };
}

// ── Weekly Menu Management ────────────────────────────────────────────────────

export async function getMenuForDate(date?: string) {
  const supabase = await createClient();
  const targetDate = date ?? new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("mess_menus")
    .select("*")
    .eq("date", targetDate)
    .order("meal_type");

  return { data: (data ?? []) as any[], error: error?.message };
}

export async function getMenuRange(startDate: string, endDate: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mess_menus")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  return { data: (data ?? []) as any[], error: error?.message };
}

export async function getWeeklyMenu(referenceDate?: string) {
  const ref = referenceDate ? new Date(referenceDate) : new Date();
  const start = format(startOfWeek(ref, { weekStartsOn: 0 }), "yyyy-MM-dd");
  const end = format(endOfWeek(ref, { weekStartsOn: 0 }), "yyyy-MM-dd");

  const { data, error } = await getMenuRange(start, end);

  // Structure by date and meal_type
  const days: Record<string, Record<string, string[]>> = {};
  for (let i = 0; i < 7; i++) {
    const dStr = format(addDays(new Date(start), i), "yyyy-MM-dd");
    days[dStr] = { breakfast: [], lunch: [], snacks: [], dinner: [] };
  }

  (data ?? []).forEach((item: any) => {
    if (days[item.date]) {
      days[item.date][item.meal_type] = item.items || [];
    }
  });

  return { data: days, startDate: start, endDate: end, rawData: data ?? [], error };
}

export async function upsertMenu(date: string, mealType: string, items: string[]) {
  const { user, role } = await getAuthRole();
  if (!user || (role !== "mess_manager" && role !== "super_admin")) {
    return { error: "Unauthorized. Only Mess Managers and Super Admins can manage the menu." };
  }

  const validation = messMenuSchema.safeParse({ date, meal_type: mealType, items });
  if (!validation.success) {
    return { error: (validation.error as any).issues?.[0]?.message || (validation.error as any).errors?.[0]?.message || "Invalid menu data." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("mess_menus")
    .upsert(
      {
        date: validation.data.date,
        meal_type: validation.data.meal_type,
        items: validation.data.items,
        manager_id: user.id,
      } as never,
      { onConflict: "date,meal_type" }
    )
    .select()
    .single();

  if (!error) {
    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      action: "UPSERT_MESS_MENU",
      entity_type: "mess_menus",
      metadata: { date, meal_type: mealType, items_count: items.length },
    } as never);

    revalidatePath("/mess");
    revalidatePath("/mess/menu");
    revalidatePath("/mess-manager/dashboard");
  }
  return { data: data as any, error: error?.message };
}

export async function deleteMenu(id: string) {
  const { user, role } = await getAuthRole();
  if (!user || (role !== "mess_manager" && role !== "super_admin")) {
    return { error: "Unauthorized. Only Mess Managers and Super Admins can delete menu items." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("mess_menus").delete().eq("id", id);

  if (!error) {
    revalidatePath("/mess");
    revalidatePath("/mess/menu");
    revalidatePath("/mess-manager/dashboard");
  }
  return { error: error?.message };
}

// ── Meal Attendance ──────────────────────────────────────────────────────────

export async function getMessAttendance(date?: string, mealType?: string) {
  const supabase = await createClient();
  const targetDate = date ?? new Date().toISOString().split("T")[0];

  const { data: students } = await supabase
    .from("profiles")
    .select("id, full_name, roll_number, department")
    .eq("role", "student")
    .eq("is_active", true)
    .order("roll_number");

  let q = supabase.from("mess_attendance").select("*").eq("date", targetDate);
  if (mealType) q = q.eq("meal_type", mealType);

  const { data: attendanceData, error } = await q;
  if (error) return { data: [], error: error.message };

  const attMap = new Map((attendanceData ?? []).map((a: any) => [`${a.student_id}_${a.meal_type}`, a.present]));

  const result = (students ?? []).map((s: any) => ({
    student_id: s.id,
    full_name: s.full_name,
    roll_number: s.roll_number || "N/A",
    department: s.department || "N/A",
    breakfast: attMap.has(`${s.id}_breakfast`) ? attMap.get(`${s.id}_breakfast`) : false,
    lunch: attMap.has(`${s.id}_lunch`) ? attMap.get(`${s.id}_lunch`) : false,
    snacks: attMap.has(`${s.id}_snacks`) ? attMap.get(`${s.id}_snacks`) : false,
    dinner: attMap.has(`${s.id}_dinner`) ? attMap.get(`${s.id}_dinner`) : false,
  }));

  return { data: result, targetDate, error: null };
}

export async function markMessAttendance(
  studentId: string,
  mealType: string,
  present: boolean,
  date?: string
) {
  const { user, role } = await getAuthRole();
  if (!user || (role !== "mess_manager" && role !== "super_admin")) {
    return { error: "Unauthorized. Only Mess Managers and Super Admins can mark meal attendance." };
  }

  const supabase = await createClient();
  const targetDate = date ?? new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("mess_attendance")
    .upsert(
      { student_id: studentId, date: targetDate, meal_type: mealType, present } as never,
      { onConflict: "student_id,date,meal_type" }
    )
    .select()
    .single();

  if (!error) {
    revalidatePath("/mess");
    revalidatePath("/mess/attendance");
    revalidatePath("/mess-manager/dashboard");
  }
  return { data: data as any, error: error?.message };
}

// ── Meal Ratings & Feedback ─────────────────────────────────────────────────

export async function submitFeedback(mealType: string, rating: number, comment?: string, date?: string) {
  const { user } = await getAuthRole();
  if (!user) return { error: "Unauthorized" };

  const targetDate = date ?? new Date().toISOString().split("T")[0];

  const validation = messFeedbackSchema.safeParse({
    date: targetDate,
    meal_type: mealType,
    rating,
    comment,
  });

  if (!validation.success) {
    return { error: (validation.error as any).issues?.[0]?.message || (validation.error as any).errors?.[0]?.message || "Invalid feedback data" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("mess_feedback")
    .upsert(
      {
        student_id: user.id,
        date: targetDate,
        meal_type: validation.data.meal_type,
        rating: validation.data.rating,
        comment: validation.data.comment || null,
      } as never,
      { onConflict: "student_id,date,meal_type" }
    )
    .select()
    .single();

  if (!error) {
    revalidatePath("/mess");
    revalidatePath("/mess/feedback");
  }
  return { data: data as any, error: error?.message };
}

export async function getFeedback(date?: string) {
  const supabase = await createClient();
  let q = supabase
    .from("mess_feedback")
    .select(`*, profiles!mess_feedback_student_id_fkey(full_name, roll_number)`)
    .order("created_at", { ascending: false });

  if (date) q = q.eq("date", date);

  const { data, error } = await q;
  return { data: (data ?? []) as any[], error: error?.message };
}

export async function getMessRatingOverview() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mess_feedback")
    .select("rating, meal_type, created_at, comment");

  if (error) return { averageRating: 0, totalCount: 0, distribution: {}, mealRatings: {} };

  const feedback = (data ?? []) as any[];
  const totalCount = feedback.length;
  if (totalCount === 0) {
    return { averageRating: 0, totalCount: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, mealRatings: {} };
  }

  const sum = feedback.reduce((acc: number, curr: any) => acc + curr.rating, 0);
  const avg = Number((sum / totalCount).toFixed(1));

  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const mealSums: Record<string, { sum: number; count: number }> = {
    breakfast: { sum: 0, count: 0 },
    lunch: { sum: 0, count: 0 },
    snacks: { sum: 0, count: 0 },
    dinner: { sum: 0, count: 0 },
  };

  feedback.forEach((f: any) => {
    dist[f.rating] = (dist[f.rating] || 0) + 1;
    if (mealSums[f.meal_type]) {
      mealSums[f.meal_type].sum += f.rating;
      mealSums[f.meal_type].count += 1;
    }
  });

  const mealRatings: Record<string, number> = {};
  Object.keys(mealSums).forEach((m) => {
    mealRatings[m] = mealSums[m].count > 0 ? Number((mealSums[m].sum / mealSums[m].count).toFixed(1)) : 0;
  });

  return { averageRating: avg, totalCount, distribution: dist, mealRatings };
}

// ── Food Complaints ──────────────────────────────────────────────────────────

export async function getMessComplaints() {
  const { user, role } = await getAuthRole();
  if (!user) return { data: null, error: "Unauthorized" };

  const supabase = await createClient();
  let q = supabase
    .from("mess_complaints")
    .select(`*, profiles!mess_complaints_student_id_fkey(full_name, roll_number, department)`)
    .order("created_at", { ascending: false });

  if (role === "student") {
    q = q.eq("student_id", user.id);
  }

  const { data, error } = await q;
  return { data: (data ?? []) as any[], error: error?.message };
}

export async function createMessComplaint(description: string, category: string, mealDate?: string, mealType?: string) {
  const { user } = await getAuthRole();
  if (!user) return { error: "Unauthorized" };

  const validation = messComplaintSchema.safeParse({ description, category, meal_date: mealDate, meal_type: mealType });
  if (!validation.success) {
    return { error: (validation.error as any).issues?.[0]?.message || (validation.error as any).errors?.[0]?.message || "Invalid complaint details" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("mess_complaints")
    .insert({
      student_id: user.id,
      description: validation.data.description,
      category: validation.data.category,
      meal_date: validation.data.meal_date || new Date().toISOString().split("T")[0],
      meal_type: validation.data.meal_type || "lunch",
      status: "open",
    } as never)
    .select()
    .single();

  if (!error) {
    revalidatePath("/mess");
    revalidatePath("/mess/complaints");
  }
  return { data: data as any, error: error?.message };
}

export async function updateMessComplaintStatus(complaintId: string, status: string, remarks?: string) {
  const { user, role } = await getAuthRole();
  if (!user || (role !== "mess_manager" && role !== "super_admin")) {
    return { error: "Unauthorized. Only Mess Managers and Super Admins can update complaint status." };
  }

  const validation = complaintUpdateSchema.safeParse({ complaint_id: complaintId, status, resolution_remarks: remarks });
  if (!validation.success) {
    return { error: (validation.error as any).issues?.[0]?.message || (validation.error as any).errors?.[0]?.message || "Invalid update data" };
  }

  const supabase = await createClient();

  const updates: Record<string, unknown> = { status: validation.data.status };
  if (remarks) updates.resolution_remarks = remarks;

  if (status === "resolved" || status === "closed") {
    updates.resolved_by = user.id;
    updates.resolved_at = new Date().toISOString();
  }

  const { data: complaint } = await supabase.from("mess_complaints").select("student_id, category").eq("id", complaintId).single();

  const { error } = await (supabase.from("mess_complaints") as any).update(updates).eq("id", complaintId);

  if (!error && complaint) {
    await supabase.from("notifications").insert({
      user_id: (complaint as any).student_id,
      title: "Mess Complaint Status Updated",
      message: `Your ${(complaint as any).category} mess complaint status is now "${status.replace("_", " ")}".`,
      type: "mess",
    } as never);

    revalidatePath("/mess");
    revalidatePath("/mess/complaints");
    revalidatePath("/mess-manager/dashboard");
  }
  return { error: error?.message };
}

// ── Food Suggestions ──────────────────────────────────────────────────────────

export async function getMessSuggestions() {
  const { user, role } = await getAuthRole();
  if (!user) return { data: null, error: "Unauthorized" };

  const supabase = await createClient();
  let q = supabase
    .from("mess_suggestions")
    .select(`*, profiles!mess_suggestions_student_id_fkey(full_name, roll_number, department)`)
    .order("created_at", { ascending: false });

  if (role === "student") {
    q = q.eq("student_id", user.id);
  }

  const { data, error } = await q;
  return { data: (data ?? []) as any[], error: error?.message };
}

export async function submitMessSuggestion(suggestionText: string) {
  const { user } = await getAuthRole();
  if (!user) return { error: "Unauthorized" };

  const validation = messSuggestionSchema.safeParse({ suggestion: suggestionText });
  if (!validation.success) {
    return { error: (validation.error as any).issues?.[0]?.message || (validation.error as any).errors?.[0]?.message || "Invalid suggestion" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("mess_suggestions")
    .insert({
      student_id: user.id,
      suggestion: validation.data.suggestion,
      status: "pending",
    } as never)
    .select()
    .single();

  if (!error) {
    revalidatePath("/mess");
    revalidatePath("/mess/suggestions");
  }
  return { data: data as any, error: error?.message };
}

export async function updateSuggestionStatus(suggestionId: string, status: string) {
  const { user, role } = await getAuthRole();
  if (!user || (role !== "mess_manager" && role !== "super_admin")) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("mess_suggestions")
    .update({ status } as never)
    .eq("id", suggestionId);

  if (!error) {
    revalidatePath("/mess");
    revalidatePath("/mess/suggestions");
    revalidatePath("/mess-manager/dashboard");
  }
  return { error: error?.message };
}

// ── Mess Dashboard Stats & Analytics ──────────────────────────────────────────

export async function getMessDashboardStats() {
  const supabase = await createClient();
  const todayStr = new Date().toISOString().split("T")[0];

  const [
    { data: todayMenu },
    { count: totalStudents },
    { data: todayAttendance },
    { data: complaints },
    { data: suggestions },
    { data: feedback },
  ] = await Promise.all([
    supabase.from("mess_menus").select("*").eq("date", todayStr),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student").eq("is_active", true),
    supabase.from("mess_attendance").select("present, meal_type").eq("date", todayStr),
    supabase.from("mess_complaints").select("id, status"),
    supabase.from("mess_suggestions").select("id, status"),
    supabase.from("mess_feedback").select("rating, meal_type, comment"),
  ]);

  const totalMealPresent = (todayAttendance ?? []).filter((a: any) => a.present).length;
  const pendingComplaints = (complaints ?? []).filter((c: any) => c.status === "open" || c.status === "in_progress").length;
  const pendingSuggestions = (suggestions ?? []).filter((s: any) => s.status === "pending").length;

  const totalFeedbackCount = (feedback ?? []).length;
  const avgRating = totalFeedbackCount > 0
    ? Number(((feedback ?? []).reduce((acc: number, f: any) => acc + f.rating, 0) / totalFeedbackCount).toFixed(1))
    : 0;

  return {
    todayMenu: todayMenu ?? [],
    totalStudents: totalStudents ?? 0,
    todayMealAttendanceCount: totalMealPresent,
    totalComplaints: (complaints ?? []).length,
    pendingComplaints,
    totalSuggestions: (suggestions ?? []).length,
    pendingSuggestions,
    averageRating: avgRating,
    totalFeedbackCount,
    recentFeedback: (feedback ?? []).slice(0, 5),
  };
}
