import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seedHostelAndMess() {
  console.log("=== SEEDING HOSTEL & MESS DATA ===");

  // 1. Get warden profile
  const { data: wardenProfile } = await adminClient
    .from("profiles")
    .select("id")
    .eq("role", "hostel_warden")
    .limit(1)
    .single();

  const wardenId = wardenProfile?.id;
  console.log("Warden ID:", wardenId);

  // 2. Get students
  const { data: students } = await adminClient
    .from("profiles")
    .select("id, email, full_name, roll_number")
    .eq("role", "student")
    .order("roll_number");

  console.log(`Found ${students?.length} students.`);

  // 3. Set student_type in auth user metadata
  for (const s of students || []) {
    const isDayScholar = s.email === "student11@smartcampus.com" || s.roll_number === "STU-2026-011";
    const studentType = isDayScholar ? "DAY_SCHOLAR" : "HOSTELLER";

    await adminClient.auth.admin.updateUserById(s.id, {
      user_metadata: { student_type: studentType },
    });
    console.log(`Updated metadata for ${s.email} -> ${studentType}`);
  }

  // 4. Create Hostels
  const hostelsToCreate = [
    { name: "Aryabhata Hostel", type: "male", warden_id: wardenId, address: "North Campus, Gate 2" },
    { name: "Kalam Hostel", type: "female", warden_id: wardenId, address: "South Campus, Gate 4" },
    { name: "Sarabhai Hostel", type: "mixed", warden_id: wardenId, address: "East Campus, Gate 1" },
  ];

  const hostelMap = {};
  for (const h of hostelsToCreate) {
    const { data, error } = await adminClient
      .from("hostels")
      .upsert(h, { onConflict: "name" })
      .select()
      .single();
    if (error) console.error("Error creating hostel:", h.name, error);
    else {
      hostelMap[h.name] = data.id;
      console.log(`Hostel created/found: ${h.name} (${data.id})`);
    }
  }

  // 5. Create Hostel Blocks
  const blocksToCreate = [
    { hostel_id: hostelMap["Aryabhata Hostel"], name: "Block A" },
    { hostel_id: hostelMap["Aryabhata Hostel"], name: "Block B" },
    { hostel_id: hostelMap["Kalam Hostel"], name: "Block A" },
    { hostel_id: hostelMap["Kalam Hostel"], name: "Block B" },
    { hostel_id: hostelMap["Sarabhai Hostel"], name: "Block A" },
  ];

  const blockMap = {};
  for (const b of blocksToCreate) {
    if (!b.hostel_id) continue;
    const { data, error } = await adminClient
      .from("hostel_blocks")
      .upsert(b, { onConflict: "hostel_id,name" })
      .select()
      .single();
    if (error) console.error("Error creating block:", b.name, error);
    else {
      blockMap[`${b.hostel_id}_${b.name}`] = data.id;
    }
  }

  // 6. Create Hostel Floors & Rooms
  const createdRooms = [];
  for (const [key, blockId] of Object.entries(blockMap)) {
    for (let floorNum = 1; floorNum <= 3; floorNum++) {
      const { data: floorData, error: fErr } = await adminClient
        .from("hostel_floors")
        .upsert({ block_id: blockId, floor_number: floorNum }, { onConflict: "block_id,floor_number" })
        .select()
        .single();

      if (fErr || !floorData) continue;

      // Add 2 rooms per floor
      for (let r = 1; r <= 2; r++) {
        const roomNum = `${floorNum}0${r}`;
        const { data: roomData, error: rErr } = await adminClient
          .from("hostel_rooms")
          .upsert(
            {
              floor_id: floorData.id,
              room_number: roomNum,
              capacity: 2,
              type: "shared",
            },
            { onConflict: "floor_id,room_number" }
          )
          .select()
          .single();

        if (!rErr && roomData) {
          createdRooms.push(roomData);
        }
      }
    }
  }
  console.log(`Created/Verified ${createdRooms.length} rooms.`);

  // 7. Create Beds for Rooms
  const createdBeds = [];
  for (const rm of createdRooms) {
    for (const bedLetter of ["A", "B"]) {
      const { data: bedData, error: bErr } = await adminClient
        .from("hostel_beds")
        .upsert(
          {
            room_id: rm.id,
            bed_number: bedLetter,
            status: "available",
          },
          { onConflict: "room_id,bed_number" }
        )
        .select()
        .single();

      if (!bErr && bedData) {
        createdBeds.push(bedData);
      }
    }
  }
  console.log(`Created/Verified ${createdBeds.length} beds.`);

  // 8. Allocate Beds to Hosteller Students (First 10 students)
  const hostellerStudents = (students || []).filter(
    (s) => s.email !== "student11@smartcampus.com" && s.roll_number !== "STU-2026-011"
  );

  for (let i = 0; i < Math.min(hostellerStudents.length, createdBeds.length); i++) {
    const student = hostellerStudents[i];
    const bed = createdBeds[i];

    // Clear any previous allocation for this student
    await adminClient.from("hostel_beds").update({ student_id: null, status: "available" }).eq("student_id", student.id);

    const { error: allocErr } = await adminClient
      .from("hostel_beds")
      .update({
        student_id: student.id,
        status: "occupied",
        allocated_at: new Date().toISOString(),
      })
      .eq("id", bed.id);

    if (!allocErr) {
      console.log(`Allocated Bed ${bed.bed_number} to ${student.full_name} (${student.email})`);
    } else {
      console.error(`Error allocating bed to ${student.email}:`, allocErr);
    }
  }

  // 9. Seed Leave Requests
  if (hostellerStudents.length >= 3 && hostelMap["Aryabhata Hostel"]) {
    const leaves = [
      {
        student_id: hostellerStudents[0].id,
        hostel_id: hostelMap["Aryabhata Hostel"],
        from_date: "2026-08-15",
        to_date: "2026-08-18",
        reason: "Family function in home town",
        status: "pending",
      },
      {
        student_id: hostellerStudents[1].id,
        hostel_id: hostelMap["Aryabhata Hostel"],
        from_date: "2026-08-01",
        to_date: "2026-08-05",
        reason: "Medical leave for health checkup",
        status: "approved",
        warden_id: wardenId,
        warden_remark: "Approved. Submit medical certificate upon return.",
        approved_at: new Date().toISOString(),
      },
      {
        student_id: hostellerStudents[2].id,
        hostel_id: hostelMap["Aryabhata Hostel"],
        from_date: "2026-08-10",
        to_date: "2026-08-12",
        reason: "Personal trip with friends",
        status: "rejected",
        warden_id: wardenId,
        warden_remark: "Rejected due to upcoming mid-term examinations.",
      },
    ];

    for (const l of leaves) {
      await adminClient.from("leave_requests").insert(l);
    }
    console.log("Seeded leave requests.");
  }

  // 10. Seed Hostel Complaints
  if (hostellerStudents.length >= 3 && hostelMap["Aryabhata Hostel"]) {
    const complaints = [
      {
        student_id: hostellerStudents[0].id,
        hostel_id: hostelMap["Aryabhata Hostel"],
        category: "maintenance",
        description: "Water tap in Room 101 bathroom is leaking continuously.",
        status: "open",
        priority: "medium",
      },
      {
        student_id: hostellerStudents[1].id,
        hostel_id: hostelMap["Aryabhata Hostel"],
        category: "cleanliness",
        description: "Corridor trash bin on 1st floor has not been emptied today.",
        status: "in_progress",
        priority: "low",
      },
      {
        student_id: hostellerStudents[2].id,
        hostel_id: hostelMap["Aryabhata Hostel"],
        category: "food",
        description: "Ceiling fan speed controller is broken.",
        status: "resolved",
        priority: "high",
        resolved_by: wardenId,
        resolved_at: new Date().toISOString(),
      },
    ];

    for (const c of complaints) {
      await adminClient.from("hostel_complaints").insert(c);
    }
    console.log("Seeded hostel complaints.");
  }

  // 11. Seed Hostel Fees
  if (hostellerStudents.length >= 4 && hostelMap["Aryabhata Hostel"]) {
    const currentPeriod = "2026-Q3";
    const feeRecords = [
      {
        student_id: hostellerStudents[0].id,
        hostel_id: hostelMap["Aryabhata Hostel"],
        period: currentPeriod,
        amount: 25000,
        paid: true,
        paid_at: "2026-07-01T10:00:00Z",
        due_date: "2026-07-15",
      },
      {
        student_id: hostellerStudents[1].id,
        hostel_id: hostelMap["Aryabhata Hostel"],
        period: currentPeriod,
        amount: 25000,
        paid: false,
        due_date: "2026-08-30",
      },
      {
        student_id: hostellerStudents[2].id,
        hostel_id: hostelMap["Aryabhata Hostel"],
        period: currentPeriod,
        amount: 25000,
        paid: false,
        due_date: "2026-08-01", // Overdue!
      },
      {
        student_id: hostellerStudents[3].id,
        hostel_id: hostelMap["Kalam Hostel"],
        period: currentPeriod,
        amount: 25000,
        paid: false,
        due_date: "2026-08-25",
      },
    ];

    for (const f of feeRecords) {
      await adminClient.from("hostel_fees").upsert(f, { onConflict: "student_id,period" });
    }
    console.log("Seeded hostel fee records.");
  }

  // 12. Seed Hostel Attendance for Today
  const today = new Date().toISOString().split("T")[0];
  if (hostellerStudents.length > 0 && hostelMap["Aryabhata Hostel"]) {
    for (let i = 0; i < hostellerStudents.length; i++) {
      const s = hostellerStudents[i];
      const status = i === 1 ? "on_leave" : i === 2 ? "absent" : "present";
      await adminClient.from("hostel_attendance").upsert(
        {
          student_id: s.id,
          hostel_id: hostelMap["Aryabhata Hostel"],
          date: today,
          status,
          marked_by: wardenId,
        },
        { onConflict: "student_id,date" }
      );
    }
    console.log("Seeded hostel attendance for today.");
  }

  // 13. Seed Mess Menus for Next 7 Days
  const messManagerProfile = (
    await adminClient.from("profiles").select("id").eq("role", "mess_manager").limit(1).single()
  ).data;
  const messManagerId = messManagerProfile?.id;

  const sampleMenus = {
    breakfast: [
      ["Idli", "Sambar", "Coconut Chutney", "Tea / Coffee"],
      ["Masala Dosa", "Sambar", "Mint Chutney", "Tea / Coffee"],
      ["Puri Bhaji", "Kesari Halwa", "Tea / Coffee"],
      ["Aloo Paratha", "Curd", "Pickle", "Tea / Coffee"],
      ["Upma", "Vada", "Chutney", "Tea / Coffee"],
      ["Poha", "Boiled Egg / Banana", "Tea / Coffee"],
      ["Pongal", "Vada", "Sambar", "Tea / Coffee"],
    ],
    lunch: [
      ["Steam Rice", "Dal Tadka", "Paneer Butter Masala", "Roti", "Curd", "Salad"],
      ["Veg Biryani", "Mirchi Ka Salan", "Raita", "Gulab Jamun"],
      ["Jeera Rice", "Dal Makhani", "Mix Veg Sabzi", "Roti", "Curd"],
      ["South Indian Thali", "Sambar", "Rasam", "Kootu", "Rice", "Appalam", "Curd"],
      ["Rajma Chawal", "Bhindhi Fry", "Roti", "Salad", "Curd"],
      ["Lemon Rice", "Potato Masala", "Curd Rice", "Pickle", "Fruit"],
      ["Fried Rice", "Manchurian Gravy", "Spring Roll", "Ice Cream"],
    ],
    snacks: [
      ["Tea / Coffee", "Samosa", "Mint Chutney"],
      ["Tea / Coffee", "Veg Cutlet"],
      ["Tea / Coffee", "Onion Pakoda"],
      ["Tea / Coffee", "Paneer Bread Roll"],
      ["Tea / Coffee", "Biscuits", "Banana"],
      ["Tea / Coffee", "Dhokla"],
      ["Tea / Coffee", "Pav Bhaji"],
    ],
    dinner: [
      ["Chapati", "Paneer Korma", "Rice", "Dal", "Salad"],
      ["Egg Curry / Kadhai Paneer", "Roti", "Rice", "Rasgulla"],
      ["Butter Roti", "Chana Masala", "Veg Pulao", "Curd"],
      ["Phulka", "Aloo Gobi", "Steamed Rice", "Rasam"],
      ["Malai Kofta", "Butter Naan", "Jeera Rice", "Kheer"],
      ["Chapati", "Bhindi Masala", "Rice", "Dal Fry"],
      ["Chicken Curry / Paneer Tikka Gravy", "Roti", "Biryani Rice", "Ice Cream"],
    ],
  };

  const mealTypes = ["breakfast", "lunch", "snacks", "dinner"];
  for (let offset = -3; offset <= 4; offset++) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const dateStr = d.toISOString().split("T")[0];
    const dayIdx = Math.abs((d.getDay() + 7) % 7);

    for (const meal of mealTypes) {
      const items = sampleMenus[meal][dayIdx] || sampleMenus[meal][0];
      await adminClient.from("mess_menus").upsert(
        {
          date: dateStr,
          meal_type: meal,
          items,
          manager_id: messManagerId,
        },
        { onConflict: "date,meal_type" }
      );
    }
  }
  console.log("Seeded weekly mess menus.");

  // 14. Seed Mess Complaints
  if (students && students.length > 0) {
    const messComplaints = [
      {
        student_id: students[0].id,
        category: "quality",
        description: "The Sambar served during breakfast today was cold and lacked salt.",
        status: "open",
      },
      {
        student_id: students[1].id,
        category: "hygiene",
        description: "Dining table 4 was not cleaned properly before lunch.",
        status: "in_progress",
      },
      {
        student_id: students[2].id,
        category: "quantity",
        description: "Evening snacks ran out before 6:00 PM.",
        status: "resolved",
        resolved_by: messManagerId,
        resolved_at: new Date().toISOString(),
      },
    ];

    for (const mc of messComplaints) {
      await adminClient.from("mess_complaints").insert(mc);
    }
    console.log("Seeded mess complaints.");
  }

  // 15. Seed Mess Feedback & Ratings
  if (students && students.length >= 3) {
    const feedbackItems = [
      { student_id: students[0].id, date: today, meal_type: "breakfast", rating: 4, comment: "Dosa was crispy and tasty!" },
      { student_id: students[1].id, date: today, meal_type: "breakfast", rating: 5, comment: "Excellent breakfast combo." },
      { student_id: students[2].id, date: today, meal_type: "breakfast", rating: 2, comment: "Chutney was too spicy." },
      { student_id: students[0].id, date: today, meal_type: "lunch", rating: 4, comment: "Good quality paneer." },
      { student_id: students[1].id, date: today, meal_type: "lunch", rating: 3, comment: "Rice was slightly overcooked." },
    ];

    for (const fb of feedbackItems) {
      await adminClient.from("mess_feedback").upsert(fb, { onConflict: "student_id,date,meal_type" });
    }
    console.log("Seeded mess feedback & ratings.");
  }

  // 16. Seed Mess Attendance
  if (students && students.length > 0) {
    for (let i = 0; i < Math.min(5, students.length); i++) {
      const s = students[i];
      for (const meal of mealTypes) {
        await adminClient.from("mess_attendance").upsert(
          {
            student_id: s.id,
            date: today,
            meal_type: meal,
            present: i !== 2, // 3rd student absent
          },
          { onConflict: "student_id,date,meal_type" }
        );
      }
    }
    console.log("Seeded mess attendance.");
  }

  console.log("=== SEEDING COMPLETED SUCCESSFULLY ===");
}

seedHostelAndMess().catch(console.error);
