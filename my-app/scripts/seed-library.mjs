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

async function seedLibrary() {
  console.log("==================================================");
  console.log("SMART CAMPUS — LIBRARY MODULE DATA SEEDING");
  console.log("==================================================\n");

  // Fetch existing student and faculty profiles
  const { data: studentProfiles } = await adminClient
    .from("profiles")
    .select("id, full_name, email, role")
    .in("role", ["student", "faculty"]);

  const { data: librarianProfiles } = await adminClient
    .from("profiles")
    .select("id, full_name")
    .in("role", ["librarian", "super_admin"]);

  if (!studentProfiles || studentProfiles.length === 0) {
    console.error("No student or faculty profiles found! Run main seed first.");
    process.exit(1);
  }

  console.log(`Found ${studentProfiles.length} student/faculty profiles for borrowing records.`);
  const librarianId = librarianProfiles?.[0]?.id || null;

  // 1. Categories
  const categoriesList = [
    { name: "Computer Science", description: "Software engineering, data structures, algorithms, AI & systems" },
    { name: "Electronics & Communication", description: "Semiconductors, signal processing & VLSI design" },
    { name: "Mechanical Engineering", description: "Thermodynamics, robotics, fluid dynamics & mechanics" },
    { name: "Physics & Astronomy", description: "Theoretical physics, quantum mechanics, optics & astrophysics" },
    { name: "Mathematics & Statistics", description: "Calculus, linear algebra, discrete math & probability" },
    { name: "Management & Business", description: "Finance, marketing, operations & strategic management" },
    { name: "Literature & Fiction", description: "Classic literature, modern fiction & humanities" },
    { name: "Biotechnology & Life Sciences", description: "Genetics, molecular biology, biochemistry & microbiology" },
  ];
  await adminClient.from("book_categories").upsert(categoriesList, { onConflict: "name" });
  const { data: catRecords } = await adminClient.from("book_categories").select("id, name");
  const catMap = new Map(catRecords?.map((c) => [c.name, c.id]));

  // 2. Authors
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

  // 3. Publishers
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

  // 4. 35+ Books
  const booksToSeed = [
    { title: "Introduction to Algorithms", isbn: "978-0262033848", cat: "Computer Science", author: "Thomas H. Cormen", pub: "MIT Press", year: 2009, edition: "3rd Edition", copies: 6, shelf: "Shelf CS-01" },
    { title: "Clean Code: A Handbook of Agile Software Craftsmanship", isbn: "978-0132350884", cat: "Computer Science", author: "Robert C. Martin", pub: "Prentice Hall", year: 2008, edition: "1st Edition", copies: 5, shelf: "Shelf CS-02" },
    { title: "The Art of Computer Programming (Vol 1-4)", isbn: "978-0321751041", cat: "Computer Science", author: "Donald E. Knuth", pub: "Addison-Wesley", year: 2011, edition: "3rd Edition", copies: 4, shelf: "Shelf CS-03" },
    { title: "Modern Operating Systems", isbn: "978-0133591620", cat: "Computer Science", author: "Andrew S. Tanenbaum", pub: "Pearson Education", year: 2014, edition: "4th Edition", copies: 5, shelf: "Shelf CS-04" },
    { title: "Design Patterns: Elements of Reusable Software", isbn: "978-0201633610", cat: "Computer Science", author: "Erich Gamma", pub: "Addison-Wesley", year: 1994, edition: "1st Edition", copies: 4, shelf: "Shelf CS-05" },
    { title: "Artificial Intelligence: A Modern Approach", isbn: "978-0134610993", cat: "Computer Science", author: "Peter Norvig", pub: "Pearson Education", year: 2020, edition: "4th Edition", copies: 6, shelf: "Shelf CS-06" },
    { title: "Operating System Concepts", isbn: "978-1118063330", cat: "Computer Science", author: "Abraham Silberschatz", pub: "Prentice Hall", year: 2018, edition: "10th Edition", copies: 5, shelf: "Shelf CS-07" },
    { title: "The C Programming Language", isbn: "978-0131103627", cat: "Computer Science", author: "Brian W. Kernighan", pub: "Prentice Hall", year: 1988, edition: "2nd Edition", copies: 4, shelf: "Shelf CS-08" },
    { title: "Computer Networks", isbn: "978-0132126953", cat: "Computer Science", author: "Andrew S. Tanenbaum", pub: "Pearson Education", year: 2010, edition: "5th Edition", copies: 5, shelf: "Shelf CS-09" },
    { title: "Clean Architecture: Software Structure & Design", isbn: "978-0134494166", cat: "Computer Science", author: "Robert C. Martin", pub: "Prentice Hall", year: 2017, edition: "1st Edition", copies: 4, shelf: "Shelf CS-10" },

    { title: "A Brief History of Time", isbn: "978-0553380163", cat: "Physics & Astronomy", author: "Stephen Hawking", pub: "Cambridge University Press", year: 1998, edition: "Updated Edition", copies: 4, shelf: "Shelf PHY-01" },
    { title: "The Feynman Lectures on Physics (Vol 1)", isbn: "978-0465024933", cat: "Physics & Astronomy", author: "Richard P. Feynman", pub: "Addison-Wesley", year: 2011, edition: "Millennium Edition", copies: 3, shelf: "Shelf PHY-02" },
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
    { title: "Fluid Mechanics Fundamentals", isbn: "978-0073398273", cat: "Mechanical Engineering", author: "Thomas H. Cormen", pub: "McGraw-Hill Education", year: 2017, edition: "9th Edition", copies: 4, shelf: "Shelf MECH-02" },
    { title: "Robotics and Automation Handbook", isbn: "978-0849318047", cat: "Mechanical Engineering", author: "Peter Norvig", pub: "CRC Press", year: 2005, edition: "1st Edition", copies: 3, shelf: "Shelf MECH-03" },

    { title: "Molecular Biology of the Cell", isbn: "978-0815344322", cat: "Biotechnology & Life Sciences", author: "Erich Gamma", pub: "Garland Science", year: 2014, edition: "6th Edition", copies: 4, shelf: "Shelf BIO-01" },
    { title: "Principles of Gene Manipulation", isbn: "978-0632059546", cat: "Biotechnology & Life Sciences", author: "Donald E. Knuth", pub: "Wiley-Blackwell", year: 2006, edition: "7th Edition", copies: 3, shelf: "Shelf BIO-02" },

    { title: "To Kill a Mockingbird", isbn: "978-0061120084", cat: "Literature & Fiction", author: "Brian W. Kernighan", pub: "Harper Perennial", year: 2006, edition: "50th Anniversary Ed", copies: 3, shelf: "Shelf LIT-01" },
    { title: "1984 (Nineteen Eighty-Four)", isbn: "978-0451524935", cat: "Literature & Fiction", author: "Robert C. Martin", pub: "Signet Classics", year: 1950, edition: "Centennial Edition", copies: 4, shelf: "Shelf LIT-02" },

    { title: "Database System Concepts", isbn: "978-0073523323", cat: "Computer Science", author: "Abraham Silberschatz", pub: "McGraw-Hill Education", year: 2019, edition: "7th Edition", copies: 5, shelf: "Shelf CS-11" },
    { title: "Refactoring: Improving Existing Code", isbn: "978-0134757599", cat: "Computer Science", author: "Robert C. Martin", pub: "Addison-Wesley", year: 2018, edition: "2nd Edition", copies: 4, shelf: "Shelf CS-12" },
    { title: "Deep Learning with Python", isbn: "978-1617294433", cat: "Computer Science", author: "Peter Norvig", pub: "O'Reilly Media", year: 2021, edition: "2nd Edition", copies: 5, shelf: "Shelf CS-13" },
    { title: "Structure and Interpretation of Computer Programs", isbn: "978-0262510875", cat: "Computer Science", author: "Donald E. Knuth", pub: "MIT Press", year: 1996, edition: "2nd Edition", copies: 4, shelf: "Shelf CS-14" },
    { title: "Compilers: Principles, Techniques, and Tools", isbn: "978-0321486813", cat: "Computer Science", author: "Brian W. Kernighan", pub: "Pearson Education", year: 2006, edition: "2nd Edition", copies: 4, shelf: "Shelf CS-15" },
  ];

  console.log(`Seeding ${booksToSeed.length} books and physical copies...`);

  for (const b of booksToSeed) {
    const category_id = catMap.get(b.cat) || null;
    const author_id = authorMap.get(b.author) || null;
    const publisher_id = pubMap.get(b.pub) || null;

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
        description: `Standard academic reference text for ${b.cat}.`,
      }).select("id").single();
      bookId = insertedBook?.id;
    }

    if (bookId) {
      // Ensure copies exist
      const { count: existingCopies } = await adminClient.from("book_copies").select("*", { count: "exact", head: true }).eq("book_id", bookId);
      if ((existingCopies ?? 0) < b.copies) {
        const needed = b.copies - (existingCopies ?? 0);
        const copiesData = Array.from({ length: needed }, (_, i) => ({
          book_id: bookId,
          copy_number: `CC-${String((existingCopies ?? 0) + i + 1).padStart(3, "0")}`,
          qr_code: `${bookId}-COPY-${(existingCopies ?? 0) + i + 1}`,
          status: "available",
        }));
        await adminClient.from("book_copies").insert(copiesData);
      }
    }
  }

  // 5. Fetch all physical copies and create interconnected loan records
  const { data: allCopies } = await adminClient.from("book_copies").select("id, book_id, status");
  const now = new Date();

  if (allCopies && allCopies.length > 0) {
    console.log(`Creating active, overdue, returned borrows and fine records across ${studentProfiles.length} borrowers...`);

    const loanScenarios = [
      { status: "returned", daysAgo: 30, dueDaysAgo: 16, returnDaysAgo: 18, fine: 0, paid: true, renewals: 1 },
      { status: "returned", daysAgo: 45, dueDaysAgo: 31, returnDaysAgo: 26, fine: 50, paid: true, renewals: 0 },
      { status: "borrowed", daysAgo: 4, dueDaysAgo: -10, returnDaysAgo: null, fine: 0, paid: false, renewals: 1 },
      { status: "borrowed", daysAgo: 2, dueDaysAgo: -12, returnDaysAgo: null, fine: 0, paid: false, renewals: 0 },
      { status: "borrowed", daysAgo: 22, dueDaysAgo: 8, returnDaysAgo: null, fine: 160, paid: false, renewals: 0 }, // overdue!
      { status: "borrowed", daysAgo: 18, dueDaysAgo: 4, returnDaysAgo: null, fine: 80, paid: false, renewals: 0 }, // overdue!
    ];

    let copyIdx = 0;
    for (let i = 0; i < studentProfiles.length; i++) {
      const student = studentProfiles[i];
      const count = (i % 3) + 1;

      for (let j = 0; j < count; j++) {
        if (copyIdx >= allCopies.length) break;
        const copy = allCopies[copyIdx++];
        const scenario = loanScenarios[(i + j) % loanScenarios.length];

        const borrowDate = new Date(now.getTime() - scenario.daysAgo * 86400000).toISOString().split("T")[0];
        const dueDate = new Date(now.getTime() - scenario.dueDaysAgo * 86400000).toISOString().split("T")[0];
        const returnDate = scenario.returnDaysAgo
          ? new Date(now.getTime() - scenario.returnDaysAgo * 86400000).toISOString().split("T")[0]
          : null;

        const { data: existingBorrow } = await adminClient
          .from("book_borrows")
          .select("id")
          .eq("copy_id", copy.id)
          .eq("student_id", student.id)
          .maybeSingle();

        if (!existingBorrow) {
          await adminClient.from("book_borrows").insert({
            copy_id: copy.id,
            book_id: copy.book_id,
            student_id: student.id,
            librarian_id: librarianId,
            borrow_date: borrowDate,
            due_date: dueDate,
            return_date: returnDate,
            renewal_count: scenario.renewals,
            fine_amount: scenario.fine,
            fine_paid: scenario.paid,
            status: scenario.status,
          });

          // Mark copy status
          if (scenario.status === "borrowed") {
            const isOverdue = scenario.dueDaysAgo > 0;
            await adminClient.from("book_copies").update({ status: isOverdue ? "overdue" : "borrowed" }).eq("id", copy.id);
          } else {
            await adminClient.from("book_copies").update({ status: "available" }).eq("id", copy.id);
          }
        }
      }
    }

    // Sync available_copies count for all books
    const { data: allBooksData } = await adminClient.from("books").select("id");
    if (allBooksData) {
      for (const bk of allBooksData) {
        const { count: avail } = await adminClient
          .from("book_copies")
          .select("*", { count: "exact", head: true })
          .eq("book_id", bk.id)
          .eq("status", "available");

        const { count: tot } = await adminClient
          .from("book_copies")
          .select("*", { count: "exact", head: true })
          .eq("book_id", bk.id);

        await adminClient
          .from("books")
          .update({ available_copies: avail ?? 0, total_copies: tot ?? 1 })
          .eq("id", bk.id);
      }
    }
  }

  console.log("✓ Library Module seeding completed successfully!");
}

seedLibrary().catch(console.error);
