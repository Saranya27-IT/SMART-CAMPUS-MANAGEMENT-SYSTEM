"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  busSchema,
  routeSchema,
  stopSchema,
  studentBusAllocationSchema,
  tripStatusUpdateSchema,
  busComplaintSchema,
  adminComplaintUpdateSchema,
} from "@/lib/schemas/bus";

// ── Helper: Auth & Student Type Check ──────────────────────────────────────────

export async function checkBusAuthorization() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false, isHosteller: false, user: null, role: null, message: "Unauthenticated" };
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("id, role, student_type, full_name, email")
    .eq("id", user.id)
    .single();

  const profile = profileData as any;
  const role = profile?.role || user.user_metadata?.role || "student";
  const studentType = profile?.student_type || user.user_metadata?.student_type || "HOSTELLER";

  if (role === "student") {
    if (studentType === "HOSTELLER") {
      return {
        authorized: false,
        isHosteller: true,
        user,
        role,
        studentType,
        profile,
        message: "Bus service is available only for day scholar students.",
      };
    }
    return { authorized: true, isHosteller: false, isDayScholar: true, user, role, studentType, profile };
  }

  if (["super_admin", "bus_driver"].includes(role)) {
    return { authorized: true, isHosteller: false, isDayScholar: false, user, role, studentType, profile };
  }

  return { authorized: false, isHosteller: false, user, role, studentType, profile, message: "Unauthorized role access." };
}

// ── DAY SCHOLAR: Student Bus Overview ────────────────────────────────────────

export async function getStudentBusOverview() {
  const auth = await checkBusAuthorization();
  if (!auth.authorized || auth.isHosteller) {
    return { error: auth.message || "Hostel students are not authorized to access bus services." };
  }

  const supabase = await createClient();
  const studentId = auth.user!.id;

  // Get active student assignment
  const { data: assignment, error: assignErr } = await supabase
    .from("student_bus_assignments")
    .select(`
      id,
      valid_from,
      valid_until,
      route_id,
      stop_id,
      bus_routes (
        id,
        name,
        description,
        is_active
      ),
      bus_stops (
        id,
        name,
        stop_order,
        latitude,
        longitude
      )
    `)
    .eq("student_id", studentId)
    .maybeSingle();

  if (assignErr) {
    return { error: assignErr.message };
  }

  if (!assignment) {
    return { data: null, isAssigned: false };
  }

  const routeId = (assignment as any).route_id || (assignment as any).bus_routes?.id;

  // Fetch active bus details and assigned driver
  let bus: any = null;
  let driver: any = null;

  const { data: busData } = await supabase
    .from("buses")
    .select("id, bus_number, capacity, model, driver_id, is_active")
    .limit(1)
    .maybeSingle();

  if (busData) {
    bus = busData;
    const dId = (busData as any).driver_id;
    if (dId) {
      const { data: driverData } = await supabase
        .from("profiles")
        .select("id, full_name, phone, email")
        .eq("id", dId)
        .maybeSingle();
      driver = driverData;
    }
  }

  // Fetch all stops for assigned route
  let routeStops: any[] = [];
  if (routeId) {
    const { data: stops } = await supabase
      .from("bus_stops")
      .select("*")
      .eq("route_id", routeId)
      .order("stop_order", { ascending: true });

    routeStops = stops || [];
  }

  return {
    isAssigned: true,
    data: {
      assignment,
      bus,
      driver,
      route: (assignment as any).bus_routes,
      assignedStop: (assignment as any).bus_stops,
      allRouteStops: routeStops,
    },
  };
}

// ── Admin & Driver Dashboard Stats ──────────────────────────────────────────

export async function getBusDashboardStats() {
  const supabase = await createClient();

  const [
    { data: busesData },
    { data: driversData },
    { data: routesData },
    { data: stopsData },
    { data: assignmentsData },
    { data: complaintsData },
    { data: tripsData },
  ] = await Promise.all([
    supabase.from("buses").select("*"),
    supabase.from("profiles").select("id, full_name, email").eq("role", "bus_driver"),
    supabase.from("bus_routes").select("*"),
    supabase.from("bus_stops").select("*"),
    supabase.from("student_bus_assignments").select("id, bus_id"),
    supabase.from("bus_complaints").select("*"),
    supabase.from("bus_trips").select("*"),
  ]);

  const buses = (busesData ?? []) as any[];
  const drivers = (driversData ?? []) as any[];
  const routes = (routesData ?? []) as any[];
  const stops = (stopsData ?? []) as any[];
  const assignments = (assignmentsData ?? []) as any[];
  const complaints = (complaintsData ?? []) as any[];
  const trips = (tripsData ?? []) as any[];

  const activeBuses = buses.filter((b) => b.status === "ACTIVE" || b.is_active);
  const inactiveBuses = buses.filter((b) => b.status === "INACTIVE");
  const maintenanceBuses = buses.filter((b) => b.status === "MAINTENANCE");
  const breakdownBuses = buses.filter((b) => b.status === "BREAKDOWN");

  const assignedDriverIds = new Set(buses.map((b) => b.driver_id).filter(Boolean));
  const assignedDriversCount = drivers.filter((d) => assignedDriverIds.has(d.id)).length;
  const unassignedDriversCount = drivers.length - assignedDriversCount;

  const totalCapacity = buses.reduce((acc, b) => acc + (b.capacity || 0), 0);
  const totalAssignedStudents = assignments.length;
  const capacityUtilization = totalCapacity > 0 ? Math.round((totalAssignedStudents / totalCapacity) * 100) : 0;

  const pendingComplaints = complaints.filter((c) => c.status === "PENDING" || c.status === "ACKNOWLEDGED");
  const resolvedComplaints = complaints.filter((c) => c.status === "RESOLVED");

  return {
    totalBuses: buses.length,
    activeBuses: activeBuses.length,
    inactiveBuses: inactiveBuses.length,
    maintenanceBuses: maintenanceBuses.length,
    breakdownBuses: breakdownBuses.length,

    totalDrivers: drivers.length,
    assignedDrivers: assignedDriversCount,
    unassignedDrivers: unassignedDriversCount,

    totalRoutes: routes.length,
    totalStops: stops.length,
    totalAssignedStudents,
    totalCapacity,
    capacityUtilization,

    pendingComplaintsCount: pendingComplaints.length,
    resolvedComplaintsCount: resolvedComplaints.length,
    totalComplaints: complaints.length,

    tripsCount: trips.length,
    rawBuses: buses,
    rawRoutes: routes,
    rawDrivers: drivers,
  };
}

// ── BUS CRUD & DRIVER ALLOCATION ──────────────────────────────────────────────

export async function getBuses() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("buses")
    .select(`
      *,
      driver:profiles!buses_driver_id_fkey (id, full_name, email, phone),
      route:bus_routes!buses_route_id_fkey (id, name, starting_area, destination),
      student_bus_assignments (id)
    `)
    .order("bus_number");

  if (error) return { data: [], error: error.message };

  const formatted = (data || []).map((b: any) => ({
    ...b,
    driver_name: b.driver?.full_name || "Unassigned",
    route_name: b.route?.name || "Unassigned Route",
    assigned_count: b.student_bus_assignments?.length || 0,
  }));

  return { data: formatted, error: null };
}

export async function createBus(formData: any) {
  const auth = await checkBusAuthorization();
  if (auth.role !== "super_admin") return { error: "Only Super Admin can create buses." };

  const validation = busSchema.safeParse(formData);
  if (!validation.success) {
    return { error: (validation.error as any).issues?.[0]?.message || "Invalid bus data." };
  }

  const supabase = await createClient();
  const val = validation.data;

  // Check unique bus_number
  const { data: existingNum } = await supabase.from("buses").select("id").eq("bus_number", val.bus_number).maybeSingle();
  if (existingNum) return { error: "Bus number already exists. Bus numbers must be unique." };

  // Check unique registration_number
  const { data: existingReg } = await supabase.from("buses").select("id").eq("registration_number", val.registration_number).maybeSingle();
  if (existingReg) return { error: "Registration number already exists." };

  const { error } = await (supabase.from("buses") as any).insert({
    bus_number: val.bus_number,
    registration_number: val.registration_number,
    capacity: val.capacity,
    model: val.model || null,
    status: val.status,
    driver_id: val.driver_id || null,
    route_id: val.route_id || null,
    starting_area: val.starting_area || null,
    destination: val.destination || null,
    is_active: val.status === "ACTIVE",
  });

  if (error) return { error: error.message };
  revalidatePath("/bus");
  revalidatePath("/bus/manage");
  return { success: true };
}

export async function updateBus(busId: string, formData: any) {
  const auth = await checkBusAuthorization();
  if (auth.role !== "super_admin") return { error: "Only Super Admin can update buses." };

  const validation = busSchema.safeParse(formData);
  if (!validation.success) {
    return { error: (validation.error as any).issues?.[0]?.message || "Invalid bus data." };
  }

  const supabase = await createClient();
  const val = validation.data;

  // Check unique bus_number excluding current bus
  const { data: existingNum } = await supabase
    .from("buses")
    .select("id")
    .eq("bus_number", val.bus_number)
    .neq("id", busId)
    .maybeSingle();

  if (existingNum) return { error: "Bus number already in use by another bus." };

  const { error } = await (supabase.from("buses") as any)
    .update({
      bus_number: val.bus_number,
      registration_number: val.registration_number,
      capacity: val.capacity,
      model: val.model || null,
      status: val.status,
      driver_id: val.driver_id || null,
      route_id: val.route_id || null,
      starting_area: val.starting_area || null,
      destination: val.destination || null,
      is_active: val.status === "ACTIVE",
    })
    .eq("id", busId);

  if (error) return { error: error.message };
  revalidatePath("/bus");
  revalidatePath("/bus/manage");
  return { success: true };
}

export async function deleteBus(busId: string) {
  const auth = await checkBusAuthorization();
  if (auth.role !== "super_admin") return { error: "Only Super Admin can delete buses." };

  const supabase = await createClient();

  // Check if bus has active student assignments
  const { data: activeAssignments } = await supabase
    .from("student_bus_assignments")
    .select("id")
    .eq("bus_id", busId);

  if (activeAssignments && activeAssignments.length > 0) {
    return { error: `Cannot delete bus because it has ${activeAssignments.length} active student assignments. Please reassign students first.` };
  }

  const { error } = await supabase.from("buses").delete().eq("id", busId);
  if (error) return { error: error.message };

  revalidatePath("/bus");
  revalidatePath("/bus/manage");
  return { success: true };
}

export async function allocateDriver(busId: string, driverId: string | null) {
  const auth = await checkBusAuthorization();
  if (auth.role !== "super_admin") return { error: "Only Super Admin can allocate drivers." };

  const supabase = await createClient();

  if (driverId) {
    // Check if driver is already allocated to another active bus
    const { data: existingBusData } = await supabase
      .from("buses")
      .select("id, bus_number")
      .eq("driver_id", driverId)
      .neq("id", busId)
      .eq("status", "ACTIVE")
      .maybeSingle();

    const existingBus = existingBusData as any;
    if (existingBus) {
      return { error: `This driver is already assigned to active Bus ${existingBus.bus_number}. Reassign or unallocate first.` };
    }
  }

  const { error } = await (supabase.from("buses") as any).update({ driver_id: driverId }).eq("id", busId);
  if (error) return { error: error.message };

  revalidatePath("/bus");
  revalidatePath("/driver/dashboard");
  return { success: true };
}

// ── ROUTE MANAGEMENT ─────────────────────────────────────────────────────────

export async function getRoutes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bus_routes")
    .select(`
      *,
      bus_stops (id, name, sequence_number, stop_order, expected_arrival_time),
      buses (id, bus_number)
    `)
    .order("name");

  if (error) return { data: [], error: error.message };

  const formatted = (data || []).map((r: any) => ({
    ...r,
    stops_count: r.bus_stops?.length || 0,
    buses_count: r.buses?.length || 0,
  }));

  return { data: formatted, error: null };
}

export async function createRoute(formData: any) {
  const auth = await checkBusAuthorization();
  if (auth.role !== "super_admin") return { error: "Only Super Admin can create routes." };

  const validation = routeSchema.safeParse(formData);
  if (!validation.success) {
    return { error: (validation.error as any).issues?.[0]?.message || "Invalid route data." };
  }

  const supabase = await createClient();
  const val = validation.data;

  const { error } = await (supabase.from("bus_routes") as any).insert({
    name: val.name,
    starting_area: val.starting_area,
    destination: val.destination,
    college: val.college || "K.S.R. College",
    description: val.description || null,
    is_active: val.status === "ACTIVE",
    status: val.status,
  });

  if (error) return { error: error.message };
  revalidatePath("/bus/routes");
  return { success: true };
}

export async function updateRoute(routeId: string, formData: any) {
  const auth = await checkBusAuthorization();
  if (auth.role !== "super_admin") return { error: "Only Super Admin can update routes." };

  const validation = routeSchema.safeParse(formData);
  if (!validation.success) {
    return { error: (validation.error as any).issues?.[0]?.message || "Invalid route data." };
  }

  const supabase = await createClient();
  const val = validation.data;

  const { error } = await (supabase.from("bus_routes") as any)
    .update({
      name: val.name,
      starting_area: val.starting_area,
      destination: val.destination,
      college: val.college || "K.S.R. College",
      description: val.description || null,
      is_active: val.status === "ACTIVE",
      status: val.status,
    })
    .eq("id", routeId);

  if (error) return { error: error.message };
  revalidatePath("/bus/routes");
  return { success: true };
}

export async function deleteRoute(routeId: string) {
  const auth = await checkBusAuthorization();
  if (auth.role !== "super_admin") return { error: "Only Super Admin can delete routes." };

  const supabase = await createClient();

  const { data: activeBuses } = await supabase.from("buses").select("id, bus_number").eq("route_id", routeId);
  if (activeBuses && activeBuses.length > 0) {
    return { error: `Cannot delete route because it is assigned to ${activeBuses.length} active bus(es).` };
  }

  const { error } = await supabase.from("bus_routes").delete().eq("id", routeId);
  if (error) return { error: error.message };

  revalidatePath("/bus/routes");
  return { success: true };
}

// ── BUS STOP MANAGEMENT ──────────────────────────────────────────────────────

export async function getStops(routeId?: string) {
  const supabase = await createClient();
  let query = supabase.from("bus_stops").select("*, bus_routes(name)").order("stop_order", { ascending: true });

  if (routeId) {
    query = query.eq("route_id", routeId);
  }

  const { data, error } = await query;
  if (error) return { data: [], error: error.message };
  return { data: data || [], error: null };
}

export async function createStop(formData: any) {
  const auth = await checkBusAuthorization();
  if (auth.role !== "super_admin") return { error: "Only Super Admin can add bus stops." };

  const validation = stopSchema.safeParse(formData);
  if (!validation.success) {
    return { error: (validation.error as any).issues?.[0]?.message || "Invalid stop data." };
  }

  const supabase = await createClient();
  const val = validation.data;

  // Check duplicate sequence within route
  const { data: dupSeq } = await supabase
    .from("bus_stops")
    .select("id")
    .eq("route_id", val.route_id)
    .or(`sequence_number.eq.${val.sequence_number},stop_order.eq.${val.sequence_number}`)
    .maybeSingle();

  if (dupSeq) {
    return { error: `Sequence number ${val.sequence_number} already exists for this route. Please choose a unique sequence number.` };
  }

  const { error } = await (supabase.from("bus_stops") as any).insert({
    route_id: val.route_id,
    name: val.name,
    sequence_number: val.sequence_number,
    stop_order: val.sequence_number,
    expected_arrival_time: val.expected_arrival_time,
    expected_departure_time: val.expected_departure_time || null,
    address: val.address || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/bus/stops");
  return { success: true };
}

export async function updateStop(stopId: string, formData: any) {
  const auth = await checkBusAuthorization();
  if (auth.role !== "super_admin") return { error: "Only Super Admin can update bus stops." };

  const validation = stopSchema.safeParse(formData);
  if (!validation.success) {
    return { error: (validation.error as any).issues?.[0]?.message || "Invalid stop data." };
  }

  const supabase = await createClient();
  const val = validation.data;

  // Check duplicate sequence within route excluding current stop
  const { data: dupSeq } = await supabase
    .from("bus_stops")
    .select("id")
    .eq("route_id", val.route_id)
    .neq("id", stopId)
    .or(`sequence_number.eq.${val.sequence_number},stop_order.eq.${val.sequence_number}`)
    .maybeSingle();

  if (dupSeq) {
    return { error: `Sequence number ${val.sequence_number} is already taken by another stop on this route.` };
  }

  const { error } = await (supabase.from("bus_stops") as any)
    .update({
      name: val.name,
      sequence_number: val.sequence_number,
      stop_order: val.sequence_number,
      expected_arrival_time: val.expected_arrival_time,
      expected_departure_time: val.expected_departure_time || null,
      address: val.address || null,
    })
    .eq("id", stopId);

  if (error) return { error: error.message };
  revalidatePath("/bus/stops");
  return { success: true };
}

export async function deleteStop(stopId: string) {
  const auth = await checkBusAuthorization();
  if (auth.role !== "super_admin") return { error: "Only Super Admin can delete bus stops." };

  const supabase = await createClient();
  const { error } = await supabase.from("bus_stops").delete().eq("id", stopId);
  if (error) return { error: error.message };

  revalidatePath("/bus/stops");
  return { success: true };
}

// ── STUDENT BUS ALLOCATION ───────────────────────────────────────────────────

export async function getStudentAllocations() {
  const supabase = await createClient();

  // Fetch all students (role = 'student')
  const { data: studentsData } = await supabase
    .from("profiles")
    .select("id, full_name, email, roll_number, student_type, is_active")
    .eq("role", "student")
    .order("full_name");

  // Fetch all assignments
  const { data: assignmentsData } = await supabase
    .from("student_bus_assignments")
    .select(`
      id,
      student_id,
      bus_id,
      route_id,
      stop_id,
      created_at,
      buses (id, bus_number, capacity),
      bus_routes (id, name),
      bus_stops (id, name, expected_arrival_time)
    `);

  const { data: busesData } = await supabase.from("buses").select("id, bus_number, capacity, status");
  const { data: routesData } = await supabase.from("bus_routes").select("id, name");

  return {
    students: studentsData || [],
    assignments: assignmentsData || [],
    buses: busesData || [],
    routes: routesData || [],
  };
}

export async function allocateStudentBus(formData: any) {
  const auth = await checkBusAuthorization();
  if (auth.role !== "super_admin") return { error: "Only Super Admin can allocate students to buses." };

  const validation = studentBusAllocationSchema.safeParse(formData);
  if (!validation.success) {
    return { error: (validation.error as any).issues?.[0]?.message || "Invalid student allocation data." };
  }

  const supabase = await createClient();
  const val = validation.data;

  // 1. Verify student exists and is DAY_SCHOLAR
  const { data: studentData } = await supabase
    .from("profiles")
    .select("id, role, student_type, full_name, is_active")
    .eq("id", val.student_id)
    .single();

  const student = studentData as any;
  if (!student) return { error: "Student record not found." };
  if (!student.is_active) return { error: "Cannot assign an inactive student." };

  const sType = student.student_type || "HOSTELLER";
  if (sType === "HOSTELLER") {
    return { error: "❌ REJECTED: Bus service is available only for DAY_SCHOLAR students. Hostel students cannot be allocated a bus." };
  }

  // 2. Verify bus exists and is ACTIVE
  const { data: busData } = await supabase
    .from("buses")
    .select("id, bus_number, capacity, status")
    .eq("id", val.bus_id)
    .single();

  const bus = busData as any;
  if (!bus) return { error: "Target bus not found." };
  if (bus.status !== "ACTIVE") return { error: `Bus ${bus.bus_number} is currently ${bus.status}. Only ACTIVE buses can receive allocations.` };

  // 3. CAPACITY CHECK: Verify current assigned count < capacity
  const { count: currentAssignedCount } = await supabase
    .from("student_bus_assignments")
    .select("id", { count: "exact", head: true })
    .eq("bus_id", val.bus_id);

  const assignedCount = currentAssignedCount || 0;
  if (assignedCount >= bus.capacity) {
    return { error: `❌ CAPACITY FULL: Bus ${bus.bus_number} has reached its full capacity (${bus.capacity}/${bus.capacity}). Cannot assign more students.` };
  }

  // 4. Verify student does not already have an active assignment
  const { data: existingAss } = await supabase
    .from("student_bus_assignments")
    .select("id, bus_id, buses(bus_number)")
    .eq("student_id", val.student_id)
    .maybeSingle();

  if (existingAss && (existingAss as any).bus_id !== val.bus_id) {
    return { error: `Student is already assigned to Bus ${(existingAss as any).buses?.bus_number || "another bus"}. Please deallocate first.` };
  }

  // Insert or update assignment
  const { error } = await (supabase.from("student_bus_assignments") as any).upsert(
    {
      student_id: val.student_id,
      bus_id: val.bus_id,
      route_id: val.route_id,
      stop_id: val.stop_id || null,
      valid_from: new Date().toISOString().split("T")[0],
    },
    { onConflict: "student_id" }
  );

  if (error) return { error: error.message };

  revalidatePath("/bus/allocations");
  revalidatePath("/bus");
  return { success: true };
}

export async function deallocateStudentBus(studentId: string) {
  const auth = await checkBusAuthorization();
  if (auth.role !== "super_admin") return { error: "Only Super Admin can deallocate students." };

  const supabase = await createClient();
  const { error } = await supabase.from("student_bus_assignments").delete().eq("student_id", studentId);
  if (error) return { error: error.message };

  revalidatePath("/bus/allocations");
  revalidatePath("/bus");
  return { success: true };
}

// ── DRIVER OPERATIONS & TRIP STATUS UPDATES ──────────────────────────────────

export async function getDriverAssignedBus() {
  const auth = await checkBusAuthorization();
  if (!auth.user || auth.role !== "bus_driver") {
    return { error: "Only assigned bus drivers can access this dashboard." };
  }

  const supabase = await createClient();
  const driverId = auth.user.id;

  const { data: busData } = await supabase
    .from("buses")
    .select(`
      *,
      route:bus_routes!buses_route_id_fkey (*),
      student_bus_assignments (id)
    `)
    .eq("driver_id", driverId)
    .maybeSingle();

  const bus = busData as any;
  if (!bus) {
    return { bus: null, route: null, stops: [], activeTrip: null };
  }

  let stops: any[] = [];
  if (bus.route_id) {
    const { data: s } = await supabase.from("bus_stops").select("*").eq("route_id", bus.route_id).order("stop_order");
    stops = s || [];
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const { data: activeTrip } = await supabase
    .from("bus_trips")
    .select("*")
    .eq("driver_id", driverId)
    .eq("trip_date", todayStr)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    bus: { ...bus, assigned_count: bus.student_bus_assignments?.length || 0 },
    route: bus.route || bus.bus_routes,
    stops,
    activeTrip,
  };
}

export async function updateTripStatus(tripId: string | null, busId: string, routeId: string, status: string, notes?: string) {
  const auth = await checkBusAuthorization();
  if (!["bus_driver", "super_admin"].includes(auth.role || "")) {
    return { error: "Unauthorized trip status update." };
  }

  const supabase = await createClient();
  const driverId = auth.user!.id;
  const todayStr = new Date().toISOString().split("T")[0];

  if (tripId) {
    const { error } = await (supabase.from("bus_trips") as any)
      .update({
        status,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tripId);

    if (error) return { error: error.message };
  } else {
    const { error } = await (supabase.from("bus_trips") as any).insert({
      bus_id: busId,
      route_id: routeId,
      driver_id: driverId,
      trip_date: todayStr,
      trip_type: "morning",
      status,
      notes: notes || null,
    });

    if (error) return { error: error.message };
  }

  revalidatePath("/driver/dashboard");
  revalidatePath("/bus/trips");
  return { success: true };
}

// ── DRIVER BUS COMPLAINTS ───────────────────────────────────────────────────

export async function createBusComplaint(formData: any) {
  const auth = await checkBusAuthorization();
  if (!["bus_driver", "super_admin"].includes(auth.role || "")) {
    return { error: "Only drivers and super admin can raise bus complaints." };
  }

  const validation = busComplaintSchema.safeParse(formData);
  if (!validation.success) {
    return { error: (validation.error as any).issues?.[0]?.message || "Invalid complaint data." };
  }

  const supabase = await createClient();
  const val = validation.data;

  const { error } = await (supabase.from("bus_complaints") as any).insert({
    bus_id: val.bus_id,
    driver_id: auth.user!.id,
    category: val.category,
    title: val.title,
    description: val.description,
    status: "PENDING",
  });

  if (error) return { error: error.message };

  revalidatePath("/driver/dashboard");
  revalidatePath("/bus/complaints");
  return { success: true };
}

export async function getBusComplaints() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bus_complaints")
    .select(`
      *,
      bus:buses!bus_complaints_bus_id_fkey (bus_number, registration_number, model),
      driver:profiles!bus_complaints_driver_id_fkey (full_name, email, phone)
    `)
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: data || [], error: null };
}

export async function updateBusComplaintStatus(formData: any) {
  const auth = await checkBusAuthorization();
  if (auth.role !== "super_admin") return { error: "Only Super Admin can update complaint status." };

  const validation = adminComplaintUpdateSchema.safeParse(formData);
  if (!validation.success) {
    return { error: (validation.error as any).issues?.[0]?.message || "Invalid status update data." };
  }

  const supabase = await createClient();
  const val = validation.data;

  const { error } = await (supabase.from("bus_complaints") as any)
    .update({
      status: val.status,
      admin_remarks: val.admin_remarks || null,
      resolved_by: auth.user!.id,
      resolved_at: val.status === "RESOLVED" ? new Date().toISOString() : null,
    })
    .eq("id", val.complaint_id);

  if (error) return { error: error.message };

  revalidatePath("/bus/complaints");
  return { success: true };
}

// ── BUS DATA EXPORT ──────────────────────────────────────────────────────────

export async function getBusExportData(exportType: string, filter?: string) {
  const auth = await checkBusAuthorization();
  if (auth.role !== "super_admin") return { error: "Only Super Admin can export bus data." };

  const supabase = await createClient();

  if (exportType === "buses") {
    const { data } = await supabase
      .from("buses")
      .select("bus_number, registration_number, capacity, status, starting_area, destination, model");
    return { data: data || [] };
  }

  if (exportType === "routes") {
    const { data } = await supabase
      .from("bus_routes")
      .select("name, starting_area, destination, college, status, description");
    return { data: data || [] };
  }

  if (exportType === "stops") {
    const { data } = await supabase
      .from("bus_stops")
      .select("name, sequence_number, expected_arrival_time, expected_departure_time, address, bus_routes(name)");
    return { data: data || [] };
  }

  if (exportType === "allocations") {
    const { data } = await supabase
      .from("student_bus_assignments")
      .select("created_at, profiles(full_name, roll_number, email, student_type), buses(bus_number), bus_routes(name)");
    return { data: data || [] };
  }

  if (exportType === "complaints") {
    const { data } = await supabase
      .from("bus_complaints")
      .select("category, title, description, status, admin_remarks, created_at, buses(bus_number), profiles(full_name)");
    return { data: data || [] };
  }

  return { data: [] };
}
