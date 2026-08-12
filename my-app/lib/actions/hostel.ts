"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { leaveRequestSchema, leaveApprovalSchema, hostelComplaintSchema, hostelFeeSchema } from "@/lib/schemas/hostel";

// ── Helper: Check Student Type (HOSTELLER vs DAY_SCHOLAR) ────────────────────

export async function checkHostelAuthorization() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { allowed: false, error: "Unauthorized", user: null, role: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, student_type")
    .eq("id", user.id)
    .single();

  const role = (profile as any)?.role || user.user_metadata?.role || "student";
  const studentType = (profile as any)?.student_type || user.user_metadata?.student_type || "HOSTELLER";

  if (role === "student" && studentType === "DAY_SCHOLAR") {
    return {
      allowed: false,
      error: "Hostel services are available only for hostel students.",
      user,
      role,
      studentType,
      profile,
    };
  }

  return { allowed: true, user, role, studentType, profile };
}

// ── Hostel CRUD ──────────────────────────────────────────────────────────────

export async function getHostels() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hostels")
    .select(`*, profiles!hostels_warden_id_fkey(full_name)`)
    .order("name");
  return { data: (data ?? []) as any[], error: error?.message };
}

export async function getHostelWithRooms(hostelId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hostels")
    .select(`
      *,
      hostel_blocks(
        *,
        hostel_floors(
          *,
          hostel_rooms(
            *,
            hostel_beds(*, profiles!hostel_beds_student_id_fkey(id, full_name, roll_number, department))
          )
        )
      )
    `)
    .eq("id", hostelId)
    .single();
  return { data: data as any, error: error?.message };
}

export async function createHostel(input: Record<string, unknown>) {
  const authCheck = await checkHostelAuthorization();
  if (!authCheck.allowed && authCheck.role === "student") return { error: authCheck.error };

  const supabase = await createClient();
  const { data, error } = await supabase.from("hostels").insert(input as never).select().single();
  if (!error) revalidatePath("/hostel/manage");
  return { data: data as any, error: error?.message };
}

// ── Room & Bed Management ───────────────────────────────────────────────────

export async function getHostelRooms() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hostel_rooms")
    .select(`
      *,
      hostel_floors(
        floor_number,
        hostel_blocks(
          name,
          hostels(id, name)
        )
      ),
      hostel_beds(*, profiles!hostel_beds_student_id_fkey(id, full_name, roll_number))
    `)
    .order("room_number");

  if (error) return { data: [], error: error.message };

  const formattedRooms = (data ?? []).map((room: any) => {
    const totalBeds = room.capacity || 2;
    const occupiedBeds = (room.hostel_beds || []).filter((b: any) => b.status === "occupied").length;
    const maintenanceBeds = (room.hostel_beds || []).filter((b: any) => b.status === "maintenance").length;
    const availableBeds = totalBeds - occupiedBeds - maintenanceBeds;

    let computedStatus = room.status || "Available";
    if (maintenanceBeds > 0 || room.condition === "Under Maintenance") {
      computedStatus = "Maintenance";
    } else if (occupiedBeds >= totalBeds) {
      computedStatus = "Full";
    } else if (occupiedBeds > 0) {
      computedStatus = "Partially Occupied";
    } else {
      computedStatus = "Available";
    }

    return {
      ...room,
      occupied_beds_count: occupiedBeds,
      available_beds_count: Math.max(0, availableBeds),
      computed_status: computedStatus,
      hostel_name: room.hostel_floors?.hostel_blocks?.hostels?.name || "Unassigned Hostel",
      block_name: room.hostel_floors?.hostel_blocks?.name || "Block A",
      floor_number: room.hostel_floors?.floor_number ?? 1,
    };
  });

  return { data: formattedRooms, error: null };
}

export async function allocateBed(bedId: string, studentId: string) {
  const supabase = await createClient();

  // Validate student profile
  const { data: targetStudentData } = await supabase
    .from("profiles")
    .select("id, role, student_type, full_name")
    .eq("id", studentId)
    .single();

  const targetStudent = targetStudentData as any;

  if (!targetStudent || targetStudent.role !== "student") {
    return { error: "Invalid student selected." };
  }

  const studentType = targetStudent.student_type || "HOSTELLER";
  if (studentType === "DAY_SCHOLAR") {
    return { error: "Hostel services are available only for hostel students. DAY_SCHOLAR students cannot be allocated a hostel room." };
  }

  // Check student doesn't already have an active room allocation
  const { data: existingAlloc } = await supabase
    .from("hostel_beds")
    .select("id, bed_number, room_id")
    .eq("student_id", studentId)
    .eq("status", "occupied")
    .maybeSingle();

  if (existingAlloc) {
    return { error: "Student already has an active room bed allocated." };
  }

  // Check target bed & room condition
  const { data: bedData } = await supabase
    .from("hostel_beds")
    .select(`
      id, status, bed_number, room_id,
      hostel_rooms(id, capacity, condition, type)
    `)
    .eq("id", bedId)
    .single();

  const bed = bedData as any;
  if (!bed) return { error: "Selected bed does not exist." };
  if (bed.status !== "available") return { error: `Bed ${bed.bed_number} is not available (${bed.status}).` };
  if (bed.hostel_rooms?.condition === "Under Maintenance") {
    return { error: "Cannot allocate bed in a room currently under maintenance." };
  }

  // Check room capacity
  const { count: currentOccupiedCount } = await supabase
    .from("hostel_beds")
    .select("id", { count: "exact", head: true })
    .eq("room_id", bed.room_id)
    .eq("status", "occupied");

  if ((currentOccupiedCount ?? 0) >= (bed.hostel_rooms?.capacity || 2)) {
    return { error: "Room capacity limit reached. Cannot over-allocate room." };
  }

  // Allocate
  const { error } = await supabase
    .from("hostel_beds")
    .update({
      student_id: studentId,
      status: "occupied",
      allocated_at: new Date().toISOString(),
    } as never)
    .eq("id", bedId);

  if (!error) {
    await supabase.from("notifications").insert({
      user_id: studentId,
      title: "Hostel Bed Allocated",
      message: `Bed ${bed.bed_number} has been successfully allocated to you.`,
      type: "hostel",
    } as never);

    revalidatePath("/hostel");
    revalidatePath("/hostel/rooms");
    revalidatePath("/hostel/allocations");
    revalidatePath("/warden/dashboard");
  }

  return { error: error?.message };
}

export async function deallocateBed(bedId: string) {
  const supabase = await createClient();
  const { data: bedData } = await supabase.from("hostel_beds").select("student_id, bed_number").eq("id", bedId).single();
  const bed = bedData as any;

  const { error } = await supabase
    .from("hostel_beds")
    .update({
      student_id: null,
      status: "available",
      allocated_at: null,
    } as never)
    .eq("id", bedId);

  if (!error && bed?.student_id) {
    await supabase.from("notifications").insert({
      user_id: bed.student_id,
      title: "Hostel Bed Deallocated",
      message: `Your allocation for Bed ${bed.bed_number} has been removed.`,
      type: "hostel",
    } as never);

    revalidatePath("/hostel");
    revalidatePath("/hostel/rooms");
    revalidatePath("/hostel/allocations");
    revalidatePath("/warden/dashboard");
  }
  return { error: error?.message };
}

export async function updateRoomCondition(roomId: string, condition: string, status?: string) {
  const supabase = await createClient();
  const updates: Record<string, unknown> = { condition };
  if (status) updates.status = status;

  const { error } = await supabase.from("hostel_rooms").update(updates as never).eq("id", roomId);
  if (!error) {
    revalidatePath("/hostel/rooms");
    revalidatePath("/warden/dashboard");
  }
  return { error: error?.message };
}

// ── Student Hostel View Data ─────────────────────────────────────────────────

export async function getStudentHostelOverview() {
  const authCheck = await checkHostelAuthorization();
  if (!authCheck.allowed) {
    return { isDayScholar: true, message: authCheck.error, data: null };
  }

  const supabase = await createClient();
  const userId = authCheck.user!.id;

  // 1. Get allocated bed and room details
  const { data: bedData } = await supabase
    .from("hostel_beds")
    .select(`
      id, bed_number, status, allocated_at,
      hostel_rooms(
        id, room_number, capacity, type, condition,
        hostel_floors(
          floor_number,
          hostel_blocks(
            name,
            hostels(id, name, type, address)
          )
        )
      )
    `)
    .eq("student_id", userId)
    .eq("status", "occupied")
    .maybeSingle();

  const bed = bedData as any;
  let roommates: any[] = [];

  if (bed?.hostel_rooms?.id) {
    const { data: mates } = await supabase
      .from("hostel_beds")
      .select(`bed_number, profiles!hostel_beds_student_id_fkey(full_name, roll_number, department, phone)`)
      .eq("room_id", bed.hostel_rooms.id)
      .neq("student_id", userId)
      .eq("status", "occupied");

    roommates = (mates ?? []).map((m: any) => ({
      bed_number: m.bed_number,
      full_name: m.profiles?.full_name || "Unknown",
      roll_number: m.profiles?.roll_number,
      department: m.profiles?.department,
    }));
  }

  // 2. Fetch fees, leaves, complaints, attendance
  const [
    { data: fees },
    { data: leaves },
    { data: complaints },
    { data: attendance },
  ] = await Promise.all([
    supabase.from("hostel_fees").select("*").eq("student_id", userId).order("due_date", { ascending: false }),
    supabase.from("leave_requests").select("*").eq("student_id", userId).order("created_at", { ascending: false }),
    supabase.from("hostel_complaints").select("*").eq("student_id", userId).order("created_at", { ascending: false }),
    supabase.from("hostel_attendance").select("*").eq("student_id", userId).order("date", { ascending: false }).limit(30),
  ]);

  const feeRecords = (fees ?? []).map((f: any) => {
    const total = Number(f.amount) || 0;
    const paid = f.paid ? total : Number(f.paid_amount) || 0;
    const pending = Math.max(0, total - paid);
    const isOverdue = pending > 0 && f.due_date && new Date(f.due_date) < new Date();

    let feeStatus = "Pending";
    if (paid >= total && total > 0) feeStatus = "Paid";
    else if (paid > 0 && paid < total) feeStatus = "Partially Paid";
    else if (isOverdue) feeStatus = "Overdue";

    return { ...f, pending_amount: pending, paid_amount: paid, fee_status: feeStatus };
  });

  const totalPendingFee = feeRecords.reduce((acc, f) => acc + f.pending_amount, 0);
  const nextFeeDeadline = feeRecords.find((f) => f.pending_amount > 0)?.due_date || null;

  return {
    isDayScholar: false,
    message: null,
    data: {
      profile: authCheck.profile,
      allocation: bed
        ? {
            bed_number: bed.bed_number,
            room_number: bed.hostel_rooms?.room_number,
            room_type: bed.hostel_rooms?.type,
            room_condition: bed.hostel_rooms?.condition,
            block_name: bed.hostel_rooms?.hostel_floors?.hostel_blocks?.name,
            floor_number: bed.hostel_rooms?.hostel_floors?.floor_number,
            hostel_id: bed.hostel_rooms?.hostel_floors?.hostel_blocks?.hostels?.id,
            hostel_name: bed.hostel_rooms?.hostel_floors?.hostel_blocks?.hostels?.name,
            allocated_at: bed.allocated_at,
          }
        : null,
      roommates,
      fees: feeRecords,
      totalPendingFee,
      nextFeeDeadline,
      leaves: leaves ?? [],
      complaints: complaints ?? [],
      attendance: attendance ?? [],
    },
  };
}

// ── Warden / Admin Dashboard Analytics ───────────────────────────────────────

export async function getWardenDashboardStats() {
  const supabase = await createClient();

  const [
    { count: totalStudents },
    { data: rooms },
    { data: beds },
    { count: pendingLeaves },
    { count: pendingComplaints },
    { data: fees },
    { data: attendanceToday },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student").eq("is_active", true),
    supabase.from("hostel_rooms").select("id, capacity, condition, status"),
    supabase.from("hostel_beds").select("id, room_id, status, student_id"),
    supabase.from("leave_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("hostel_complaints").select("id", { count: "exact", head: true }).in("status", ["open", "pending", "in_progress"]),
    supabase.from("hostel_fees").select("id, amount, paid, paid_amount, due_date"),
    supabase.from("hostel_attendance").select("status").eq("date", new Date().toISOString().split("T")[0]),
  ]);

  const totalRoomsCount = (rooms ?? []).length;
  let occupiedRooms = 0;
  let availableRooms = 0;
  let partiallyOccupiedRooms = 0;
  let maintenanceRooms = 0;

  (rooms ?? []).forEach((r: any) => {
    const roomBeds = (beds ?? []).filter((b: any) => b.room_id === r.id);
    const occBeds = roomBeds.filter((b: any) => b.status === "occupied").length;

    if (r.condition === "Under Maintenance" || r.status === "Maintenance") {
      maintenanceRooms++;
    } else if (occBeds === 0) {
      availableRooms++;
    } else if (occBeds >= (r.capacity || 2)) {
      occupiedRooms++;
    } else {
      partiallyOccupiedRooms++;
    }
  });

  const occupiedBedsCount = (beds ?? []).filter((b: any) => b.status === "occupied").length;

  // Fee Analytics
  let pendingFeesTotal = 0;
  let upcomingFeeDeadlinesCount = 0;
  const todayStr = new Date().toISOString().split("T")[0];

  (fees ?? []).forEach((f: any) => {
    const total = Number(f.amount) || 0;
    const paid = f.paid ? total : Number(f.paid_amount) || 0;
    const pending = Math.max(0, total - paid);
    pendingFeesTotal += pending;

    if (pending > 0 && f.due_date && f.due_date >= todayStr) {
      upcomingFeeDeadlinesCount++;
    }
  });

  // Attendance Overview
  const attList = attendanceToday ?? [];
  const presentCount = attList.filter((a: any) => a.status === "present").length;
  const absentCount = attList.filter((a: any) => a.status === "absent").length;
  const leaveCount = attList.filter((a: any) => a.status === "on_leave").length;

  return {
    totalHostelStudents: occupiedBedsCount,
    totalStudents: totalStudents ?? 0,
    totalRooms: totalRoomsCount,
    occupiedRooms,
    availableRooms,
    partiallyOccupiedRooms,
    maintenanceRooms,
    pendingLeaves: pendingLeaves ?? 0,
    pendingComplaints: pendingComplaints ?? 0,
    pendingFeesTotal,
    upcomingFeeDeadlinesCount,
    attendanceToday: {
      present: presentCount,
      absent: absentCount,
      onLeave: leaveCount,
      totalMarked: attList.length,
    },
  };
}

// ── Student List & Filters ───────────────────────────────────────────────────

export async function getHostelStudentsList(search?: string, hostelId?: string, feeStatusFilter?: string) {
  const supabase = await createClient();

  const { data: bedsData, error } = await supabase
    .from("hostel_beds")
    .select(`
      id, bed_number, status, allocated_at,
      profiles!hostel_beds_student_id_fkey(
        id, full_name, roll_number, department, email, phone, student_type
      ),
      hostel_rooms(
        room_number,
        hostel_floors(
          floor_number,
          hostel_blocks(
            name,
            hostels(id, name)
          )
        )
      )
    `)
    .eq("status", "occupied");

  if (error) return { data: [], error: error.message };

  const todayStr = new Date().toISOString().split("T")[0];
  const [{ data: feesData }, { data: attendanceData }] = await Promise.all([
    supabase.from("hostel_fees").select("student_id, amount, paid, paid_amount, due_date"),
    supabase.from("hostel_attendance").select("student_id, status").eq("date", todayStr),
  ]);

  let result = (bedsData ?? [])
    .map((b: any) => {
      const student = b.profiles;
      if (!student) return null;

      const studentFees = (feesData ?? []).filter((f: any) => f.student_id === student.id);
      let feeStatus = "Paid";
      studentFees.forEach((f: any) => {
        const total = Number(f.amount) || 0;
        const paid = f.paid ? total : Number(f.paid_amount) || 0;
        const pending = total - paid;
        if (pending > 0) {
          if (f.due_date && f.due_date < todayStr) feeStatus = "Overdue";
          else if (paid > 0) feeStatus = "Partially Paid";
          else feeStatus = "Pending";
        }
      });

      const todayAtt = (attendanceData ?? []).find((a: any) => a.student_id === student.id);

      return {
        student_id: student.id,
        full_name: student.full_name,
        roll_number: student.roll_number || "N/A",
        department: student.department || "N/A",
        email: student.email,
        phone: student.phone || "N/A",
        student_type: student.student_type || "HOSTELLER",
        bed_id: b.id,
        bed_number: b.bed_number,
        room_number: b.hostel_rooms?.room_number || "N/A",
        block_name: b.hostel_rooms?.hostel_floors?.hostel_blocks?.name || "N/A",
        hostel_id: b.hostel_rooms?.hostel_floors?.hostel_blocks?.hostels?.id,
        hostel_name: b.hostel_rooms?.hostel_floors?.hostel_blocks?.hostels?.name || "N/A",
        fee_status: feeStatus,
        attendance_status: (todayAtt as any)?.status || "Not Marked",
      };
    })
    .filter(Boolean);

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (s: any) =>
        s.full_name.toLowerCase().includes(q) ||
        s.roll_number.toLowerCase().includes(q) ||
        s.room_number.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q)
    );
  }

  if (hostelId) {
    result = result.filter((s: any) => s.hostel_id === hostelId);
  }

  if (feeStatusFilter && feeStatusFilter !== "all") {
    result = result.filter((s: any) => s.fee_status.toLowerCase() === feeStatusFilter.toLowerCase());
  }

  return { data: result, error: null };
}

// ── Leave Requests ────────────────────────────────────────────────────────────

export async function getLeaveRequests(hostelId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Unauthorized" };

  const { data: profileData } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const profile = profileData as any;
  const isStudent = profile?.role === "student";

  let q = supabase
    .from("leave_requests")
    .select(`*, profiles!leave_requests_student_id_fkey(full_name, roll_number, department)`)
    .order("created_at", { ascending: false });

  if (isStudent) {
    q = q.eq("student_id", user.id);
  } else if (hostelId) {
    q = q.eq("hostel_id", hostelId);
  }

  const { data, error } = await q;
  return { data: (data ?? []) as any[], error: error?.message };
}

export async function createLeaveRequest(input: Record<string, unknown>) {
  const authCheck = await checkHostelAuthorization();
  if (!authCheck.allowed) return { error: authCheck.error };

  const validation = leaveRequestSchema.safeParse(input);
  if (!validation.success) {
    return { error: (validation.error as any).issues?.[0]?.message || (validation.error as any).errors?.[0]?.message || "Invalid leave request inputs" };
  }

  const supabase = await createClient();
  const user = authCheck.user!;

  const { data, error } = await supabase
    .from("leave_requests")
    .insert({
      student_id: user.id,
      hostel_id: validation.data.hostel_id,
      from_date: validation.data.from_date,
      to_date: validation.data.to_date,
      reason: validation.data.reason,
      destination: validation.data.destination || null,
      additional_details: validation.data.additional_details || null,
      status: "pending",
    } as never)
    .select()
    .single();

  if (!error) {
    const { data: hostelData } = await supabase.from("hostels").select("warden_id").eq("id", validation.data.hostel_id).single();
    const hostel = hostelData as any;
    if (hostel?.warden_id) {
      await supabase.from("notifications").insert({
        user_id: hostel.warden_id,
        title: "New Hostel Leave Request",
        message: `${(authCheck.profile as any)?.full_name || "A student"} submitted a leave request from ${validation.data.from_date} to ${validation.data.to_date}.`,
        type: "hostel",
      } as never);
    }
    revalidatePath("/hostel");
    revalidatePath("/hostel/leaves");
    revalidatePath("/warden/dashboard");
  }
  return { data: data as any, error: error?.message };
}

export async function approveLeaveRequest(leaveId: string, status: "approved" | "rejected", remark?: string) {
  const validation = leaveApprovalSchema.safeParse({ leave_id: leaveId, status, warden_remark: remark });
  if (!validation.success) {
    return { error: (validation.error as any).issues?.[0]?.message || (validation.error as any).errors?.[0]?.message || "Validation failed" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: leaveData } = await supabase.from("leave_requests").select("student_id, from_date, to_date").eq("id", leaveId).single();
  const leave = leaveData as any;

  const { error } = await supabase
    .from("leave_requests")
    .update({
      status,
      warden_id: user.id,
      warden_remark: remark || null,
      approved_at: status === "approved" ? new Date().toISOString() : null,
    } as never)
    .eq("id", leaveId);

  if (!error && leave) {
    await supabase.from("notifications").insert({
      user_id: leave.student_id,
      title: `Leave Request ${status === "approved" ? "Approved" : "Rejected"}`,
      message: remark ? `Warden note: ${remark}` : `Your leave request for ${leave.from_date} to ${leave.to_date} has been ${status}.`,
      type: "hostel",
    } as never);

    revalidatePath("/hostel");
    revalidatePath("/hostel/leaves");
    revalidatePath("/warden/dashboard");
  }
  return { error: error?.message };
}

// ── Complaints ────────────────────────────────────────────────────────────────

export async function getHostelComplaints(hostelId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Unauthorized" };

  const { data: profileData } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const profile = profileData as any;

  let q = supabase
    .from("hostel_complaints")
    .select(`*, profiles!hostel_complaints_student_id_fkey(full_name, roll_number, department)`)
    .order("created_at", { ascending: false });

  if (profile?.role === "student") {
    q = q.eq("student_id", user.id);
  } else if (hostelId) {
    q = q.eq("hostel_id", hostelId);
  }

  const { data, error } = await q;
  return { data: (data ?? []) as any[], error: error?.message };
}

export async function createHostelComplaint(input: Record<string, unknown>) {
  const authCheck = await checkHostelAuthorization();
  if (!authCheck.allowed) return { error: authCheck.error };

  const validation = hostelComplaintSchema.safeParse(input);
  if (!validation.success) {
    return { error: (validation.error as any).issues?.[0]?.message || (validation.error as any).errors?.[0]?.message || "Invalid complaint details" };
  }

  const supabase = await createClient();
  const user = authCheck.user!;

  const { data, error } = await supabase
    .from("hostel_complaints")
    .insert({
      student_id: user.id,
      hostel_id: validation.data.hostel_id,
      category: validation.data.category,
      description: validation.data.description,
      priority: validation.data.priority || "medium",
      status: "open",
    } as never)
    .select()
    .single();

  if (!error) {
    revalidatePath("/hostel");
    revalidatePath("/hostel/complaints");
    revalidatePath("/warden/dashboard");
  }
  return { data: data as any, error: error?.message };
}

export async function updateComplaintStatus(complaintId: string, status: string, remarks?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const updates: Record<string, unknown> = { status };
  if (remarks) updates.resolution_remarks = remarks;

  if (status === "resolved" || status === "closed") {
    updates.resolved_by = user.id;
    updates.resolved_at = new Date().toISOString();
  }

  const { data: complaint } = await supabase.from("hostel_complaints").select("student_id, category").eq("id", complaintId).single();

  const { error } = await supabase.from("hostel_complaints").update(updates as never).eq("id", complaintId);

  if (!error && complaint) {
    await supabase.from("notifications").insert({
      user_id: (complaint as any).student_id,
      title: "Hostel Complaint Status Updated",
      message: `Your ${(complaint as any).category} complaint status has been updated to "${status.replace("_", " ")}".`,
      type: "hostel",
    } as never);

    revalidatePath("/hostel");
    revalidatePath("/hostel/complaints");
    revalidatePath("/warden/dashboard");
  }
  return { error: error?.message };
}

// ── Room-Wise Attendance ─────────────────────────────────────────────────────

export async function getRoomWiseAttendanceData(hostelId?: string, roomId?: string, date?: string) {
  const supabase = await createClient();
  const targetDate = date ?? new Date().toISOString().split("T")[0];

  // Fetch occupied beds with student profiles
  let bedsQuery = supabase
    .from("hostel_beds")
    .select(`
      id, bed_number, student_id,
      profiles!hostel_beds_student_id_fkey(id, full_name, roll_number, department),
      hostel_rooms(
        id, room_number,
        hostel_floors(
          floor_number,
          hostel_blocks(
            name,
            hostels(id, name)
          )
        )
      )
    `)
    .eq("status", "occupied");

  if (roomId) {
    bedsQuery = bedsQuery.eq("room_id", roomId);
  }

  const { data: beds, error: bedsErr } = await bedsQuery;
  if (bedsErr) return { data: [], error: bedsErr.message };

  // Fetch attendance records for the target date
  const { data: attRecords } = await supabase
    .from("hostel_attendance")
    .select("*")
    .eq("date", targetDate);

  const attMap = new Map((attRecords ?? []).map((a: any) => [a.student_id, a.status]));

  const result = (beds ?? []).map((b: any) => {
    const student = b.profiles;
    return {
      student_id: student?.id,
      student_name: student?.full_name || "Unknown",
      roll_number: student?.roll_number || "N/A",
      department: student?.department || "N/A",
      bed_number: b.bed_number,
      room_id: b.hostel_rooms?.id,
      room_number: b.hostel_rooms?.room_number || "N/A",
      block_name: b.hostel_rooms?.hostel_floors?.hostel_blocks?.name || "N/A",
      hostel_id: b.hostel_rooms?.hostel_floors?.hostel_blocks?.hostels?.id,
      hostel_name: b.hostel_rooms?.hostel_floors?.hostel_blocks?.hostels?.name || "N/A",
      status: attMap.get(student?.id) || "present",
    };
  });

  return { data: result, targetDate, error: null };
}

export async function markRoomAttendance(
  records: Array<{ student_id: string; hostel_id: string; status: string }>,
  date?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const targetDate = date ?? new Date().toISOString().split("T")[0];

  const payload = records.map((r) => ({
    student_id: r.student_id,
    hostel_id: r.hostel_id,
    date: targetDate,
    status: r.status,
    marked_by: user.id,
  }));

  const { error } = await supabase
    .from("hostel_attendance")
    .upsert(payload as never, { onConflict: "student_id,date" });

  if (!error) {
    revalidatePath("/hostel");
    revalidatePath("/hostel/attendance");
    revalidatePath("/warden/dashboard");
  }
  return { error: error?.message };
}

// ── Fee Management ────────────────────────────────────────────────────────────

export async function getHostelFees(studentId?: string, periodFilter?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Unauthorized" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isStudent = (profile as any)?.role === "student";

  let q = supabase
    .from("hostel_fees")
    .select(`
      *,
      profiles!hostel_fees_student_id_fkey(full_name, roll_number, department),
      hostels(name)
    `)
    .order("due_date", { ascending: false });

  if (isStudent) {
    q = q.eq("student_id", user.id);
  } else if (studentId) {
    q = q.eq("student_id", studentId);
  }

  if (periodFilter && periodFilter !== "all") {
    q = q.eq("period", periodFilter);
  }

  const { data, error } = await q;
  if (error) return { data: [], error: error.message };

  const todayStr = new Date().toISOString().split("T")[0];

  const formattedFees = (data ?? []).map((f: any) => {
    const amount = Number(f.amount) || 0;
    const paidAmount = f.paid ? amount : Number(f.paid_amount) || 0;
    const pendingAmount = Math.max(0, amount - paidAmount);

    let status = "Pending";
    if (paidAmount >= amount && amount > 0) {
      status = "Paid";
    } else if (paidAmount > 0) {
      status = "Partially Paid";
    } else if (f.due_date && f.due_date < todayStr) {
      status = "Overdue";
    } else {
      status = "Pending";
    }

    return {
      ...f,
      amount,
      paid_amount: paidAmount,
      pending_amount: pendingAmount,
      computed_status: status,
      student_name: f.profiles?.full_name || "Unknown",
      roll_number: f.profiles?.roll_number || "N/A",
      hostel_name: f.hostels?.name || "Hostel",
    };
  });

  return { data: formattedFees, error: null };
}

export async function createHostelFeeRecord(input: Record<string, unknown>) {
  const validation = hostelFeeSchema.safeParse(input);
  if (!validation.success) {
    return { error: (validation.error as any).issues?.[0]?.message || (validation.error as any).errors?.[0]?.message || "Invalid fee inputs" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hostel_fees")
    .upsert({
      student_id: validation.data.student_id,
      hostel_id: validation.data.hostel_id,
      period: validation.data.period,
      amount: validation.data.amount,
      paid_amount: validation.data.paid_amount,
      paid: validation.data.paid_amount >= validation.data.amount,
      due_date: validation.data.due_date,
    } as never, { onConflict: "student_id,period" })
    .select()
    .single();

  if (!error) {
    revalidatePath("/hostel");
    revalidatePath("/hostel/fees");
    revalidatePath("/warden/dashboard");
  }
  return { data: data as any, error: error?.message };
}

export async function recordFeePayment(feeId: string, paymentAmount: number) {
  const supabase = await createClient();
  const { data: feeData } = await supabase.from("hostel_fees").select("amount, paid_amount, student_id").eq("id", feeId).single();
  const fee = feeData as any;

  if (!fee) return { error: "Fee record not found" };

  const currentPaid = Number(fee.paid_amount) || 0;
  const newTotalPaid = currentPaid + paymentAmount;
  const totalAmount = Number(fee.amount) || 0;

  if (paymentAmount <= 0) return { error: "Payment amount must be greater than zero." };
  if (newTotalPaid > totalAmount) return { error: `Payment exceeds pending balance (${totalAmount - currentPaid}).` };

  const isFullyPaid = newTotalPaid >= totalAmount;

  const { error } = await supabase
    .from("hostel_fees")
    .update({
      paid_amount: newTotalPaid,
      paid: isFullyPaid,
      paid_at: isFullyPaid ? new Date().toISOString() : null,
    } as never)
    .eq("id", feeId);

  if (!error) {
    await supabase.from("notifications").insert({
      user_id: fee.student_id,
      title: "Hostel Fee Payment Recorded",
      message: `A payment of ₹${paymentAmount} has been recorded. ${isFullyPaid ? "Fee fully paid!" : `Remaining: ₹${totalAmount - newTotalPaid}`}`,
      type: "hostel",
    } as never);

    revalidatePath("/hostel");
    revalidatePath("/hostel/fees");
    revalidatePath("/warden/dashboard");
  }
  return { error: error?.message };
}
