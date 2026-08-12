import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase environment variables in .env.local");
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seedBusModule() {
  console.log("==================================================");
  console.log("🚀 STARTING REAL BUS MANAGEMENT MODULE DATA SEEDING");
  console.log("==================================================");

  // 1. Fetch driver profiles
  const { data: drivers } = await adminClient
    .from("profiles")
    .select("id, full_name, email, phone")
    .eq("role", "bus_driver");

  const driver1 = drivers?.[0];
  const driver2 = drivers?.[1] || driver1;
  console.log(`Found ${drivers?.length || 0} Bus Drivers. Primary Driver: ${driver1?.full_name || 'N/A'}`);

  // 2. Fetch students and set student_type = DAY_SCHOLAR for test accounts
  const { data: students } = await adminClient
    .from("profiles")
    .select("id, email, full_name, roll_number")
    .eq("role", "student")
    .order("roll_number");

  const dayScholarEmails = ["student11@smartcampus.com", "student12@smartcampus.com", "student13@smartcampus.com"];

  for (const s of students || []) {
    const isDayScholar = dayScholarEmails.includes(s.email) || s.roll_number === "STU-2026-011" || s.roll_number === "STU-2026-012" || s.roll_number === "STU-2026-013";
    const studentType = isDayScholar ? "DAY_SCHOLAR" : "HOSTELLER";

    // Update Auth user_metadata
    await adminClient.auth.admin.updateUserById(s.id, {
      user_metadata: { student_type: studentType },
    });

    // Update Profiles table
    await adminClient
      .from("profiles")
      .update({ student_type: studentType })
      .eq("id", s.id);

    if (isDayScholar) {
      console.log(`✓ Set ${s.email} (${s.full_name}) -> DAY_SCHOLAR`);
    }
  }

  // 3. Seed Routes safely
  const routesToInsert = [
    {
      name: "Salem - College Express",
      starting_area: "Salem New Bus Stand",
      destination: "K.S.R. College Main Campus",
      college: "K.S.R. College",
      description: "Daily morning pickup & evening shuttle connecting Salem Junction & New Bus Stand to KSR Campus.",
      is_active: true,
      status: "ACTIVE",
    },
    {
      name: "Erode - Central Shuttle",
      starting_area: "Erode Bus Terminal",
      destination: "K.S.R. College Main Campus",
      college: "K.S.R. College",
      description: "Express connectivity covering Erode Bus Stand, Chithode, and Bhavani Sangameshwarar Corner.",
      is_active: true,
      status: "ACTIVE",
    },
    {
      name: "Namakkal - Tiruchengode Route",
      starting_area: "Namakkal Park Road",
      destination: "K.S.R. College Main Campus",
      college: "K.S.R. College",
      description: "Covers Namakkal Town, Velur Bypass, and Tiruchengode main stops.",
      is_active: true,
      status: "ACTIVE",
    },
    {
      name: "Trichy - Karur Express",
      starting_area: "Trichy Central Bus Stand",
      destination: "K.S.R. College Main Campus",
      college: "K.S.R. College",
      description: "Inter-city route linking Trichy, Karur Bypass, and Velur to KSR Campus.",
      is_active: true,
      status: "ACTIVE",
    },
  ];

  const seededRoutes = [];
  for (const r of routesToInsert) {
    let { data: existing } = await adminClient
      .from("bus_routes")
      .select("*")
      .eq("name", r.name)
      .maybeSingle();

    if (!existing) {
      const { data: inserted, error } = await adminClient
        .from("bus_routes")
        .insert(r)
        .select()
        .single();
      if (error) console.error("Error inserting route:", r.name, error.message);
      else existing = inserted;
    } else {
      const { data: updated } = await adminClient
        .from("bus_routes")
        .update(r)
        .eq("id", existing.id)
        .select()
        .single();
      if (updated) existing = updated;
    }
    if (existing) seededRoutes.push(existing);
  }

  console.log(`✓ Seeded ${seededRoutes.length} real bus routes.`);

  const routeSalem = seededRoutes.find((r) => r.name.includes("Salem")) || seededRoutes[0];
  const routeErode = seededRoutes.find((r) => r.name.includes("Erode")) || seededRoutes[1];
  const routeNamakkal = seededRoutes.find((r) => r.name.includes("Namakkal")) || seededRoutes[2];

  // 4. Seed Bus Stops
  const salemStops = [
    { name: "Salem New Bus Stand", stop_order: 1, sequence_number: 1, expected_arrival_time: "07:00 AM", expected_departure_time: "07:05 AM", address: "Platform 4, Salem New Bus Stand" },
    { name: "Kondalampatti Bypass", stop_order: 2, sequence_number: 2, expected_arrival_time: "07:18 AM", expected_departure_time: "07:20 AM", address: "Kondalampatti Flyover Junction" },
    { name: "Sankari Main Stop", stop_order: 3, sequence_number: 3, expected_arrival_time: "07:40 AM", expected_departure_time: "07:42 AM", address: "Sankari Bus Stand Corner" },
    { name: "College Main Gate", stop_order: 4, sequence_number: 4, expected_arrival_time: "08:05 AM", expected_departure_time: "08:10 AM", address: "K.S.R. Campus Gate 1" },
  ];

  const erodeStops = [
    { name: "Erode Central Bus Stand", stop_order: 1, sequence_number: 1, expected_arrival_time: "07:10 AM", expected_departure_time: "07:15 AM", address: "Bay 2, Erode Terminal" },
    { name: "Chithode Junction", stop_order: 2, sequence_number: 2, expected_arrival_time: "07:25 AM", expected_departure_time: "07:27 AM", address: "Chithode Highway Circle" },
    { name: "Bhavani Sangam Corner", stop_order: 3, sequence_number: 3, expected_arrival_time: "07:40 AM", expected_departure_time: "07:42 AM", address: "Bhavani Sangameshwarar Stop" },
    { name: "College Main Gate", stop_order: 4, sequence_number: 4, expected_arrival_time: "08:05 AM", expected_departure_time: "08:10 AM", address: "K.S.R. Campus Gate 1" },
  ];

  const namakkalStops = [
    { name: "Namakkal Park Road", stop_order: 1, sequence_number: 1, expected_arrival_time: "06:50 AM", expected_departure_time: "06:55 AM", address: "Park Road Bus Shelter" },
    { name: "Velur Bus Stop", stop_order: 2, sequence_number: 2, expected_arrival_time: "07:15 AM", expected_departure_time: "07:17 AM", address: "Velur Main Road" },
    { name: "Tiruchengode Bus Stand", stop_order: 3, sequence_number: 3, expected_arrival_time: "07:40 AM", expected_departure_time: "07:45 AM", address: "Tiruchengode Central Stop" },
    { name: "College Main Gate", stop_order: 4, sequence_number: 4, expected_arrival_time: "08:05 AM", expected_departure_time: "08:10 AM", address: "K.S.R. Campus Gate 1" },
  ];

  async function seedStopsForRoute(routeObj, stopsList) {
    if (!routeObj) return [];
    const seeded = [];
    for (const stop of stopsList) {
      let { data: existing } = await adminClient
        .from("bus_stops")
        .select("*")
        .eq("route_id", routeObj.id)
        .eq("stop_order", stop.stop_order)
        .maybeSingle();

      const payload = { ...stop, route_id: routeObj.id };
      if (!existing) {
        const { data: ins } = await adminClient.from("bus_stops").insert(payload).select().single();
        if (ins) seeded.push(ins);
      } else {
        const { data: upd } = await adminClient.from("bus_stops").update(payload).eq("id", existing.id).select().single();
        if (upd) seeded.push(upd);
      }
    }
    return seeded;
  }

  const salemSeededStops = await seedStopsForRoute(routeSalem, salemStops);
  const erodeSeededStops = await seedStopsForRoute(routeErode, erodeStops);
  await seedStopsForRoute(routeNamakkal, namakkalStops);

  console.log(`✓ Seeded ${salemSeededStops.length + erodeSeededStops.length} bus stops.`);

  // 5. Seed Buses safely
  const busesToInsert = [
    {
      bus_number: "BUS-12",
      registration_number: "TN-30-AZ-1234",
      capacity: 50,
      model: "Tata Starbus Ultra 2024",
      driver_id: driver1?.id || null,
      route_id: routeSalem?.id || null,
      starting_area: "Salem New Bus Stand",
      destination: "K.S.R. College Main Campus",
      status: "ACTIVE",
      is_active: true,
    },
    {
      bus_number: "BUS-14",
      registration_number: "TN-33-BB-5678",
      capacity: 45,
      model: "Ashok Leyland Viking",
      driver_id: driver2?.id || null,
      route_id: routeErode?.id || null,
      starting_area: "Erode Bus Terminal",
      destination: "K.S.R. College Main Campus",
      status: "ACTIVE",
      is_active: true,
    },
    {
      bus_number: "BUS-08",
      registration_number: "TN-28-CC-9900",
      capacity: 40,
      model: "Eicher Skyline 2023",
      driver_id: null,
      route_id: routeNamakkal?.id || null,
      starting_area: "Namakkal Park Road",
      destination: "K.S.R. College Main Campus",
      status: "ACTIVE",
      is_active: true,
    },
    {
      bus_number: "BUS-22",
      registration_number: "TN-45-DD-1122",
      capacity: 55,
      model: "Volvo Eicher Campus Special",
      driver_id: null,
      route_id: null,
      starting_area: "Trichy Central Bus Stand",
      destination: "K.S.R. College Main Campus",
      status: "MAINTENANCE",
      is_active: false,
    },
  ];

  const seededBuses = [];
  for (const b of busesToInsert) {
    let { data: existing } = await adminClient
      .from("buses")
      .select("*")
      .eq("bus_number", b.bus_number)
      .maybeSingle();

    if (!existing) {
      const { data: ins } = await adminClient.from("buses").insert(b).select().single();
      if (ins) seededBuses.push(ins);
    } else {
      const { data: upd } = await adminClient.from("buses").update(b).eq("id", existing.id).select().single();
      if (upd) seededBuses.push(upd);
    }
  }

  console.log(`✓ Seeded ${seededBuses.length} real buses.`);

  const bus12 = seededBuses.find((b) => b.bus_number === "BUS-12") || seededBuses[0];
  const bus14 = seededBuses.find((b) => b.bus_number === "BUS-14") || seededBuses[1];

  // 6. Seed Student Bus Assignments for DAY_SCHOLAR accounts
  const dayScholar11 = students?.find((s) => s.email === "student11@smartcampus.com");
  const dayScholar12 = students?.find((s) => s.email === "student12@smartcampus.com");
  const dayScholar13 = students?.find((s) => s.email === "student13@smartcampus.com");

  const todayStr = new Date().toISOString().split("T")[0];

  if (dayScholar11 && bus12 && routeSalem) {
    const stop1 = salemSeededStops[0] || null;
    await adminClient.from("student_bus_assignments").upsert(
      {
        student_id: dayScholar11.id,
        bus_id: bus12.id,
        route_id: routeSalem.id,
        stop_id: stop1?.id || null,
        valid_from: todayStr,
      },
      { onConflict: "student_id" }
    );
    console.log(`✓ Assigned Day Scholar ${dayScholar11.email} (Karan) -> ${bus12.bus_number} (${routeSalem.name})`);
  }

  if (dayScholar12 && bus14 && routeErode) {
    const stop1 = erodeSeededStops[0] || null;
    await adminClient.from("student_bus_assignments").upsert(
      {
        student_id: dayScholar12.id,
        bus_id: bus14.id,
        route_id: routeErode.id,
        stop_id: stop1?.id || null,
        valid_from: todayStr,
      },
      { onConflict: "student_id" }
    );
    console.log(`✓ Assigned Day Scholar ${dayScholar12.email} -> ${bus14.bus_number} (${routeErode.name})`);
  }

  // 7. Seed Bus Trips
  if (bus12 && routeSalem && driver1) {
    const { data: existingTrip } = await adminClient
      .from("bus_trips")
      .select("id")
      .eq("bus_id", bus12.id)
      .eq("trip_date", todayStr)
      .maybeSingle();

    if (!existingTrip) {
      await adminClient.from("bus_trips").insert({
        bus_id: bus12.id,
        route_id: routeSalem.id,
        driver_id: driver1.id,
        trip_date: todayStr,
        trip_type: "morning",
        status: "in_progress",
        notes: "Morning shuttle pickup in progress from Salem New Bus Stand.",
      });
      console.log("✓ Seeded today's active morning bus trip.");
    }
  }

  // 8. Seed Bus Complaints
  if (bus12 && driver1) {
    const { data: existingComp } = await adminClient
      .from("bus_complaints")
      .select("id")
      .eq("bus_id", bus12.id)
      .eq("title", "Minor Engine Overheating Issue")
      .maybeSingle();

    if (!existingComp) {
      await adminClient.from("bus_complaints").insert({
        bus_id: bus12.id,
        driver_id: driver1.id,
        category: "Breakdown",
        title: "Minor Engine Overheating Issue",
        description: "Engine temperature gauge rose near Kondalampatti stop. Requires coolant check.",
        status: "PENDING",
      });
      console.log("✓ Seeded driver breakdown complaint for BUS-12.");
    }
  }

  console.log("==================================================");
  console.log("🎉 BUS MANAGEMENT MODULE SEEDING COMPLETE!");
  console.log("==================================================");
}

seedBusModule().catch((err) => {
  console.error("❌ Error seeding bus module:", err);
  process.exit(1);
});
