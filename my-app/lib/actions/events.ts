"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ── Events CRUD ───────────────────────────────────────────────────────────────

export async function getEvents(status?: string) {
  const supabase = await createClient();
  let q = supabase
    .from("events")
    .select(`*, event_categories(name, color), event_halls(name, location, capacity), profiles!events_organizer_id_fkey(full_name)`)
    .order("start_time", { ascending: false });

  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  return { data: (data ?? []) as any[], error };
}

export async function getEvent(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(`*, event_categories(name, color), event_halls(name, location, capacity), profiles!events_organizer_id_fkey(full_name, email)`)
    .eq("id", id)
    .single();
  return { data: data as any, error };
}

export async function createEvent(input: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("events")
    .insert({ ...input, organizer_id: user.id } as never)
    .select()
    .single();

  const created = data as any;
  if (!error && created) {
    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      action: "CREATE_EVENT",
      entity_type: "events",
      entity_id: created.id,
      metadata: { title: input.title },
    } as never);
    revalidatePath("/events");
    revalidatePath("/events/manage");
  }
  return { data: created, error: error?.message };
}

export async function updateEvent(id: string, input: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase.from("events").update(input as never).eq("id", id).select().single();
  if (!error) {
    revalidatePath("/events");
    revalidatePath("/events/manage");
    revalidatePath(`/events/${id}`);
  }
  return { data: data as any, error: error?.message };
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("events").delete().eq("id", id);
  if (!error) {
    revalidatePath("/events");
    revalidatePath("/events/manage");
  }
  return { error: error?.message };
}

// ── Registration ─────────────────────────────────────────────────────────────

export async function registerForEvent(eventId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Check capacity
  const { data: eventData } = await supabase
    .from("events")
    .select("capacity, title, registration_deadline, allow_faculty, status")
    .eq("id", eventId)
    .single();
  const event = eventData as any;
  if (!event) return { error: "Event not found." };
  if (event.status === "completed" || event.status === "cancelled") {
    return { error: "Registration is closed for this event." };
  }

  // Check deadline
  if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) {
    return { error: "Registration deadline has passed." };
  }

  // Check capacity
  const { count: registrations } = await supabase
    .from("event_registrations")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId);

  if ((registrations ?? 0) >= event.capacity) {
    return { error: "Event is at full capacity." };
  }

  const { data, error } = await supabase
    .from("event_registrations")
    .insert({ event_id: eventId, user_id: user.id } as never)
    .select()
    .single();

  if (!error) {
    await supabase.from("notifications").insert({
      user_id: user.id,
      title: "Event Registration Successful",
      message: `You are registered for "${event.title}". Keep your QR code ready for check-in.`,
      type: "event",
    } as never);
    revalidatePath("/events");
    revalidatePath(`/events/${eventId}`);
  }
  return { data: data as any, error: error?.message };
}

export async function unregisterFromEvent(eventId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("event_registrations")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", user.id);

  if (!error) {
    revalidatePath("/events");
    revalidatePath(`/events/${eventId}`);
  }
  return { error: error?.message };
}

export async function getMyRegistration(eventId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null };

  const { data } = await supabase
    .from("event_registrations")
    .select("*")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();
  return { data: data as any };
}

// ── QR Check-in ──────────────────────────────────────────────────────────────

export async function checkInWithQR(eventId: string, qrCode: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: regData } = await supabase
    .from("event_registrations")
    .select(`*, profiles!event_registrations_user_id_fkey(full_name, email, roll_number, role)`)
    .eq("event_id", eventId)
    .eq("qr_code", qrCode)
    .single();

  const reg = regData as any;
  if (!reg) return { error: "Invalid QR code or participant not registered for this event." };
  if (reg.attended) return { error: "This participant has already been checked in.", alreadyCheckedIn: true, reg };

  const { error } = await supabase
    .from("event_registrations")
    .update({ attended: true, attended_at: new Date().toISOString() } as never)
    .eq("id", reg.id);

  if (!error) {
    await supabase.from("notifications").insert({
      user_id: reg.user_id,
      title: "Event Check-in Successful",
      message: "You have been successfully checked in to the event. Enjoy!",
      type: "event",
    } as never);
    revalidatePath(`/events/${eventId}`);
  }
  return { data: reg, error: error?.message };
}

export async function getEventRegistrations(eventId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_registrations")
    .select(`*, profiles!event_registrations_user_id_fkey(full_name, email, roll_number, role)`)
    .eq("event_id", eventId)
    .order("registered_at", { ascending: false });
  return { data: (data ?? []) as any[], error };
}

// ── Event Categories ──────────────────────────────────────────────────────────

export async function getEventCategories() {
  const supabase = await createClient();
  const { data } = await supabase.from("event_categories").select("*").order("name");
  return (data ?? []) as any[];
}

// ── Event Halls ───────────────────────────────────────────────────────────────

export async function getHalls() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_halls")
    .select("*")
    .order("name");
  return { data: (data ?? []) as any[], error };
}

export async function createHall(input: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("event_halls")
    .insert(input as never)
    .select()
    .single();

  if (!error) {
    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      action: "CREATE_HALL",
      entity_type: "event_halls",
      entity_id: (data as any)?.id,
      metadata: { name: input.name },
    } as never);
    revalidatePath("/admin/halls");
  }
  return { data: data as any, error: error?.message };
}

export async function updateHall(id: string, input: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("event_halls")
    .update(input as never)
    .eq("id", id)
    .select()
    .single();

  if (!error) revalidatePath("/admin/halls");
  return { data: data as any, error: error?.message };
}

export async function deleteHall(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("event_halls").delete().eq("id", id);
  if (!error) revalidatePath("/admin/halls");
  return { error: error?.message };
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export async function getEventStats() {
  const supabase = await createClient();

  const [
    { count: totalEvents },
    { count: upcomingEvents },
    { count: ongoingEvents },
    { count: completedEvents },
    { count: totalRegistrations },
    { count: totalAttended },
    { data: byCategory },
    { data: topEvents },
  ] = await Promise.all([
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "upcoming"),
    supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "ongoing"),
    supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("event_registrations").select("*", { count: "exact", head: true }),
    supabase.from("event_registrations").select("*", { count: "exact", head: true }).eq("attended", true),
    supabase.from("events").select("event_categories(name, color)"),
    supabase
      .from("events")
      .select(`id, title, status, start_time, event_registrations(count)`)
      .order("start_time", { ascending: false })
      .limit(5),
  ]);

  const attendanceRate = (totalRegistrations ?? 0) > 0
    ? Math.round(((totalAttended ?? 0) / (totalRegistrations ?? 1)) * 100)
    : 0;

  // Aggregate category counts
  const catMap: Record<string, { name: string; color: string; count: number }> = {};
  ((byCategory ?? []) as any[]).forEach((e) => {
    const cat = e.event_categories;
    if (cat) {
      const key = cat.name;
      if (!catMap[key]) catMap[key] = { name: cat.name, color: cat.color, count: 0 };
      catMap[key].count++;
    }
  });

  return {
    totalEvents: totalEvents ?? 0,
    upcomingEvents: upcomingEvents ?? 0,
    ongoingEvents: ongoingEvents ?? 0,
    completedEvents: completedEvents ?? 0,
    totalRegistrations: totalRegistrations ?? 0,
    totalAttended: totalAttended ?? 0,
    attendanceRate,
    categoryBreakdown: Object.values(catMap),
    topEvents: (topEvents ?? []) as any[],
  };
}

// ── Certificates ──────────────────────────────────────────────────────────────

export async function issueCertificate(registrationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("event_registrations")
    .update({ certificate_issued: true } as never)
    .eq("id", registrationId)
    .select()
    .single();

  return { data: data as any, error: error?.message };
}
