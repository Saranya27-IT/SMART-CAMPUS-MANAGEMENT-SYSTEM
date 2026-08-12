import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceRoleKey || !anonKey) {
  console.error("Missing Supabase environment variables in .env.local");
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const anonClient = createClient(supabaseUrl, anonKey);

// ============================================================================
// 1. ALL TEST USERS SPECIFICATION
// ============================================================================

const SEED_USERS = [
  // --- PRIMARY EXISTING USERS ---
  {
    role: "super_admin",
    roleDisplay: "SUPER_ADMIN",
    email: "admin@smartcampus.com",
    password: "Admin@12345",
    full_name: "System Admin",
    employee_id: "EMP-001",
    department: "IT Services",
    expectedRedirect: "/admin/dashboard",
    isPrimary: true,
  },
  {
    role: "student",
    roleDisplay: "STUDENT",
    email: "student@smartcampus.com",
    password: "Student@12345",
    full_name: "Alex Student",
    roll_number: "STU-2026-001",
    department: "Computer Science",
    expectedRedirect: "/dashboard",
    isPrimary: true,
  },
  {
    role: "faculty",
    roleDisplay: "FACULTY",
    email: "faculty@smartcampus.com",
    password: "Faculty@12345",
    full_name: "Prof. Sarah Connor",
    employee_id: "EMP-101",
    department: "Computer Science",
    expectedRedirect: "/faculty/dashboard",
    isPrimary: true,
  },
  {
    role: "librarian",
    roleDisplay: "LIBRARIAN",
    email: "librarian@smartcampus.com",
    password: "Librarian@12345",
    full_name: "Laura Librarian",
    employee_id: "EMP-201",
    department: "Central Library",
    expectedRedirect: "/librarian/dashboard",
    isPrimary: true,
  },
  {
    role: "event_organizer",
    roleDisplay: "EVENT_ORGANIZER",
    email: "organizer@smartcampus.com",
    password: "Organizer@12345",
    full_name: "Ethan Organizer",
    employee_id: "EMP-301",
    department: "Student Affairs",
    expectedRedirect: "/event-organizer/dashboard",
    isPrimary: true,
  },
  {
    role: "bus_driver",
    roleDisplay: "BUS_DRIVER",
    email: "driver@smartcampus.com",
    password: "Driver@12345",
    full_name: "David Driver",
    employee_id: "EMP-401",
    department: "Transport Services",
    expectedRedirect: "/driver/dashboard",
    isPrimary: true,
  },
  {
    role: "hostel_warden",
    roleDisplay: "HOSTEL_WARDEN",
    email: "warden@smartcampus.com",
    password: "Warden@12345",
    full_name: "Henry Warden",
    employee_id: "EMP-501",
    department: "Hostel Administration",
    expectedRedirect: "/warden/dashboard",
    isPrimary: true,
  },
  {
    role: "mess_manager",
    roleDisplay: "MESS_MANAGER",
    email: "mess@smartcampus.com",
    password: "Mess@12345",
    full_name: "Marcus Mess",
    employee_id: "EMP-601",
    department: "Dining & Catering",
    expectedRedirect: "/mess-manager/dashboard",
    isPrimary: true,
  },

  // --- ADDITIONAL SUPER ADMIN ---
  {
    role: "super_admin",
    roleDisplay: "SUPER_ADMIN",
    email: "admin2@smartcampus.com",
    password: "Admin2@12345",
    full_name: "Victoria Vance (Co-Admin)",
    employee_id: "EMP-002",
    department: "IT Operations",
    expectedRedirect: "/admin/dashboard",
  },

  // --- ADDITIONAL STUDENTS (10) ---
  {
    role: "student",
    roleDisplay: "STUDENT",
    email: "student2@smartcampus.com",
    password: "Student2@12345",
    full_name: "Bhavya Sharma",
    roll_number: "STU-2026-002",
    department: "Computer Science",
    phone: "+91 98765 43202",
    address: "Room 102, Block A, Aryabhata Hostel",
    expectedRedirect: "/dashboard",
  },
  {
    role: "student",
    roleDisplay: "STUDENT",
    email: "student3@smartcampus.com",
    password: "Student3@12345",
    full_name: "Chirag Patel",
    roll_number: "STU-2026-003",
    department: "Electronics & Comm",
    phone: "+91 98765 43203",
    address: "Room 103, Block A, Aryabhata Hostel",
    expectedRedirect: "/dashboard",
  },
  {
    role: "student",
    roleDisplay: "STUDENT",
    email: "student4@smartcampus.com",
    password: "Student4@12345",
    full_name: "Divya Nair",
    roll_number: "STU-2026-004",
    department: "Information Tech",
    phone: "+91 98765 43204",
    address: "Room 201, Block A, Kalam Hostel",
    expectedRedirect: "/dashboard",
  },
  {
    role: "student",
    roleDisplay: "STUDENT",
    email: "student5@smartcampus.com",
    password: "Student5@12345",
    full_name: "Eshan Verma",
    roll_number: "STU-2026-005",
    department: "Mechanical Engg",
    phone: "+91 98765 43205",
    address: "Room 202, Block B, Aryabhata Hostel",
    expectedRedirect: "/dashboard",
  },
  {
    role: "student",
    roleDisplay: "STUDENT",
    email: "student6@smartcampus.com",
    password: "Student6@12345",
    full_name: "Fatima Khan",
    roll_number: "STU-2026-006",
    department: "Civil Engineering",
    phone: "+91 98765 43206",
    address: "Room 202, Block A, Kalam Hostel",
    expectedRedirect: "/dashboard",
  },
  {
    role: "student",
    roleDisplay: "STUDENT",
    email: "student7@smartcampus.com",
    password: "Student7@12345",
    full_name: "Gaurav Gupta",
    roll_number: "STU-2026-007",
    department: "Computer Science",
    phone: "+91 98765 43207",
    address: "Room 301, Block B, Aryabhata Hostel",
    expectedRedirect: "/dashboard",
  },
  {
    role: "student",
    roleDisplay: "STUDENT",
    email: "student8@smartcampus.com",
    password: "Student8@12345",
    full_name: "Harini Sundaram",
    roll_number: "STU-2026-008",
    department: "Biotechnology",
    phone: "+91 98765 43208",
    address: "Room 301, Block B, Kalam Hostel",
    expectedRedirect: "/dashboard",
  },
  {
    role: "student",
    roleDisplay: "STUDENT",
    email: "student9@smartcampus.com",
    password: "Student9@12345",
    full_name: "Ishan Deshmukh",
    roll_number: "STU-2026-009",
    department: "Electrical Engg",
    phone: "+91 98765 43209",
    address: "Room 302, Block B, Aryabhata Hostel",
    expectedRedirect: "/dashboard",
  },
  {
    role: "student",
    roleDisplay: "STUDENT",
    email: "student10@smartcampus.com",
    password: "Student10@12345",
    full_name: "Jyoti Reddy",
    roll_number: "STU-2026-010",
    department: "Management Studies",
    phone: "+91 98765 43210",
    address: "Room 302, Block B, Kalam Hostel",
    expectedRedirect: "/dashboard",
  },
  {
    role: "student",
    roleDisplay: "STUDENT",
    email: "student11@smartcampus.com",
    password: "Student11@12345",
    full_name: "Karan Malhotra",
    roll_number: "STU-2026-011",
    department: "Computer Science",
    phone: "+91 98765 43211",
    address: "Day Scholar (City Center)",
    expectedRedirect: "/dashboard",
  },

  // --- ADDITIONAL FACULTY (5) ---
  {
    role: "faculty",
    roleDisplay: "FACULTY",
    email: "faculty2@smartcampus.com",
    password: "Faculty2@12345",
    full_name: "Dr. Alan Turing",
    employee_id: "EMP-102",
    department: "Computer Science",
    phone: "+91 98765 11102",
    expectedRedirect: "/faculty/dashboard",
  },
  {
    role: "faculty",
    roleDisplay: "FACULTY",
    email: "faculty3@smartcampus.com",
    password: "Faculty3@12345",
    full_name: "Dr. Ada Lovelace",
    employee_id: "EMP-103",
    department: "Information Tech",
    phone: "+91 98765 11103",
    expectedRedirect: "/faculty/dashboard",
  },
  {
    role: "faculty",
    roleDisplay: "FACULTY",
    email: "faculty4@smartcampus.com",
    password: "Faculty4@12345",
    full_name: "Prof. Richard Feynman",
    employee_id: "EMP-104",
    department: "Physics & Electronics",
    phone: "+91 98765 11104",
    expectedRedirect: "/faculty/dashboard",
  },
  {
    role: "faculty",
    roleDisplay: "FACULTY",
    email: "faculty5@smartcampus.com",
    password: "Faculty5@12345",
    full_name: "Dr. APJ Abdul Kalam",
    employee_id: "EMP-105",
    department: "Aerospace & Mech",
    phone: "+91 98765 11105",
    expectedRedirect: "/faculty/dashboard",
  },
  {
    role: "faculty",
    roleDisplay: "FACULTY",
    email: "faculty6@smartcampus.com",
    password: "Faculty6@12345",
    full_name: "Prof. Grace Hopper",
    employee_id: "EMP-106",
    department: "Computer Science",
    phone: "+91 98765 11106",
    expectedRedirect: "/faculty/dashboard",
  },

  // --- ADDITIONAL LIBRARIANS (2) ---
  {
    role: "librarian",
    roleDisplay: "LIBRARIAN",
    email: "librarian2@smartcampus.com",
    password: "Librarian2@12345",
    full_name: "Leonard Librarian",
    employee_id: "EMP-202",
    department: "Central Library",
    expectedRedirect: "/librarian/dashboard",
  },
  {
    role: "librarian",
    roleDisplay: "LIBRARIAN",
    email: "librarian3@smartcampus.com",
    password: "Librarian3@12345",
    full_name: "Lucy Librarian",
    employee_id: "EMP-203",
    department: "Digital Archives",
    expectedRedirect: "/librarian/dashboard",
  },

  // --- ADDITIONAL EVENT ORGANIZERS (3) ---
  {
    role: "event_organizer",
    roleDisplay: "EVENT_ORGANIZER",
    email: "organizer2@smartcampus.com",
    password: "Organizer2@12345",
    full_name: "Olivia Organizer",
    employee_id: "EMP-302",
    department: "Cultural Committee",
    expectedRedirect: "/event-organizer/dashboard",
  },
  {
    role: "event_organizer",
    roleDisplay: "EVENT_ORGANIZER",
    email: "organizer3@smartcampus.com",
    password: "Organizer3@12345",
    full_name: "Owen Organizer",
    employee_id: "EMP-303",
    department: "Sports Council",
    expectedRedirect: "/event-organizer/dashboard",
  },
  {
    role: "event_organizer",
    roleDisplay: "EVENT_ORGANIZER",
    email: "organizer4@smartcampus.com",
    password: "Organizer4@12345",
    full_name: "Ophelia Organizer",
    employee_id: "EMP-304",
    department: "Tech Fest Cell",
    expectedRedirect: "/event-organizer/dashboard",
  },

  // --- ADDITIONAL BUS DRIVERS (5) ---
  {
    role: "bus_driver",
    roleDisplay: "BUS_DRIVER",
    email: "driver2@smartcampus.com",
    password: "Driver2@12345",
    full_name: "Daniel Driver",
    employee_id: "EMP-402",
    department: "Transport Services",
    expectedRedirect: "/driver/dashboard",
  },
  {
    role: "bus_driver",
    roleDisplay: "BUS_DRIVER",
    email: "driver3@smartcampus.com",
    password: "Driver3@12345",
    full_name: "Derek Driver",
    employee_id: "EMP-403",
    department: "Transport Services",
    expectedRedirect: "/driver/dashboard",
  },
  {
    role: "bus_driver",
    roleDisplay: "BUS_DRIVER",
    email: "driver4@smartcampus.com",
    password: "Driver4@12345",
    full_name: "Dominic Driver",
    employee_id: "EMP-404",
    department: "Transport Services",
    expectedRedirect: "/driver/dashboard",
  },
  {
    role: "bus_driver",
    roleDisplay: "BUS_DRIVER",
    email: "driver5@smartcampus.com",
    password: "Driver5@12345",
    full_name: "Douglas Driver",
    employee_id: "EMP-405",
    department: "Transport Services",
    expectedRedirect: "/driver/dashboard",
  },
  {
    role: "bus_driver",
    roleDisplay: "BUS_DRIVER",
    email: "driver6@smartcampus.com",
    password: "Driver6@12345",
    full_name: "Dylan Driver",
    employee_id: "EMP-406",
    department: "Transport Services",
    expectedRedirect: "/driver/dashboard",
  },

  // --- ADDITIONAL HOSTEL WARDENS (3) ---
  {
    role: "hostel_warden",
    roleDisplay: "HOSTEL_WARDEN",
    email: "warden2@smartcampus.com",
    password: "Warden2@12345",
    full_name: "Harriet Warden",
    employee_id: "EMP-502",
    department: "Girls Hostel Administration",
    expectedRedirect: "/warden/dashboard",
  },
  {
    role: "hostel_warden",
    roleDisplay: "HOSTEL_WARDEN",
    email: "warden3@smartcampus.com",
    password: "Warden3@12345",
    full_name: "Hugh Warden",
    employee_id: "EMP-503",
    department: "PG Hostel Administration",
    expectedRedirect: "/warden/dashboard",
  },
  {
    role: "hostel_warden",
    roleDisplay: "HOSTEL_WARDEN",
    email: "warden4@smartcampus.com",
    password: "Warden4@12345",
    full_name: "Hannah Warden",
    employee_id: "EMP-504",
    department: "Student Housing Security",
    expectedRedirect: "/warden/dashboard",
  },

  // --- ADDITIONAL MESS MANAGERS (2) ---
  {
    role: "mess_manager",
    roleDisplay: "MESS_MANAGER",
    email: "mess2@smartcampus.com",
    password: "Mess2@12345",
    full_name: "Maria Mess",
    employee_id: "EMP-602",
    department: "Girls Hostel Mess",
    expectedRedirect: "/mess-manager/dashboard",
  },
  {
    role: "mess_manager",
    roleDisplay: "MESS_MANAGER",
    email: "mess3@smartcampus.com",
    password: "Mess3@12345",
    full_name: "Michael Mess",
    employee_id: "EMP-603",
    department: "Central Food Court",
    expectedRedirect: "/mess-manager/dashboard",
  },
];

async function seed() {
  console.log("==================================================");
  console.log("SMART CAMPUS — COMPREHENSIVE SEEDING SCRIPT");
  console.log("==================================================\n");

  // Map to store user IDs by email for foreign key relationships
  const userMap = new Map();
  const userRoleMap = new Map();

  // --------------------------------------------------------------------------
  // STEP 1: AUTH USERS & PROFILES
  // --------------------------------------------------------------------------
  console.log("--> 1. Seeding Auth Users & Profiles...");
  const { data: existingUsersData } = await adminClient.auth.admin.listUsers();
  const existingByEmail = new Map(
    (existingUsersData?.users || []).map((u) => [u.email, u])
  );

  const userSummaryTable = [];

  for (const uConfig of SEED_USERS) {
    let userId;
    let statusText = "Active";

    const existing = existingByEmail.get(uConfig.email);
    if (existing) {
      userId = existing.id;
      // If primary user, preserve password and credentials
      if (!uConfig.isPrimary) {
        await adminClient.auth.admin.updateUserById(userId, {
          password: uConfig.password,
          email_confirm: true,
          user_metadata: { role: uConfig.role, full_name: uConfig.full_name },
        });
      }
    } else {
      const { data: created, error: createError } = await adminClient.auth.admin.createUser({
        email: uConfig.email,
        password: uConfig.password,
        email_confirm: true,
        user_metadata: { role: uConfig.role, full_name: uConfig.full_name },
      });

      if (createError) {
        console.error(`Failed to create user ${uConfig.email}:`, createError.message);
        continue;
      }
      userId = created.user.id;
    }

    userMap.set(uConfig.email, userId);
    userRoleMap.set(uConfig.role, (userRoleMap.get(uConfig.role) || []).concat(userId));

    // Upsert Profile
    await adminClient.from("profiles").upsert({
      id: userId,
      role: uConfig.role,
      full_name: uConfig.full_name,
      email: uConfig.email,
      department: uConfig.department || null,
      roll_number: uConfig.roll_number || null,
      employee_id: uConfig.employee_id || null,
      phone: uConfig.phone || "+91 98765 00000",
      address: uConfig.address || "Campus Residence, Block C",
      is_active: true,
    }, { onConflict: "id" });

    // Verify login
    const { data: signInData, error: signInErr } = await anonClient.auth.signInWithPassword({
      email: uConfig.email,
      password: uConfig.password,
    });

    statusText = (!signInErr && signInData.session) ? "Verified Login" : "Created/Active";

    userSummaryTable.push({
      Role: uConfig.roleDisplay,
      Email: uConfig.email,
      Password: uConfig.password,
      Dashboard: uConfig.expectedRedirect,
      Status: statusText,
    });
  }

  console.log(`✓ Seeded ${SEED_USERS.length} Auth users & profiles.\n`);

  const studentIds = userRoleMap.get("student") || [];
  const librarianIds = userRoleMap.get("librarian") || [];
  const organizerIds = userRoleMap.get("event_organizer") || [];
  const driverIds = userRoleMap.get("bus_driver") || [];
  const wardenIds = userRoleMap.get("hostel_warden") || [];
  const messManagerIds = userRoleMap.get("mess_manager") || [];
  const facultyIds = userRoleMap.get("faculty") || [];

  // --------------------------------------------------------------------------
  // STEP 2: LIBRARY (Categories, Authors, Publishers, 30+ Books, Copies, Borrows)
  // --------------------------------------------------------------------------
  console.log("--> 2. Seeding Library System...");

  // Categories
  const categoriesList = [
    { name: "Computer Science", description: "Software development, algorithms, AI & systems" },
    { name: "Electronics & Communication", description: "Semiconductors, signal processing & VLSI" },
    { name: "Mechanical Engineering", description: "Thermodynamics, robotics & mechanics" },
    { name: "Physics & Astronomy", description: "Theoretical physics, quantum mechanics & optics" },
    { name: "Mathematics & Statistics", description: "Calculus, linear algebra & probability" },
    { name: "Management & Business", description: "Finance, operations & strategic management" },
    { name: "Literature & Fiction", description: "Classic novels, poetry & humanities" },
    { name: "Biotechnology & Life Sciences", description: "Genetics, biochemistry & microbiology" },
  ];
  await adminClient.from("book_categories").upsert(categoriesList, { onConflict: "name" });
  const { data: catRecords } = await adminClient.from("book_categories").select("id, name");
  const catMap = new Map(catRecords?.map((c) => [c.name, c.id]));

  // Authors
  const authorsList = [
    { name: "Donald E. Knuth", bio: "Renowned computer scientist and author of The Art of Computer Programming" },
    { name: "Robert C. Martin", bio: "Software engineer and author of Clean Code and Clean Architecture" },
    { name: "Thomas H. Cormen", bio: "Co-author of Introduction to Algorithms (CLRS)" },
    { name: "Andrew S. Tanenbaum", bio: "Author of Modern Operating Systems and Computer Networks" },
    { name: "Erich Gamma", bio: "Co-author of Design Patterns: Elements of Reusable Object-Oriented Software" },
    { name: "Stephen Hawking", bio: "Theoretical physicist and author of A Brief History of Time" },
    { name: "Richard P. Feynman", bio: "Nobel laureate physicist and author of The Feynman Lectures on Physics" },
    { name: "Peter Norvig", bio: "AI scientist and co-author of Artificial Intelligence: A Modern Approach" },
    { name: "Brian W. Kernighan", bio: "Co-creator of C programming language and UNIX contributor" },
    { name: "Abraham Silberschatz", bio: "Co-author of Operating System Concepts and Database System Concepts" },
  ];
  await adminClient.from("book_authors").upsert(authorsList, { onConflict: "name" });
  const { data: authorRecords } = await adminClient.from("book_authors").select("id, name");
  const authorMap = new Map(authorRecords?.map((a) => [a.name, a.id]));

  // Publishers
  const publishersList = [
    { name: "MIT Press", website: "https://mitpress.mit.edu" },
    { name: "Prentice Hall", website: "https://www.pearson.com" },
    { name: "Addison-Wesley", website: "https://www.informit.com" },
    { name: "O'Reilly Media", website: "https://www.oreilly.com" },
    { name: "Pearson Education", website: "https://www.pearson.com" },
    { name: "Springer Science", website: "https://www.springer.com" },
    { name: "McGraw-Hill Education", website: "https://www.mheducation.com" },
    { name: "Cambridge University Press", website: "https://www.cambridge.org" },
  ];
  await adminClient.from("book_publishers").upsert(publishersList, { onConflict: "name" });
  const { data: pubRecords } = await adminClient.from("book_publishers").select("id, name");
  const pubMap = new Map(pubRecords?.map((p) => [p.name, p.id]));

  // 30+ Books
  const booksToSeed = [
    { title: "Introduction to Algorithms", isbn: "978-0262033848", cat: "Computer Science", author: "Thomas H. Cormen", pub: "MIT Press", year: 2009, edition: "3rd Edition", copies: 6, shelf: "Shelf CS-01" },
    { title: "Clean Code: A Handbook of Agile Software Craftsmanship", isbn: "978-0132350884", cat: "Computer Science", author: "Robert C. Martin", pub: "Prentice Hall", year: 2008, edition: "1st Edition", copies: 5, shelf: "Shelf CS-02" },
    { title: "The Art of Computer Programming (Vol 1-4)", isbn: "978-0321751041", cat: "Computer Science", author: "Donald E. Knuth", pub: "Addison-Wesley", year: 2011, edition: "3rd Edition", copies: 4, shelf: "Shelf CS-03" },
    { title: "Modern Operating Systems", isbn: "978-0133591620", cat: "Computer Science", author: "Andrew S. Tanenbaum", pub: "Pearson Education", year: 2014, edition: "4th Edition", copies: 5, shelf: "Shelf CS-04" },
    { title: "Design Patterns: Elements of Reusable Object-Oriented Software", isbn: "978-0201633610", cat: "Computer Science", author: "Erich Gamma", pub: "Addison-Wesley", year: 1994, edition: "1st Edition", copies: 4, shelf: "Shelf CS-05" },
    { title: "Artificial Intelligence: A Modern Approach", isbn: "978-0134610993", cat: "Computer Science", author: "Peter Norvig", pub: "Pearson Education", year: 2020, edition: "4th Edition", copies: 6, shelf: "Shelf CS-06" },
    { title: "Operating System Concepts", isbn: "978-1118063330", cat: "Computer Science", author: "Abraham Silberschatz", pub: "Prentice Hall", year: 2018, edition: "10th Edition", copies: 5, shelf: "Shelf CS-07" },
    { title: "The C Programming Language", isbn: "978-0131103627", cat: "Computer Science", author: "Brian W. Kernighan", pub: "Prentice Hall", year: 1988, edition: "2nd Edition", copies: 4, shelf: "Shelf CS-08" },
    { title: "Computer Networks", isbn: "978-0132126953", cat: "Computer Science", author: "Andrew S. Tanenbaum", pub: "Pearson Education", year: 2010, edition: "5th Edition", copies: 5, shelf: "Shelf CS-09" },
    { title: "Clean Architecture: A Craftsman's Guide to Software Structure", isbn: "978-0134494166", cat: "Computer Science", author: "Robert C. Martin", pub: "Prentice Hall", year: 2017, edition: "1st Edition", copies: 4, shelf: "Shelf CS-10" },

    { title: "A Brief History of Time", isbn: "978-0553380163", cat: "Physics & Astronomy", author: "Stephen Hawking", pub: "Cambridge University Press", year: 1998, edition: "Updated Edition", copies: 4, shelf: "Shelf PHY-01" },
    { title: "The Feynman Lectures on Physics (Vol 1)", isbn: "978-0465024933", cat: "Physics & Astronomy", author: "Richard P. Feynman", pub: "Addison-Wesley", year: 2011, edition: "New Millennium Edition", copies: 3, shelf: "Shelf PHY-02" },
    { title: "QED: The Strange Theory of Light and Matter", isbn: "978-0691125756", cat: "Physics & Astronomy", author: "Richard P. Feynman", pub: "Princeton University Press", year: 2006, edition: "Expanded Edition", copies: 3, shelf: "Shelf PHY-03" },
    { title: "Quantum Physics for Beginners", isbn: "978-1801234567", cat: "Physics & Astronomy", author: "Stephen Hawking", pub: "Springer Science", year: 2019, edition: "1st Edition", copies: 4, shelf: "Shelf PHY-04" },

    { title: "Linear Algebra and Its Applications", isbn: "978-0321982384", cat: "Mathematics & Statistics", author: "Thomas H. Cormen", pub: "Pearson Education", year: 2015, edition: "5th Edition", copies: 5, shelf: "Shelf MATH-01" },
    { title: "Calculus: Early Transcendentals", isbn: "978-1285741550", cat: "Mathematics & Statistics", author: "Donald E. Knuth", pub: "McGraw-Hill Education", year: 2016, edition: "8th Edition", copies: 4, shelf: "Shelf MATH-02" },
    { title: "Probability and Statistics for Engineers", isbn: "978-0321694010", cat: "Mathematics & Statistics", author: "Peter Norvig", pub: "Pearson Education", year: 2013, edition: "9th Edition", copies: 4, shelf: "Shelf MATH-03" },

    { title: "Principles of Microeconomics", isbn: "978-1305971493", cat: "Management & Business", author: "Robert C. Martin", pub: "McGraw-Hill Education", year: 2017, edition: "8th Edition", copies: 4, shelf: "Shelf MGMT-01" },
    { title: "Strategic Management: Concepts and Cases", isbn: "978-1260092370", cat: "Management & Business", author: "Erich Gamma", pub: "McGraw-Hill Education", year: 2019, edition: "13th Edition", copies: 3, shelf: "Shelf MGMT-02" },
    { title: "Financial Accounting: An Introduction", isbn: "978-0273777854", cat: "Management & Business", author: "Abraham Silberschatz", pub: "Pearson Education", year: 2014, edition: "6th Edition", copies: 3, shelf: "Shelf MGMT-03" },

    { title: "Microelectronic Circuits", isbn: "978-0199339136", cat: "Electronics & Communication", author: "Andrew S. Tanenbaum", pub: "Oxford University Press", year: 2014, edition: "7th Edition", copies: 4, shelf: "Shelf ECE-01" },
    { title: "Digital Signal Processing", isbn: "978-0131873742", cat: "Electronics & Communication", author: "Brian W. Kernighan", pub: "Pearson Education", year: 2006, edition: "4th Edition", copies: 3, shelf: "Shelf ECE-02" },
    { title: "Semiconductor Physics and Devices", isbn: "978-0073529585", cat: "Electronics & Communication", author: "Stephen Hawking", pub: "McGraw-Hill Education", year: 2011, edition: "4th Edition", copies: 3, shelf: "Shelf ECE-03" },

    { title: "Thermodynamics: An Engineering Approach", isbn: "978-0073398174", cat: "Mechanical Engineering", author: "Richard P. Feynman", pub: "McGraw-Hill Education", year: 2014, edition: "8th Edition", copies: 4, shelf: "Shelf MECH-01" },
    { title: "Fluid Mechanics", isbn: "978-0073398273", cat: "Mechanical Engineering", author: "Thomas H. Cormen", pub: "McGraw-Hill Education", year: 2017, edition: "9th Edition", copies: 4, shelf: "Shelf MECH-02" },
    { title: "Robotics and Automation Handbook", isbn: "978-0849318047", cat: "Mechanical Engineering", author: "Peter Norvig", pub: "CRC Press", year: 2005, edition: "1st Edition", copies: 3, shelf: "Shelf MECH-03" },

    { title: "Molecular Biology of the Cell", isbn: "978-0815344322", cat: "Biotechnology & Life Sciences", author: "Erich Gamma", pub: "Garland Science", year: 2014, edition: "6th Edition", copies: 4, shelf: "Shelf BIO-01" },
    { title: "Principles of Gene Manipulation", isbn: "978-0632059546", cat: "Biotechnology & Life Sciences", author: "Donald E. Knuth", pub: "Wiley-Blackwell", year: 2006, edition: "7th Edition", copies: 3, shelf: "Shelf BIO-02" },

    { title: "To Kill a Mockingbird", isbn: "978-0061120084", cat: "Literature & Fiction", author: "Brian W. Kernighan", pub: "Harper Perennial", year: 2006, edition: "50th Anniversary Ed", copies: 3, shelf: "Shelf LIT-01" },
    { title: "1984 (Nineteen Eighty-Four)", isbn: "978-0451524935", cat: "Literature & Fiction", author: "Robert C. Martin", pub: "Signet Classics", year: 1950, edition: "Centennial Edition", copies: 4, shelf: "Shelf LIT-02" },

    { title: "Database System Concepts", isbn: "978-0073523323", cat: "Computer Science", author: "Abraham Silberschatz", pub: "McGraw-Hill Education", year: 2019, edition: "7th Edition", copies: 5, shelf: "Shelf CS-11" },
    { title: "Refactoring: Improving Design of Existing Code", isbn: "978-0134757599", cat: "Computer Science", author: "Robert C. Martin", pub: "Addison-Wesley", year: 2018, edition: "2nd Edition", copies: 4, shelf: "Shelf CS-12" },
  ];

  for (const b of booksToSeed) {
    const category_id = catMap.get(b.cat) || null;
    const author_id = authorMap.get(b.author) || null;
    const publisher_id = pubMap.get(b.pub) || null;

    // Check if book exists
    const { data: existingBook } = await adminClient.from("books").select("id").eq("title", b.title).maybeSingle();
    let bookId = existingBook?.id;

    if (!bookId) {
      const { data: insertedBook } = await adminClient.from("books").insert({
        title: b.title,
        isbn: b.isbn,
        category_id,
        author_id,
        publisher_id,
        publication_year: b.year,
        edition: b.edition,
        total_copies: b.copies,
        available_copies: b.copies,
        location_shelf: b.shelf,
        description: `Standard textbook for ${b.cat} curriculum.`,
      }).select("id").single();
      bookId = insertedBook?.id;

      if (bookId) {
        // Create copies
        const copiesData = Array.from({ length: b.copies }, (_, i) => ({
          book_id: bookId,
          copy_number: String(i + 1).padStart(3, "0"),
          qr_code: `${bookId}-COPY-${i + 1}`,
          status: "available",
        }));
        await adminClient.from("book_copies").insert(copiesData);
      }
    }
  }

  // Fetch all created books and copies
  const { data: allBooks } = await adminClient.from("books").select("id, title");
  const { data: allCopies } = await adminClient.from("book_copies").select("id, book_id, status");

  // Create borrowing activity for multiple students
  if (allCopies && allCopies.length > 0 && studentIds.length > 0) {
    console.log("--> Creating Borrowing Records & Activity...");
    const borrowStatusTypes = [
      { status: "returned", daysAgo: 25, dueDaysAgo: 10, returnDaysAgo: 12, fine: 0, paid: true, renewals: 1 },
      { status: "returned", daysAgo: 40, dueDaysAgo: 26, returnDaysAgo: 24, fine: 50, paid: true, renewals: 0 },
      { status: "borrowed", daysAgo: 5, dueDaysAgo: -9, returnDaysAgo: null, fine: 0, paid: false, renewals: 1 },
      { status: "borrowed", daysAgo: 2, dueDaysAgo: -12, returnDaysAgo: null, fine: 0, paid: false, renewals: 0 },
      { status: "borrowed", daysAgo: 20, dueDaysAgo: 6, returnDaysAgo: null, fine: 120, paid: false, renewals: 0 }, // overdue!
      { status: "borrowed", daysAgo: 18, dueDaysAgo: 4, returnDaysAgo: null, fine: 80, paid: false, renewals: 0 }, // overdue!
    ];

    let copyIndex = 0;
    const now = new Date();

    for (let i = 0; i < studentIds.length; i++) {
      const student_id = studentIds[i];
      const countForStudent = (i % 3) + 1;

      for (let j = 0; j < countForStudent; j++) {
        if (copyIndex >= allCopies.length) break;
        const copy = allCopies[copyIndex++];
        const rule = borrowStatusTypes[(i + j) % borrowStatusTypes.length];

        const borrowDate = new Date(now.getTime() - rule.daysAgo * 86400000).toISOString();
        const dueDate = new Date(now.getTime() - rule.dueDaysAgo * 86400000).toISOString();
        const returnDate = rule.returnDaysAgo ? new Date(now.getTime() - rule.returnDaysAgo * 86400000).toISOString() : null;

        // Check if borrow record exists
        const { data: existingBorrow } = await adminClient
          .from("book_borrows")
          .select("id")
          .eq("copy_id", copy.id)
          .eq("student_id", student_id)
          .maybeSingle();

        if (!existingBorrow) {
          await adminClient.from("book_borrows").insert({
            copy_id: copy.id,
            book_id: copy.book_id,
            student_id,
            librarian_id: librarianIds[0] || null,
            borrow_date: borrowDate,
            due_date: dueDate,
            return_date: returnDate,
            renewal_count: rule.renewals,
            fine_amount: rule.fine,
            fine_paid: rule.paid,
            status: rule.status,
          });

          // If currently borrowed, update copy status & book available copies count
          if (rule.status === "borrowed") {
            await adminClient.from("book_copies").update({ status: "borrowed" }).eq("id", copy.id);
          }
        }
      }
    }
  }
  console.log(`✓ Library system seeded (30+ books with categories, authors, publishers & borrows).\n`);

  // --------------------------------------------------------------------------
  // STEP 3: EVENTS (10+ Events, Categories, Registrations, Attendance, Certificates)
  // --------------------------------------------------------------------------
  console.log("--> 3. Seeding Events System...");

  const eventCategoriesList = [
    { name: "Technical", color: "bg-blue-500 text-white" },
    { name: "Cultural", color: "bg-purple-500 text-white" },
    { name: "Sports", color: "bg-emerald-500 text-white" },
    { name: "Workshop", color: "bg-amber-500 text-white" },
    { name: "Seminar", color: "bg-cyan-500 text-white" },
    { name: "Hackathon", color: "bg-indigo-500 text-white" },
    { name: "Competition", color: "bg-rose-500 text-white" },
    { name: "Club Activity", color: "bg-orange-500 text-white" },
  ];
  await adminClient.from("event_categories").upsert(eventCategoriesList, { onConflict: "name" });
  const { data: eventCatRecords } = await adminClient.from("event_categories").select("id, name");
  const eventCatMap = new Map(eventCatRecords?.map((ec) => [ec.name, ec.id]));

  const organizerId = organizerIds[0] || userMap.get("organizer@smartcampus.com");
  const nowMs = Date.now();

  const eventsToSeed = [
    {
      title: "Smart Campus Hackathon 2026",
      desc: "24-hour inter-departmental coding and hardware prototype hackathon.",
      cat: "Hackathon",
      venue: "Main Auditorium & Innovation Lab",
      startTime: new Date(nowMs + 7 * 86400000).toISOString(),
      endTime: new Date(nowMs + 8 * 86400000).toISOString(),
      capacity: 100,
      status: "upcoming",
      isPublic: true,
      allowFaculty: true,
    },
    {
      title: "AI & Future Technologies Workshop",
      desc: "Hands-on workshop on generative AI, LLMs, and neural network fine-tuning.",
      cat: "Workshop",
      venue: "CS Seminar Hall 2",
      startTime: new Date(nowMs + 3 * 86400000).toISOString(),
      endTime: new Date(nowMs + 3 * 86400000 + 4 * 3600000).toISOString(),
      capacity: 60,
      status: "upcoming",
      isPublic: true,
      allowFaculty: true,
    },
    {
      title: "Annual Cultural Fest — Rhythm 2026",
      desc: "Music, dance, drama, and art performances by campus talent.",
      cat: "Cultural",
      venue: "Open Air Theatre (OAT)",
      startTime: new Date(nowMs + 14 * 86400000).toISOString(),
      endTime: new Date(nowMs + 15 * 86400000).toISOString(),
      capacity: 500,
      status: "upcoming",
      isPublic: true,
      allowFaculty: true,
    },
    {
      title: "Inter-College Cricket Tournament",
      desc: "T20 cricket championship featuring 8 zonal university teams.",
      cat: "Sports",
      venue: "Campus Sports Complex Pitch 1",
      startTime: new Date(nowMs + 10 * 86400000).toISOString(),
      endTime: new Date(nowMs + 12 * 86400000).toISOString(),
      capacity: 150,
      status: "upcoming",
      isPublic: true,
      allowFaculty: false,
    },
    {
      title: "Cyber Security & Ethical Hacking Bootcamp",
      desc: "Live CTF challenges, vulnerability assessment, and network security simulation.",
      cat: "Technical",
      venue: "Lab 404, Tech Block",
      startTime: new Date(nowMs - 2 * 86400000).toISOString(),
      endTime: new Date(nowMs + 1 * 86400000).toISOString(),
      capacity: 45,
      status: "ongoing",
      isPublic: true,
      allowFaculty: true,
    },
    {
      title: "National Robotics Championship",
      desc: "Line follower, RoboWar, and Autonomous Drone navigation competitions.",
      cat: "Competition",
      venue: "Indoor Sports Stadium",
      startTime: new Date(nowMs - 15 * 86400000).toISOString(),
      endTime: new Date(nowMs - 14 * 86400000).toISOString(),
      capacity: 80,
      status: "completed",
      isPublic: true,
      allowFaculty: true,
    },
    {
      title: "Clean Campus & E-Waste Drive",
      desc: "Environmental awareness drive and e-waste recycling collection.",
      cat: "Club Activity",
      venue: "Student Activity Center",
      startTime: new Date(nowMs - 25 * 86400000).toISOString(),
      endTime: new Date(nowMs - 25 * 86400000 + 5 * 3600000).toISOString(),
      capacity: 120,
      status: "completed",
      isPublic: true,
      allowFaculty: true,
    },
    {
      title: "Research Paper Writing & Publishing Seminar",
      desc: "Guidance on IEEE / Springer journal submissions and peer-review process.",
      cat: "Seminar",
      venue: "Central Library Conference Hall",
      startTime: new Date(nowMs - 40 * 86400000).toISOString(),
      endTime: new Date(nowMs - 40 * 86400000 + 3 * 3600000).toISOString(),
      capacity: 50,
      status: "completed",
      isPublic: true,
      allowFaculty: true,
    },
    {
      title: "UI/UX Design Masterclass",
      desc: "Figma wireframing, design systems, and usability testing session.",
      cat: "Workshop",
      venue: "Design Studio 101",
      startTime: new Date(nowMs + 20 * 86400000).toISOString(),
      endTime: new Date(nowMs + 20 * 86400000 + 6 * 3600000).toISOString(),
      capacity: 35,
      status: "upcoming",
      isPublic: true,
      allowFaculty: true,
    },
    {
      title: "Campus Photography & Videography Contest",
      desc: "Showcase campus life through your lens and win prizes.",
      cat: "Competition",
      venue: "Media Center Gallery",
      startTime: new Date(nowMs - 5 * 86400000).toISOString(),
      endTime: new Date(nowMs - 5 * 86400000 + 4 * 3600000).toISOString(),
      capacity: 40,
      status: "completed",
      isPublic: true,
      allowFaculty: true,
    },
  ];

  for (const ev of eventsToSeed) {
    const category_id = eventCatMap.get(ev.cat) || null;

    const { data: existingEv } = await adminClient.from("events").select("id").eq("title", ev.title).maybeSingle();
    let eventId = existingEv?.id;

    if (!eventId) {
      const { data: insertedEv } = await adminClient.from("events").insert({
        title: ev.title,
        description: ev.desc,
        category_id,
        organizer_id: organizerId,
        venue: ev.venue,
        start_time: ev.startTime,
        end_time: ev.endTime,
        capacity: ev.capacity,
        status: ev.status,
        is_public: ev.isPublic,
        allow_faculty: ev.allowFaculty,
      }).select("id").single();
      eventId = insertedEv?.id;
    }

    if (eventId) {
      // Register multiple students and faculty
      const participants = studentIds.concat(facultyIds.slice(0, 3));
      for (let k = 0; k < participants.length; k++) {
        const uId = participants[k];
        const isCompleted = ev.status === "completed";
        const attended = isCompleted && k % 2 === 0;

        const { data: existingReg } = await adminClient
          .from("event_registrations")
          .select("id")
          .eq("event_id", eventId)
          .eq("user_id", uId)
          .maybeSingle();

        if (!existingReg) {
          await adminClient.from("event_registrations").insert({
            event_id: eventId,
            user_id: uId,
            attended,
            attended_at: attended ? ev.startTime : null,
            certificate_issued: attended,
            certificate_url: attended ? `https://smartcampus.com/certificates/${eventId}-${uId}.pdf` : null,
            qr_code: `EVT-${eventId}-USR-${uId}`,
          });
        }
      }
    }
  }
  console.log(`✓ Events system seeded (10+ events with registrations, attendance & certificates).\n`);

  // --------------------------------------------------------------------------
  // STEP 4: BUS / TRANSPORT SYSTEM (Buses, Routes, Stops, Assignments, Trips)
  // --------------------------------------------------------------------------
  console.log("--> 4. Seeding Bus Transport System...");

  const busesList = [
    { bus_number: "BUS-101 (North Campus)", capacity: 50, model: "Tata Starbus 2024", driver_email: "driver@smartcampus.com" },
    { bus_number: "BUS-102 (South City Line)", capacity: 45, model: "Ashok Leyland Sunshine", driver_email: "driver2@smartcampus.com" },
    { bus_number: "BUS-103 (East Hostel Express)", capacity: 55, model: "Volvo Eicher Campus Special", driver_email: "driver3@smartcampus.com" },
    { bus_number: "BUS-104 (Metro Link)", capacity: 40, model: "Force Traveller 2023", driver_email: "driver4@smartcampus.com" },
    { bus_number: "BUS-105 (West Tech Corridor)", capacity: 50, model: "Tata Starbus Ultra", driver_email: "driver5@smartcampus.com" },
    { bus_number: "BUS-106 (Central Shuttle)", capacity: 45, model: "Ashok Leyland Lynx", driver_email: "driver6@smartcampus.com" },
  ];

  const busRouteList = [
    { name: "Route 1: North Campus & City Station", desc: "Covers City Station, North Circle, Model Town & Main Gate" },
    { name: "Route 2: South City & Ring Road", desc: "Covers South Mall, Ring Road Flyover, Green Park & East Gate" },
    { name: "Route 3: East Hostels & Residential Sector", desc: "Covers Sector 14, East Market, Staff Quarters & Hostel Complex" },
    { name: "Route 4: Metro Station Shuttle", desc: "Direct shuttle between Central Metro Interchange and Campus Square" },
    { name: "Route 5: West Tech Park & Suburbs", desc: "Covers Tech Park, IT Highway, Suburbs Colony & West Gate" },
  ];
  await adminClient.from("bus_routes").upsert(busRouteList, { onConflict: "name" });
  const { data: routeRecords } = await adminClient.from("bus_routes").select("id, name");
  const routeMap = new Map(routeRecords?.map((r) => [r.name, r.id]));

  for (let i = 0; i < busesList.length; i++) {
    const b = busesList[i];
    const driverId = userMap.get(b.driver_email) || driverIds[0] || null;

    const { data: existingBus } = await adminClient.from("buses").select("id").eq("bus_number", b.bus_number).maybeSingle();
    let busId = existingBus?.id;

    if (!busId) {
      const { data: insertedBus } = await adminClient.from("buses").insert({
        bus_number: b.bus_number,
        capacity: b.capacity,
        model: b.model,
        driver_id: driverId,
        is_active: true,
      }).select("id").single();
      busId = insertedBus?.id;
    }
  }

  // Create Bus Stops for each route
  const { data: allRoutes } = await adminClient.from("bus_routes").select("id, name");
  for (const route of (allRoutes || [])) {
    const stops = [
      { route_id: route.id, name: `${route.name.split(":")[0]} - Stop 1 (Terminal)`, stop_order: 1, latitude: 12.9716, longitude: 77.5946 },
      { route_id: route.id, name: `${route.name.split(":")[0]} - Stop 2 (City Junction)`, stop_order: 2, latitude: 12.9750, longitude: 77.6000 },
      { route_id: route.id, name: `${route.name.split(":")[0]} - Stop 3 (Market Square)`, stop_order: 3, latitude: 12.9800, longitude: 77.6050 },
      { route_id: route.id, name: `${route.name.split(":")[0]} - Stop 4 (Campus Gate)`, stop_order: 4, latitude: 12.9850, longitude: 77.6100 },
    ];
    for (const stop of stops) {
      const { data: existingStop } = await adminClient.from("bus_stops").select("id").eq("route_id", route.id).eq("name", stop.name).maybeSingle();
      if (!existingStop) {
        await adminClient.from("bus_stops").insert(stop);
      }
    }
  }

  // Bus Trips History
  const { data: allBuses } = await adminClient.from("buses").select("id, driver_id");
  if (allBuses && allRoutes) {
    const tripStatuses = ["completed", "completed", "completed", "active", "scheduled", "delayed"];
    for (let day = 0; day < 5; day++) {
      const tripDate = new Date(nowMs - day * 86400000).toISOString().split("T")[0];
      for (let i = 0; i < Math.min(allBuses.length, allRoutes.length); i++) {
        const bus = allBuses[i];
        const route = allRoutes[i];
        const status = tripStatuses[(day + i) % tripStatuses.length];

        const { data: existingTrip } = await adminClient.from("bus_trips").select("id").eq("bus_id", bus.id).eq("trip_date", tripDate).eq("trip_type", "morning_pickup").maybeSingle();

        if (!existingTrip) {
          await adminClient.from("bus_trips").insert({
            bus_id: bus.id,
            route_id: route.id,
            driver_id: bus.driver_id || driverIds[0],
            trip_date: tripDate,
            trip_type: "morning_pickup",
            start_time: `${tripDate}T07:30:00Z`,
            end_time: status === "completed" ? `${tripDate}T08:30:00Z` : null,
            status,
            notes: status === "delayed" ? "Traffic congestion near flyover." : "Routine scheduled trip.",
          });
        }
      }
    }
  }
  console.log(`✓ Bus Transport system seeded (6 buses, 5 routes, stops & trip history).\n`);

  // --------------------------------------------------------------------------
  // STEP 5: HOSTEL SYSTEM (Hostels, Blocks, Floors, Rooms, Beds, Allocations, Leaves, Complaints, Attendance, Fees)
  // --------------------------------------------------------------------------
  console.log("--> 5. Seeding Hostel System...");

  const hostelData = [
    { name: "Aryabhata Boys Hostel", type: "boys", address: "North Hostel Zone, Campus", warden: wardenIds[0] },
    { name: "Kalam Girls Hostel", type: "girls", address: "South Hostel Zone, Campus", warden: wardenIds[1] || wardenIds[0] },
    { name: "Visvesvaraya PG Hostel", type: "coed", address: "East Academic Zone, Campus", warden: wardenIds[2] || wardenIds[0] },
  ];

  for (const h of hostelData) {
    const { data: existingH } = await adminClient.from("hostels").select("id").eq("name", h.name).maybeSingle();
    let hostelId = existingH?.id;

    if (!hostelId) {
      const { data: insertedH } = await adminClient.from("hostels").insert({
        name: h.name,
        type: h.type,
        address: h.address,
        warden_id: h.warden || null,
      }).select("id").single();
      hostelId = insertedH?.id;
    }

    if (hostelId) {
      // Create Blocks (Block A, Block B)
      for (const blockName of ["Block A", "Block B"]) {
        const { data: existingBlock } = await adminClient.from("hostel_blocks").select("id").eq("hostel_id", hostelId).eq("name", blockName).maybeSingle();
        let blockId = existingBlock?.id;

        if (!blockId) {
          const { data: insertedBlock } = await adminClient.from("hostel_blocks").insert({
            hostel_id: hostelId,
            name: blockName,
          }).select("id").single();
          blockId = insertedBlock?.id;
        }

        if (blockId) {
          // Create Floors (Floor 1, Floor 2, Floor 3)
          for (let fl = 1; fl <= 3; fl++) {
            const { data: existingFloor } = await adminClient.from("hostel_floors").select("id").eq("block_id", blockId).eq("floor_number", fl).maybeSingle();
            let floorId = existingFloor?.id;

            if (!floorId) {
              const { data: insertedFloor } = await adminClient.from("hostel_floors").insert({
                block_id: blockId,
                floor_number: fl,
              }).select("id").single();
              floorId = insertedFloor?.id;
            }

            if (floorId) {
              // Create Rooms (101, 102, 103 for each floor)
              for (let rm = 1; rm <= 3; rm++) {
                const roomNum = `${fl}0${rm}`;
                const { data: existingRoom } = await adminClient.from("hostel_rooms").select("id").eq("floor_id", floorId).eq("room_number", roomNum).maybeSingle();
                let roomId = existingRoom?.id;

                if (!roomId) {
                  const { data: insertedRoom } = await adminClient.from("hostel_rooms").insert({
                    floor_id: floorId,
                    room_number: roomNum,
                    capacity: 2,
                    type: "double",
                  }).select("id").single();
                  roomId = insertedRoom?.id;
                }

                if (roomId) {
                  // Create Beds (Bed A, Bed B)
                  for (const bedNum of ["Bed A", "Bed B"]) {
                    const { data: existingBed } = await adminClient.from("hostel_beds").select("id").eq("room_id", roomId).eq("bed_number", bedNum).maybeSingle();
                    if (!existingBed) {
                      await adminClient.from("hostel_beds").insert({
                        room_id: roomId,
                        bed_number: bedNum,
                        status: "available",
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // Allocate Students to Available Hostel Beds
  const { data: availableBeds } = await adminClient.from("hostel_beds").select("id, room_id").eq("status", "available");
  if (availableBeds && availableBeds.length > 0 && studentIds.length > 0) {
    for (let s = 0; s < Math.min(studentIds.length, availableBeds.length); s++) {
      const studentId = studentIds[s];
      const bed = availableBeds[s];

      await adminClient.from("hostel_beds").update({
        student_id: studentId,
        status: "occupied",
        allocated_at: new Date(nowMs - 60 * 86400000).toISOString(),
      }).eq("id", bed.id);
    }
  }

  // Hostel Leave Requests, Complaints, Fees, Attendance
  const { data: allHostels } = await adminClient.from("hostels").select("id");
  if (allHostels && allHostels.length > 0 && studentIds.length > 0) {
    const hId = allHostels[0].id;
    const leaveStatuses = ["approved", "pending", "rejected", "approved", "cancelled"];
    const complaintCategories = ["Plumbing", "Electrical", "Wi-Fi", "Cleanliness", "Furniture"];
    const complaintStatuses = ["resolved", "in_progress", "pending", "resolved", "assigned"];

    for (let idx = 0; idx < studentIds.length; idx++) {
      const stId = studentIds[idx];

      // Leave Request
      const lStatus = leaveStatuses[idx % leaveStatuses.length];
      const { data: existingLeave } = await adminClient.from("leave_requests").select("id").eq("student_id", stId).maybeSingle();
      if (!existingLeave) {
        await adminClient.from("leave_requests").insert({
          student_id: stId,
          hostel_id: hId,
          from_date: new Date(nowMs + (idx + 1) * 86400000).toISOString().split("T")[0],
          to_date: new Date(nowMs + (idx + 4) * 86400000).toISOString().split("T")[0],
          reason: "Family event / Home visit",
          status: lStatus,
          warden_id: wardenIds[0] || null,
          warden_remark: lStatus === "approved" ? "Approved by warden." : lStatus === "rejected" ? "Overlapping exams." : null,
        });
      }

      // Hostel Complaint
      const cCat = complaintCategories[idx % complaintCategories.length];
      const cStat = complaintStatuses[idx % complaintStatuses.length];
      const { data: existingComp } = await adminClient.from("hostel_complaints").select("id").eq("student_id", stId).maybeSingle();
      if (!existingComp) {
        await adminClient.from("hostel_complaints").insert({
          student_id: stId,
          hostel_id: hId,
          category: cCat,
          description: `Issue reported regarding ${cCat} in room. Needs attention.`,
          status: cStat,
          priority: idx % 2 === 0 ? "high" : "medium",
          resolved_by: cStat === "resolved" ? (wardenIds[0] || null) : null,
          resolved_at: cStat === "resolved" ? new Date(nowMs - 2 * 86400000).toISOString() : null,
        });
      }

      // Hostel Fee
      const isPaid = idx % 2 === 0;
      const { data: existingFee } = await adminClient.from("hostel_fees").select("id").eq("student_id", stId).eq("period", "Spring 2026").maybeSingle();
      if (!existingFee) {
        await adminClient.from("hostel_fees").insert({
          student_id: stId,
          hostel_id: hId,
          period: "Spring 2026",
          amount: 25000,
          paid: isPaid,
          paid_at: isPaid ? new Date(nowMs - 30 * 86400000).toISOString() : null,
          due_date: new Date(nowMs + 15 * 86400000).toISOString().split("T")[0],
          receipt_url: isPaid ? `https://smartcampus.com/receipts/FEE-${stId}.pdf` : null,
        });
      }

      // Hostel Attendance for past 3 days
      for (let d = 0; d < 3; d++) {
        const attDate = new Date(nowMs - d * 86400000).toISOString().split("T")[0];
        const { data: existingAtt } = await adminClient.from("hostel_attendance").select("id").eq("student_id", stId).eq("date", attDate).maybeSingle();
        if (!existingAtt) {
          await adminClient.from("hostel_attendance").insert({
            student_id: stId,
            hostel_id: hId,
            date: attDate,
            status: idx % 7 === 0 ? "absent" : "present",
            marked_by: wardenIds[0] || null,
          });
        }
      }
    }
  }
  console.log(`✓ Hostel system seeded (3 hostels, 54 beds, room allocations, leaves, complaints, fees & attendance).\n`);

  // --------------------------------------------------------------------------
  // STEP 6: MESS MANAGEMENT (7 Days Menus, Meal Attendance, Feedback, Complaints)
  // --------------------------------------------------------------------------
  console.log("--> 6. Seeding Mess Management System...");

  const mealTypes = ["breakfast", "lunch", "snacks", "dinner"];
  const sampleMenus = {
    breakfast: ["Idli & Sambar", "Medu Vada", "Coconut Chutney", "Tea / Coffee / Milk", "Boiled Eggs"],
    lunch: ["Paneer Butter Masala", "Dal Tadka", "Jeera Rice", "Butter Roti", "Curd & Salad", "Gulab Jamun"],
    snacks: ["Samosa & Green Chutney", "Biscuits", "Hot Tea / Coffee"],
    dinner: ["Aloo Gobi Dry", "Mixed Veg Curry", "Phulka Roti", "Steamed Rice", "Raita", "Fruit Custard"],
  };

  const managerId = messManagerIds[0] || userMap.get("mess@smartcampus.com");

  // Create menus for past 3 days, today, and next 3 days (7 days total)
  for (let dayOffset = -3; dayOffset <= 3; dayOffset++) {
    const menuDate = new Date(nowMs + dayOffset * 86400000).toISOString().split("T")[0];

    for (const meal of mealTypes) {
      const { data: existingMenu } = await adminClient.from("mess_menus").select("id").eq("date", menuDate).eq("meal_type", meal).maybeSingle();

      if (!existingMenu) {
        await adminClient.from("mess_menus").insert({
          date: menuDate,
          meal_type: meal,
          items: sampleMenus[meal] || ["Standard Meal Items"],
          manager_id: managerId,
        });
      }
    }
  }

  // Mess Attendance & Feedback for students
  if (studentIds.length > 0) {
    for (let sIdx = 0; sIdx < studentIds.length; sIdx++) {
      const stId = studentIds[sIdx];
      const todayStr = new Date().toISOString().split("T")[0];

      for (const meal of ["breakfast", "lunch", "dinner"]) {
        // Attendance
        const { data: existingMessAtt } = await adminClient.from("mess_attendance").select("id").eq("student_id", stId).eq("date", todayStr).eq("meal_type", meal).maybeSingle();
        if (!existingMessAtt) {
          await adminClient.from("mess_attendance").insert({
            student_id: stId,
            date: todayStr,
            meal_type: meal,
            present: sIdx % 5 !== 0,
          });
        }

        // Feedback
        const rating = ((sIdx + meal.length) % 5) + 1; // 1 to 5
        const comments = [
          "Food quality was excellent today!",
          "Sambar was a bit salty, overall good.",
          "Very tasty and hygienic lunch.",
          "Need more variety in dessert items.",
          "Great service by mess staff.",
        ];
        const { data: existingFb } = await adminClient.from("mess_feedback").select("id").eq("student_id", stId).eq("date", todayStr).eq("meal_type", meal).maybeSingle();
        if (!existingFb) {
          await adminClient.from("mess_feedback").insert({
            student_id: stId,
            date: todayStr,
            meal_type: meal,
            rating,
            comment: comments[sIdx % comments.length],
          });
        }
      }

      // Mess Complaints
      if (sIdx % 3 === 0) {
        const { data: existingMessComp } = await adminClient.from("mess_complaints").select("id").eq("student_id", stId).maybeSingle();
        if (!existingMessComp) {
          await adminClient.from("mess_complaints").insert({
            student_id: stId,
            description: "Drinking water dispenser in mess hall needs filter replacement.",
            category: "Hygiene",
            status: sIdx % 2 === 0 ? "resolved" : "in_progress",
            resolved_by: sIdx % 2 === 0 ? managerId : null,
            resolved_at: sIdx % 2 === 0 ? new Date(nowMs - 86400000).toISOString() : null,
          });
        }
      }
    }
  }
  console.log(`✓ Mess Management system seeded (7 days of menus, meal attendance, ratings & complaints).\n`);

  // --------------------------------------------------------------------------
  // STEP 7: NOTIFICATIONS & AUDIT LOGS
  // --------------------------------------------------------------------------
  console.log("--> 7. Seeding Notifications & Audit Logs...");

  const notificationTemplates = [
    { title: "Library Book Due Reminder", msg: "Your borrowed book 'Clean Code' is due in 2 days. Please return or renew.", type: "library", link: "/library/borrows" },
    { title: "Event Registration Confirmed", msg: "You have successfully registered for 'Smart Campus Hackathon 2026'.", type: "event", link: "/events" },
    { title: "Bus Trip Started", msg: "BUS-101 has departed from Terminal Stop 1 for Route 1.", type: "bus", link: "/bus" },
    { title: "Hostel Leave Approved", msg: "Your leave request for weekend home visit has been approved by Warden.", type: "hostel", link: "/hostel/leaves" },
    { title: "Mess Feedback Request", msg: "Please submit your feedback rating for today's Lunch meal.", type: "mess", link: "/mess/feedback" },
  ];

  for (let idx = 0; idx < SEED_USERS.length; idx++) {
    const userEmail = SEED_USERS[idx].email;
    const userId = userMap.get(userEmail);
    if (!userId) continue;

    const notif = notificationTemplates[idx % notificationTemplates.length];
    const { data: existingNotif } = await adminClient.from("notifications").select("id").eq("user_id", userId).eq("title", notif.title).maybeSingle();

    if (!existingNotif) {
      await adminClient.from("notifications").insert({
        user_id: userId,
        title: notif.title,
        message: notif.msg,
        type: notif.type,
        read: idx % 2 === 0,
        link: notif.link,
      });
    }

    // Audit Log
    await adminClient.from("audit_logs").insert({
      actor_id: userId,
      action: "USER_LOGIN_VERIFIED",
      entity_type: "profiles",
      entity_id: userId,
      metadata: { role: SEED_USERS[idx].role, email: userEmail },
      ip_address: "127.0.0.1",
    });
  }
  console.log(`✓ Notifications and audit logs seeded.\n`);

  // --------------------------------------------------------------------------
  // SUMMARY REPORT
  // --------------------------------------------------------------------------
  console.log("==================================================");
  console.log("FINAL SEEDING & CREDENTIALS SUMMARY");
  console.log("==================================================\n");
  console.table(userSummaryTable);

  const { count: booksCount } = await adminClient.from("books").select("*", { count: "exact", head: true });
  const { count: copiesCount } = await adminClient.from("book_copies").select("*", { count: "exact", head: true });
  const { count: borrowsCount } = await adminClient.from("book_borrows").select("*", { count: "exact", head: true });
  const { count: eventsCount } = await adminClient.from("events").select("*", { count: "exact", head: true });
  const { count: eventRegsCount } = await adminClient.from("event_registrations").select("*", { count: "exact", head: true });
  const { count: busesCount } = await adminClient.from("buses").select("*", { count: "exact", head: true });
  const { count: tripsCount } = await adminClient.from("bus_trips").select("*", { count: "exact", head: true });
  const { count: hostelsCount } = await adminClient.from("hostels").select("*", { count: "exact", head: true });
  const { count: bedsCount } = await adminClient.from("hostel_beds").select("*", { count: "exact", head: true });
  const { count: menusCount } = await adminClient.from("mess_menus").select("*", { count: "exact", head: true });
  const { count: notifsCount } = await adminClient.from("notifications").select("*", { count: "exact", head: true });

  console.log("==================================================");
  console.log("MODULE RECORD COUNTS");
  console.log("==================================================");
  console.log(`Library      : ${booksCount} Books | ${copiesCount} Copies | ${borrowsCount} Borrows`);
  console.log(`Events       : ${eventsCount} Events | ${eventRegsCount} Registrations & Attendance`);
  console.log(`Bus          : ${busesCount} Buses & Routes | ${tripsCount} Trips`);
  console.log(`Hostel       : ${hostelsCount} Hostels | ${bedsCount} Beds (Allocations, Leaves, Fees, Complaints)`);
  console.log(`Mess         : ${menusCount} Menus | Meal Attendance, Feedback & Complaints`);
  console.log(`Notifications: ${notifsCount} Notifications Created`);
  console.log("==================================================\n");

  console.log("✓ Seeding completed successfully!");
}

seed().catch(console.error);
