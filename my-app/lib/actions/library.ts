"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { LIBRARY } from "@/lib/constants";
import { addDays, differenceInDays, format, subMonths } from "date-fns";
import type { BookInput, BookCopyInput, BorrowInput } from "@/lib/schemas/library";
import { getCurrentUser } from "./auth";

// ── Role Authorization Helpers ────────────────────────────────────────────────

async function requireLibrarianOrAdmin() {
  const profile = await getCurrentUser();
  if (!profile || (profile.role !== "librarian" && profile.role !== "super_admin")) {
    return { error: "Unauthorized. Librarian or Super Admin access required.", profile: null };
  }
  return { error: null, profile };
}

async function requireAuthUser() {
  const profile = await getCurrentUser();
  if (!profile) {
    return { error: "Unauthorized. Please log in.", profile: null };
  }
  return { error: null, profile };
}

// ── Books ────────────────────────────────────────────────────────────────────

export async function getBooks(options?: {
  query?: string;
  categoryId?: string;
  authorId?: string;
  publisherId?: string;
  availableOnly?: boolean;
}) {
  const supabase = await createClient();
  let q = supabase
    .from("books")
    .select(`
      *,
      book_categories(id, name),
      book_authors(id, name),
      book_publishers(id, name),
      book_copies(id, copy_number, status)
    `)
    .order("title", { ascending: true });

  if (options?.query && options.query.trim()) {
    const term = `%${options.query.trim()}%`;
    q = q.or(`title.ilike.${term},isbn.ilike.${term}`);
  }

  if (options?.categoryId && options.categoryId !== "all") {
    q = q.eq("category_id", options.categoryId);
  }

  if (options?.authorId && options.authorId !== "all") {
    q = q.eq("author_id", options.authorId);
  }

  if (options?.publisherId && options.publisherId !== "all") {
    q = q.eq("publisher_id", options.publisherId);
  }

  if (options?.availableOnly) {
    q = q.gt("available_copies", 0);
  }

  const { data, error } = await q;
  return { data: (data ?? []) as any[], error: error?.message };
}

export async function getBook(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select(`
      *,
      book_categories(id, name, description),
      book_authors(id, name, bio),
      book_publishers(id, name, website),
      book_copies(*)
    `)
    .eq("id", id)
    .single();

  return { data: data as any, error: error?.message };
}

export async function createBook(input: BookInput) {
  const { error: authErr, profile } = await requireLibrarianOrAdmin();
  if (authErr || !profile) return { error: authErr };

  const supabase = await createClient();

  let finalAuthorId = input.author_id || null;
  if (!finalAuthorId && input.author_name && input.author_name.trim()) {
    const name = input.author_name.trim();
    const { data: existingAuthor } = await supabase
      .from("book_authors")
      .select("id")
      .ilike("name", name)
      .maybeSingle();

    if (existingAuthor) {
      finalAuthorId = (existingAuthor as any).id;
    } else {
      const { data: newAuthor } = await supabase
        .from("book_authors")
        .insert({ name } as never)
        .select("id")
        .single();
      if (newAuthor) finalAuthorId = (newAuthor as any).id;
    }
  }

  let finalPublisherId = input.publisher_id || null;
  if (!finalPublisherId && input.publisher_name && input.publisher_name.trim()) {
    const name = input.publisher_name.trim();
    const { data: existingPublisher } = await supabase
      .from("book_publishers")
      .select("id")
      .ilike("name", name)
      .maybeSingle();

    if (existingPublisher) {
      finalPublisherId = (existingPublisher as any).id;
    } else {
      const { data: newPublisher } = await supabase
        .from("book_publishers")
        .insert({ name } as never)
        .select("id")
        .single();
      if (newPublisher) finalPublisherId = (newPublisher as any).id;
    }
  }

  const { author_name, publisher_name, ...bookData } = input;
  const totalCopies = input.total_copies ?? 1;

  const { data, error } = await supabase
    .from("books")
    .insert({
      ...bookData,
      author_id: finalAuthorId,
      publisher_id: finalPublisherId,
      total_copies: totalCopies,
      available_copies: totalCopies,
    } as never)
    .select()
    .single();

  const created = data as any;
  if (!error && created) {
    // Generate initial physical copies automatically
    const copies = Array.from({ length: totalCopies }, (_, i) => ({
      book_id: created.id,
      copy_number: `CC-${String(i + 1).padStart(3, "0")}`,
      qr_code: `${created.id}-COPY-${i + 1}`,
      status: "available",
    }));
    await supabase.from("book_copies").insert(copies as never);

    await supabase.from("audit_logs").insert({
      actor_id: profile.id,
      action: "CREATE_BOOK",
      entity_type: "books",
      entity_id: created.id,
      metadata: { title: input.title, isbn: input.isbn },
    } as never);

    revalidatePath("/library");
    revalidatePath("/library/books");
  }

  return { data: created, error: error?.message };
}

export async function updateBook(id: string, input: Partial<BookInput>) {
  const { error: authErr, profile } = await requireLibrarianOrAdmin();
  if (authErr || !profile) return { error: authErr };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("books")
    .update(input as never)
    .eq("id", id)
    .select()
    .single();

  if (!error) {
    await supabase.from("audit_logs").insert({
      actor_id: profile.id,
      action: "UPDATE_BOOK",
      entity_type: "books",
      entity_id: id,
    } as never);

    revalidatePath("/library");
    revalidatePath("/library/books");
    revalidatePath(`/library/books/${id}`);
  }

  return { data: data as any, error: error?.message };
}

export async function deleteBook(id: string) {
  const { error: authErr, profile } = await requireLibrarianOrAdmin();
  if (authErr || !profile) return { error: authErr };

  const supabase = await createClient();

  // Check active borrows
  const { count: activeBorrows } = await supabase
    .from("book_borrows")
    .select("*", { count: "exact", head: true })
    .eq("book_id", id)
    .in("status", ["borrowed", "overdue"]);

  if ((activeBorrows ?? 0) > 0) {
    return { error: "Cannot delete a book that has active borrowed copies. Return all copies first." };
  }

  const { error } = await supabase.from("books").delete().eq("id", id);
  if (!error) {
    await supabase.from("audit_logs").insert({
      actor_id: profile.id,
      action: "DELETE_BOOK",
      entity_type: "books",
      entity_id: id,
    } as never);

    revalidatePath("/library");
    revalidatePath("/library/books");
  }
  return { error: error?.message };
}

// ── Categories / Authors / Publishers ────────────────────────────────────────

export async function getCategories() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("book_categories").select("*").order("name");
  
  // Attach book count for each category
  const categoriesWithCount = await Promise.all(
    (categories ?? []).map(async (cat: any) => {
      const { count } = await supabase
        .from("books")
        .select("*", { count: "exact", head: true })
        .eq("category_id", cat.id);
      return { ...cat, bookCount: count ?? 0 };
    })
  );

  return categoriesWithCount;
}

export async function createCategory(name: string, description?: string) {
  const { error: authErr } = await requireLibrarianOrAdmin();
  if (authErr) return { error: authErr };

  const supabase = await createClient();
  const { data, error } = await supabase.from("book_categories").insert({ name, description } as never).select().single();
  if (!error) {
    revalidatePath("/library/categories");
    revalidatePath("/library");
  }
  return { data: data as any, error: error?.message };
}

export async function updateCategory(id: string, name: string, description?: string) {
  const { error: authErr } = await requireLibrarianOrAdmin();
  if (authErr) return { error: authErr };

  const supabase = await createClient();
  const { data, error } = await supabase.from("book_categories").update({ name, description } as never).eq("id", id).select().single();
  if (!error) {
    revalidatePath("/library/categories");
  }
  return { data: data as any, error: error?.message };
}

export async function deleteCategory(id: string) {
  const { error: authErr } = await requireLibrarianOrAdmin();
  if (authErr) return { error: authErr };

  const supabase = await createClient();
  
  // Check if books exist
  const { count } = await supabase.from("books").select("*", { count: "exact", head: true }).eq("category_id", id);
  if ((count ?? 0) > 0) {
    return { error: `Cannot delete category with ${count} assigned books. Reassign or delete books first.` };
  }

  const { error } = await supabase.from("book_categories").delete().eq("id", id);
  if (!error) revalidatePath("/library/categories");
  return { error: error?.message };
}

export async function getAuthors() {
  const supabase = await createClient();
  const { data: authors } = await supabase.from("book_authors").select("*").order("name");

  const authorsWithCount = await Promise.all(
    (authors ?? []).map(async (aut: any) => {
      const { count } = await supabase
        .from("books")
        .select("*", { count: "exact", head: true })
        .eq("author_id", aut.id);
      return { ...aut, bookCount: count ?? 0 };
    })
  );

  return authorsWithCount;
}

export async function createAuthor(name: string, bio?: string) {
  const { error: authErr } = await requireLibrarianOrAdmin();
  if (authErr) return { error: authErr };

  const supabase = await createClient();
  const { data, error } = await supabase.from("book_authors").insert({ name, bio } as never).select().single();
  if (!error) {
    revalidatePath("/library/authors");
    revalidatePath("/library");
  }
  return { data: data as any, error: error?.message };
}

export async function updateAuthor(id: string, name: string, bio?: string) {
  const { error: authErr } = await requireLibrarianOrAdmin();
  if (authErr) return { error: authErr };

  const supabase = await createClient();
  const { data, error } = await supabase.from("book_authors").update({ name, bio } as never).eq("id", id).select().single();
  if (!error) revalidatePath("/library/authors");
  return { data: data as any, error: error?.message };
}

export async function deleteAuthor(id: string) {
  const { error: authErr } = await requireLibrarianOrAdmin();
  if (authErr) return { error: authErr };

  const supabase = await createClient();

  const { count } = await supabase.from("books").select("*", { count: "exact", head: true }).eq("author_id", id);
  if ((count ?? 0) > 0) {
    return { error: `Cannot delete author with ${count} assigned books.` };
  }

  const { error } = await supabase.from("book_authors").delete().eq("id", id);
  if (!error) revalidatePath("/library/authors");
  return { error: error?.message };
}

export async function getPublishers() {
  const supabase = await createClient();
  const { data: publishers } = await supabase.from("book_publishers").select("*").order("name");

  const publishersWithCount = await Promise.all(
    (publishers ?? []).map(async (pub: any) => {
      const { count } = await supabase
        .from("books")
        .select("*", { count: "exact", head: true })
        .eq("publisher_id", pub.id);
      return { ...pub, bookCount: count ?? 0 };
    })
  );

  return publishersWithCount;
}

export async function createPublisher(name: string, website?: string) {
  const { error: authErr } = await requireLibrarianOrAdmin();
  if (authErr) return { error: authErr };

  const supabase = await createClient();
  const { data, error } = await supabase.from("book_publishers").insert({ name, website } as never).select().single();
  if (!error) revalidatePath("/library/publishers");
  return { data: data as any, error: error?.message };
}

export async function updatePublisher(id: string, name: string, website?: string) {
  const { error: authErr } = await requireLibrarianOrAdmin();
  if (authErr) return { error: authErr };

  const supabase = await createClient();
  const { data, error } = await supabase.from("book_publishers").update({ name, website } as never).eq("id", id).select().single();
  if (!error) revalidatePath("/library/publishers");
  return { data: data as any, error: error?.message };
}

export async function deletePublisher(id: string) {
  const { error: authErr } = await requireLibrarianOrAdmin();
  if (authErr) return { error: authErr };

  const supabase = await createClient();
  const { count } = await supabase.from("books").select("*", { count: "exact", head: true }).eq("publisher_id", id);
  if ((count ?? 0) > 0) {
    return { error: `Cannot delete publisher with ${count} assigned books.` };
  }

  const { error } = await supabase.from("book_publishers").delete().eq("id", id);
  if (!error) revalidatePath("/library/publishers");
  return { error: error?.message };
}

// ── Physical Book Copies ──────────────────────────────────────────────────────

export async function getBookCopies(bookId?: string) {
  const supabase = await createClient();
  let q = supabase
    .from("book_copies")
    .select(`
      *,
      books(id, title, isbn, cover_url)
    `)
    .order("created_at", { ascending: true });

  if (bookId) {
    q = q.eq("book_id", bookId);
  }

  const { data, error } = await q;
  return { data: (data ?? []) as any[], error: error?.message };
}

export async function createBookCopy(input: {
  book_id: string;
  copy_number: string;
  qr_code?: string;
  status?: string;
  location?: string;
  condition?: string;
}) {
  const { error: authErr, profile } = await requireLibrarianOrAdmin();
  if (authErr || !profile) return { error: authErr };

  const supabase = await createClient();

  const copyStatus = input.status || "available";
  const { data, error } = await supabase
    .from("book_copies")
    .insert({
      book_id: input.book_id,
      copy_number: input.copy_number,
      qr_code: input.qr_code || `${input.book_id}-${input.copy_number}`,
      status: copyStatus,
    } as never)
    .select()
    .single();

  if (!error && data) {
    // Recalculate book copies count
    const { count: total } = await supabase.from("book_copies").select("*", { count: "exact", head: true }).eq("book_id", input.book_id);
    const { count: avail } = await supabase.from("book_copies").select("*", { count: "exact", head: true }).eq("book_id", input.book_id).eq("status", "available");

    await supabase.from("books").update({
      total_copies: total ?? 1,
      available_copies: avail ?? 0,
    } as never).eq("id", input.book_id);

    revalidatePath(`/library/books/${input.book_id}`);
    revalidatePath("/library/copies");
  }

  return { data: data as any, error: error?.message };
}

export async function updateBookCopyStatus(copyId: string, status: string) {
  const { error: authErr } = await requireLibrarianOrAdmin();
  if (authErr) return { error: authErr };

  const supabase = await createClient();
  const { data: copyData } = await supabase.from("book_copies").select("book_id, status").eq("id", copyId).single();
  const copy = copyData as any;
  if (!copy) return { error: "Copy not found." };

  const { error } = await supabase.from("book_copies").update({ status } as never).eq("id", copyId);

  if (!error) {
    // Recalculate available copies for book
    const { count: avail } = await supabase.from("book_copies").select("*", { count: "exact", head: true }).eq("book_id", copy.book_id).eq("status", "available");
    await supabase.from("books").update({ available_copies: avail ?? 0 } as never).eq("id", copy.book_id);

    revalidatePath(`/library/books/${copy.book_id}`);
    revalidatePath("/library/copies");
  }

  return { error: error?.message };
}

export async function deleteBookCopy(copyId: string) {
  const { error: authErr } = await requireLibrarianOrAdmin();
  if (authErr) return { error: authErr };

  const supabase = await createClient();
  const { data: copyData } = await supabase.from("book_copies").select("book_id, status").eq("id", copyId).single();
  const copy = copyData as any;

  if (copy?.status === "borrowed") {
    return { error: "Cannot delete a currently borrowed copy." };
  }

  const { error } = await supabase.from("book_copies").delete().eq("id", copyId);

  if (!error && copy) {
    const { count: total } = await supabase.from("book_copies").select("*", { count: "exact", head: true }).eq("book_id", copy.book_id);
    const { count: avail } = await supabase.from("book_copies").select("*", { count: "exact", head: true }).eq("book_id", copy.book_id).eq("status", "available");

    await supabase.from("books").update({
      total_copies: total ?? 0,
      available_copies: avail ?? 0,
    } as never).eq("id", copy.book_id);

    revalidatePath(`/library/books/${copy.book_id}`);
    revalidatePath("/library/copies");
  }

  return { error: error?.message };
}

// ── Borrow / Return / Renew ──────────────────────────────────────────────────

export async function getBorrows(options?: {
  studentId?: string;
  bookId?: string;
  status?: string;
  query?: string;
}) {
  const { error: authErr, profile } = await requireAuthUser();
  if (authErr || !profile) return { data: [], error: authErr };

  const isLibrarianOrAdmin = profile.role === "librarian" || profile.role === "super_admin";
  const supabase = await createClient();

  let q = supabase
    .from("book_borrows")
    .select(`
      *,
      books(id, title, isbn, cover_url, author_id, book_authors(name)),
      book_copies(id, copy_number, qr_code, status),
      profiles!book_borrows_student_id_fkey(id, full_name, roll_number, email, role, department)
    `)
    .order("created_at", { ascending: false });

  // Students and Faculty can ONLY view their own borrow records
  if (!isLibrarianOrAdmin) {
    q = q.eq("student_id", profile.id);
  } else if (options?.studentId) {
    q = q.eq("student_id", options.studentId);
  }

  if (options?.bookId) {
    q = q.eq("book_id", options.bookId);
  }

  if (options?.status && options.status !== "all") {
    q = q.eq("status", options.status);
  }

  const { data, error } = await q;

  // Dynamically calculate overdue status and current fine
  const now = new Date();
  const processedData = (data ?? []).map((borrow: any) => {
    const dueDate = new Date(borrow.due_date);
    const isOverdue = borrow.status === "borrowed" && now > dueDate;
    const overdueDays = isOverdue ? Math.max(0, differenceInDays(now, dueDate)) : 0;
    const currentFine = isOverdue ? overdueDays * LIBRARY.FINE_PER_DAY : Number(borrow.fine_amount ?? 0);

    return {
      ...borrow,
      computedStatus: isOverdue ? "overdue" : borrow.status,
      overdueDays,
      calculatedFine: currentFine,
    };
  });

  return { data: processedData, error: error?.message };
}

export async function borrowBook(input: BorrowInput) {
  const { error: authErr, profile } = await requireAuthUser();
  if (authErr || !profile) return { error: authErr };

  const isLibrarianOrAdmin = profile.role === "librarian" || profile.role === "super_admin";

  // Standard student/faculty borrowing self or librarian issuing
  const targetStudentId = input.student_id || profile.id;

  const supabase = await createClient();

  // Check active borrow count for student
  const { count: activeBorrows } = await supabase
    .from("book_borrows")
    .select("*", { count: "exact", head: true })
    .eq("student_id", targetStudentId)
    .in("status", ["borrowed", "overdue"]);

  if ((activeBorrows ?? 0) >= LIBRARY.MAX_BORROWS_STUDENT) {
    return { error: `Borrower has reached the limit of ${LIBRARY.MAX_BORROWS_STUDENT} active borrowed books.` };
  }

  // Verify copy is available
  const { data: copyData } = await supabase
    .from("book_copies")
    .select("id, book_id, status, copy_number")
    .eq("id", input.copy_id)
    .single();

  const copy = copyData as any;
  if (!copy || copy.status !== "available") {
    return { error: "Selected copy is not available for borrowing." };
  }

  const dueDate = input.due_date || format(addDays(new Date(), LIBRARY.BORROW_DAYS), "yyyy-MM-dd");

  const { data: borrowData, error: insertErr } = await supabase
    .from("book_borrows")
    .insert({
      copy_id: input.copy_id,
      book_id: input.book_id,
      student_id: targetStudentId,
      librarian_id: isLibrarianOrAdmin ? profile.id : null,
      borrow_date: format(new Date(), "yyyy-MM-dd"),
      due_date: dueDate,
      notes: input.notes,
      status: "borrowed",
    } as never)
    .select()
    .single();

  const created = borrowData as any;
  if (!insertErr && created) {
    // Update copy status to borrowed
    await supabase.from("book_copies").update({ status: "borrowed" } as never).eq("id", input.copy_id);

    // Recalculate book available_copies
    const { count: availCount } = await supabase
      .from("book_copies")
      .select("*", { count: "exact", head: true })
      .eq("book_id", input.book_id)
      .eq("status", "available");

    await supabase.from("books").update({ available_copies: availCount ?? 0 } as never).eq("id", input.book_id);

    // Notify borrower
    await supabase.from("notifications").insert({
      user_id: targetStudentId,
      title: "Book Issued",
      message: `Due date for return: ${format(new Date(dueDate), "dd MMM yyyy")}.`,
      type: "library",
      link: "/library/borrows",
    } as never);

    await supabase.from("audit_logs").insert({
      actor_id: profile.id,
      action: "BORROW_BOOK",
      entity_type: "book_borrows",
      entity_id: created.id,
      metadata: { book_id: input.book_id, copy_id: input.copy_id, student_id: targetStudentId },
    } as never);

    revalidatePath("/library");
    revalidatePath("/library/borrows");
    revalidatePath("/library/books");
    revalidatePath(`/library/books/${input.book_id}`);
  }

  return { data: created, error: insertErr?.message };
}

export async function returnBook(borrowId: string, notes?: string) {
  const { error: authErr, profile } = await requireLibrarianOrAdmin();
  if (authErr || !profile) return { error: authErr };

  const supabase = await createClient();
  const { data: borrowData } = await supabase
    .from("book_borrows")
    .select("*")
    .eq("id", borrowId)
    .single();

  const borrow = borrowData as any;
  if (!borrow) return { error: "Borrow record not found." };
  if (borrow.status === "returned") return { error: "Book has already been returned." };

  const today = new Date();
  const dueDate = new Date(borrow.due_date);
  const overdueDays = Math.max(0, differenceInDays(today, dueDate));
  const fineAmount = overdueDays * LIBRARY.FINE_PER_DAY;

  const returnDateStr = format(today, "yyyy-MM-dd");

  const { error } = await supabase
    .from("book_borrows")
    .update({
      status: "returned",
      return_date: returnDateStr,
      fine_amount: fineAmount,
      notes: notes ? `${borrow.notes || ""}\nReturn note: ${notes}` : borrow.notes,
    } as never)
    .eq("id", borrowId);

  if (!error) {
    // Restore physical copy status to available
    await supabase.from("book_copies").update({ status: "available" } as never).eq("id", borrow.copy_id);

    // Update book available_copies
    const { count: availCount } = await supabase
      .from("book_copies")
      .select("*", { count: "exact", head: true })
      .eq("book_id", borrow.book_id)
      .eq("status", "available");

    await supabase.from("books").update({ available_copies: availCount ?? 0 } as never).eq("id", borrow.book_id);

    // Notify borrower
    await supabase.from("notifications").insert({
      user_id: borrow.student_id,
      title: "Book Returned",
      message: fineAmount > 0 ? `Book returned. Fine incurred: ₹${fineAmount}` : "Book returned on time.",
      type: "library",
      link: "/library/borrows",
    } as never);

    await supabase.from("audit_logs").insert({
      actor_id: profile.id,
      action: "RETURN_BOOK",
      entity_type: "book_borrows",
      entity_id: borrowId,
      metadata: { fine_amount: fineAmount, overdue_days: overdueDays },
    } as never);

    revalidatePath("/library");
    revalidatePath("/library/borrows");
    revalidatePath("/library/fines");
    revalidatePath(`/library/books/${borrow.book_id}`);
  }

  return { error: error?.message, fineAmount };
}

export async function renewBook(borrowId: string) {
  const { error: authErr, profile } = await requireAuthUser();
  if (authErr || !profile) return { error: authErr };

  const isLibrarianOrAdmin = profile.role === "librarian" || profile.role === "super_admin";
  const supabase = await createClient();

  const { data: borrowData } = await supabase.from("book_borrows").select("*").eq("id", borrowId).single();
  const borrow = borrowData as any;
  if (!borrow) return { error: "Borrow record not found." };

  if (borrow.status === "returned") return { error: "Cannot renew a returned book." };

  if (!isLibrarianOrAdmin && borrow.student_id !== profile.id) {
    return { error: "Unauthorized. You can only renew your own borrowed books." };
  }

  if ((borrow.renewal_count ?? 0) >= LIBRARY.MAX_RENEWALS) {
    return { error: `Maximum renewal limit of ${LIBRARY.MAX_RENEWALS} reached for this book.` };
  }

  const currentDueDate = new Date(borrow.due_date);
  const newDueDate = format(addDays(currentDueDate, LIBRARY.RENEWAL_DAYS), "yyyy-MM-dd");

  const { error } = await supabase
    .from("book_borrows")
    .update({
      due_date: newDueDate,
      renewal_count: (borrow.renewal_count ?? 0) + 1,
    } as never)
    .eq("id", borrowId);

  if (!error) {
    await supabase.from("notifications").insert({
      user_id: borrow.student_id,
      title: "Book Renewed",
      message: `New due date: ${format(new Date(newDueDate), "dd MMM yyyy")}`,
      type: "library",
      link: "/library/borrows",
    } as never);

    revalidatePath("/library");
    revalidatePath("/library/borrows");
  }

  return { error: error?.message, newDueDate };
}

// ── Fine Management ──────────────────────────────────────────────────────────

export async function getFines(options?: { studentId?: string; status?: string }) {
  const { error: authErr, profile } = await requireAuthUser();
  if (authErr || !profile) return { data: [], error: authErr };

  const isLibrarianOrAdmin = profile.role === "librarian" || profile.role === "super_admin";
  const supabase = await createClient();

  let q = supabase
    .from("book_borrows")
    .select(`
      *,
      books(id, title, isbn),
      book_copies(copy_number),
      profiles!book_borrows_student_id_fkey(id, full_name, roll_number, email, department)
    `)
    .gt("fine_amount", 0)
    .order("created_at", { ascending: false });

  if (!isLibrarianOrAdmin) {
    q = q.eq("student_id", profile.id);
  } else if (options?.studentId) {
    q = q.eq("student_id", options.studentId);
  }

  if (options?.status === "paid") {
    q = q.eq("fine_paid", true);
  } else if (options?.status === "pending") {
    q = q.eq("fine_paid", false);
  }

  const { data, error } = await q;
  return { data: (data ?? []) as any[], error: error?.message };
}

export async function payFine(borrowId: string) {
  const { error: authErr, profile } = await requireLibrarianOrAdmin();
  if (authErr || !profile) return { error: authErr };

  const supabase = await createClient();
  const { error } = await supabase
    .from("book_borrows")
    .update({ fine_paid: true } as never)
    .eq("id", borrowId);

  if (!error) {
    revalidatePath("/library");
    revalidatePath("/library/fines");
    revalidatePath("/library/borrows");
  }

  return { error: error?.message };
}

export async function waiveFine(borrowId: string) {
  const { error: authErr, profile } = await requireLibrarianOrAdmin();
  if (authErr || !profile) return { error: authErr };

  const supabase = await createClient();
  const { error } = await supabase
    .from("book_borrows")
    .update({
      fine_paid: true,
      fine_amount: 0,
    } as never)
    .eq("id", borrowId);

  if (!error) {
    await supabase.from("audit_logs").insert({
      actor_id: profile.id,
      action: "WAIVE_FINE",
      entity_type: "book_borrows",
      entity_id: borrowId,
    } as never);

    revalidatePath("/library");
    revalidatePath("/library/fines");
    revalidatePath("/library/borrows");
  }

  return { error: error?.message };
}

// ── Library Analytics ────────────────────────────────────────────────────────

export async function getLibraryAnalytics() {
  const supabase = await createClient();

  const [
    { count: totalBooks },
    { count: totalCopies },
    { count: availableCopies },
    { count: totalBorrows },
    { count: activeBorrows },
    { count: overdueBorrows },
    { count: totalAuthors },
    { count: totalCategories },
    { count: totalPublishers },
    { data: borrowsWithFines },
    { data: categoriesList },
    { data: booksList },
  ] = await Promise.all([
    supabase.from("books").select("*", { count: "exact", head: true }),
    supabase.from("book_copies").select("*", { count: "exact", head: true }),
    supabase.from("book_copies").select("*", { count: "exact", head: true }).eq("status", "available"),
    supabase.from("book_borrows").select("*", { count: "exact", head: true }),
    supabase.from("book_borrows").select("*", { count: "exact", head: true }).in("status", ["borrowed", "overdue"]),
    supabase.from("book_borrows").select("*", { count: "exact", head: true }).eq("status", "overdue"),
    supabase.from("book_authors").select("*", { count: "exact", head: true }),
    supabase.from("book_categories").select("*", { count: "exact", head: true }),
    supabase.from("book_publishers").select("*", { count: "exact", head: true }),
    supabase.from("book_borrows").select("fine_amount, fine_paid").gt("fine_amount", 0),
    supabase.from("book_categories").select("id, name"),
    supabase.from("books").select("id, title, category_id"),
  ]);

  const totalFinesSum = (borrowsWithFines ?? []).reduce((acc, curr: any) => acc + Number(curr.fine_amount || 0), 0);
  const paidFinesSum = (borrowsWithFines ?? [])
    .filter((b: any) => b.fine_paid)
    .reduce((acc, curr: any) => acc + Number(curr.fine_amount || 0), 0);

  // Category distribution
  const booksPerCatMap = new Map<string, number>();
  (booksList ?? []).forEach((b: any) => {
    if (b.category_id) {
      booksPerCatMap.set(b.category_id, (booksPerCatMap.get(b.category_id) || 0) + 1);
    }
  });

  const categoryDistribution = (categoriesList ?? []).map((cat: any) => ({
    name: cat.name,
    count: booksPerCatMap.get(cat.id) || 0,
  })).filter((c) => c.count > 0);

  // Copy status breakdown
  const borrowedCopies = (totalCopies ?? 0) - (availableCopies ?? 0);

  return {
    totalBooks: totalBooks ?? 0,
    totalCopies: totalCopies ?? 0,
    availableCopies: availableCopies ?? 0,
    borrowedCopies: Math.max(0, borrowedCopies),
    totalBorrows: totalBorrows ?? 0,
    activeBorrows: activeBorrows ?? 0,
    overdueBorrows: overdueBorrows ?? 0,
    totalFines: totalFinesSum,
    paidFines: paidFinesSum,
    totalAuthors: totalAuthors ?? 0,
    totalCategories: totalCategories ?? 0,
    totalPublishers: totalPublishers ?? 0,
    categoryDistribution,
  };
}
