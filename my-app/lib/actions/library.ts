"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { LIBRARY } from "@/lib/constants";
import { addDays, differenceInDays, format } from "date-fns";
import type { BookInput, BorrowInput } from "@/lib/schemas/library";

// ── Books ────────────────────────────────────────────────────────────────────

export async function getBooks(query?: string) {
  const supabase = await createClient();
  let q = supabase
    .from("books")
    .select(`
      *,
      book_categories(id, name),
      book_authors(id, name),
      book_publishers(id, name)
    `)
    .order("title", { ascending: true });

  if (query) {
    q = q.ilike("title", `%${query}%`);
  }

  const { data, error } = await q;
  return { data: (data ?? []) as any[], error };
}

export async function getBook(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select(`
      *,
      book_categories(id, name),
      book_authors(id, name),
      book_publishers(id, name),
      book_copies(*)
    `)
    .eq("id", id)
    .single();
  return { data: data as any, error };
}

export async function createBook(input: BookInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  let finalAuthorId = input.author_id || null;
  if (!finalAuthorId && input.author_name && input.author_name.trim()) {
    const name = input.author_name.trim();
    const { data: existingAuthor } = await supabase
      .from("book_authors")
      .select("id")
      .ilike("name", name)
      .maybeSingle();

    if (existingAuthor) {
      finalAuthorId = existingAuthor.id;
    } else {
      const { data: newAuthor } = await supabase
        .from("book_authors")
        .insert({ name } as never)
        .select("id")
        .single();
      if (newAuthor) finalAuthorId = newAuthor.id;
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
      finalPublisherId = existingPublisher.id;
    } else {
      const { data: newPublisher } = await supabase
        .from("book_publishers")
        .insert({ name } as never)
        .select("id")
        .single();
      if (newPublisher) finalPublisherId = newPublisher.id;
    }
  }

  const { author_name, publisher_name, ...bookData } = input;

  const { data, error } = await supabase
    .from("books")
    .insert({
      ...bookData,
      author_id: finalAuthorId,
      publisher_id: finalPublisherId,
      available_copies: input.total_copies,
    } as never)
    .select()
    .single();

  const created = data as any;
  if (!error && created) {
    // Create copies automatically
    const copies = Array.from({ length: input.total_copies }, (_, i) => ({
      book_id: created.id,
      copy_number: `${String(i + 1).padStart(3, "0")}`,
      qr_code: `${created.id}-COPY-${i + 1}`,
      status: "available",
    }));
    await supabase.from("book_copies").insert(copies as never);

    // Audit log
    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      action: "CREATE_BOOK",
      entity_type: "books",
      entity_id: created.id,
      metadata: { title: input.title },
    } as never);

    revalidatePath("/library/books");
  }

  return { data: created, error: error?.message };
}

export async function updateBook(id: string, input: Partial<BookInput>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("books")
    .update(input as never)
    .eq("id", id)
    .select()
    .single();

  if (!error) {
    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      action: "UPDATE_BOOK",
      entity_type: "books",
      entity_id: id,
    } as never);
    revalidatePath("/library/books");
    revalidatePath(`/library/books/${id}`);
  }

  return { data: data as any, error: error?.message };
}

export async function deleteBook(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("books").delete().eq("id", id);
  if (!error) {
    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      action: "DELETE_BOOK",
      entity_type: "books",
      entity_id: id,
    } as never);
    revalidatePath("/library/books");
  }
  return { error: error?.message };
}

// ── Categories / Authors / Publishers ────────────────────────────────────────

export async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase.from("book_categories").select("*").order("name");
  return (data ?? []) as any[];
}

export async function getAuthors() {
  const supabase = await createClient();
  const { data } = await supabase.from("book_authors").select("*").order("name");
  return (data ?? []) as any[];
}

export async function getPublishers() {
  const supabase = await createClient();
  const { data } = await supabase.from("book_publishers").select("*").order("name");
  return (data ?? []) as any[];
}

export async function createCategory(name: string, description?: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("book_categories").insert({ name, description } as never).select().single();
  if (!error) revalidatePath("/library");
  return { data: data as any, error: error?.message };
}

export async function createAuthor(name: string, bio?: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("book_authors").insert({ name, bio } as never).select().single();
  if (!error) revalidatePath("/library");
  return { data: data as any, error: error?.message };
}

export async function createPublisher(name: string, website?: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("book_publishers").insert({ name, website } as never).select().single();
  if (!error) revalidatePath("/library");
  return { data: data as any, error: error?.message };
}

// ── Borrow / Return / Renew ──────────────────────────────────────────────────

export async function getBorrows(studentId?: string) {
  const supabase = await createClient();
  let q = supabase
    .from("book_borrows")
    .select(`
      *,
      books(id, title, isbn, cover_url),
      book_copies(copy_number, qr_code),
      profiles!book_borrows_student_id_fkey(full_name, roll_number, email)
    `)
    .order("created_at", { ascending: false });

  if (studentId) q = q.eq("student_id", studentId);

  const { data, error } = await q;
  return { data: (data ?? []) as any[], error };
}

export async function borrowBook(input: BorrowInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Check student has not exceeded borrow limit
  const { count: activeBorrows } = await supabase
    .from("book_borrows")
    .select("*", { count: "exact", head: true })
    .eq("student_id", input.student_id)
    .in("status", ["borrowed", "overdue"]);

  if ((activeBorrows ?? 0) >= LIBRARY.MAX_BORROWS_STUDENT) {
    return { error: `Student has reached maximum borrow limit of ${LIBRARY.MAX_BORROWS_STUDENT} books.` };
  }

  // Check copy is available
  const { data: copyData } = await supabase
    .from("book_copies")
    .select("status")
    .eq("id", input.copy_id)
    .single();

  const copy = copyData as any;
  if (copy?.status !== "available") {
    return { error: "This copy is not available for borrowing." };
  }

  // Compute due date
  const dueDate = format(addDays(new Date(), LIBRARY.BORROW_DAYS), "yyyy-MM-dd");

  const { data, error } = await supabase
    .from("book_borrows")
    .insert({
      copy_id: input.copy_id,
      book_id: input.book_id,
      student_id: input.student_id,
      librarian_id: user.id,
      due_date: dueDate,
      notes: input.notes,
    } as never)
    .select()
    .single();

  const created = data as any;
  if (!error && created) {
    // Mark copy as borrowed
    await supabase.from("book_copies").update({ status: "borrowed" } as never).eq("id", input.copy_id);
    // Fallback direct update
    const { data: bookData } = await supabase.from("books").select("available_copies").eq("id", input.book_id).single();
    const book = bookData as any;
    if (book) {
      await supabase.from("books").update({ available_copies: Math.max(0, (book.available_copies ?? 1) - 1) } as never).eq("id", input.book_id);
    }

    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      action: "BORROW_BOOK",
      entity_type: "book_borrows",
      entity_id: created.id,
      metadata: { book_id: input.book_id, student_id: input.student_id },
    } as never);

    // Notify student
    await supabase.from("notifications").insert({
      user_id: input.student_id,
      title: "Book Borrowed",
      message: `Due date: ${format(new Date(dueDate), "dd MMM yyyy")}`,
      type: "library",
    } as never);

    revalidatePath("/library/borrows");
  }

  return { data: created, error: error?.message };
}

export async function returnBook(borrowId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: borrowData } = await supabase
    .from("book_borrows")
    .select("*")
    .eq("id", borrowId)
    .single();

  const borrow = borrowData as any;
  if (!borrow) return { error: "Borrow record not found." };

  // Calculate fine
  const today = new Date();
  const dueDate = new Date(borrow.due_date);
  const overdueDays = Math.max(0, differenceInDays(today, dueDate));
  const fineAmount = overdueDays * LIBRARY.FINE_PER_DAY;

  const { error } = await supabase
    .from("book_borrows")
    .update({
      status: "returned",
      return_date: format(today, "yyyy-MM-dd"),
      fine_amount: fineAmount,
    } as never)
    .eq("id", borrowId);

  if (!error) {
    // Mark copy as available
    await supabase.from("book_copies").update({ status: "available" } as never).eq("id", borrow.copy_id);
    // Increment available_copies
    const { data: bookData } = await supabase.from("books").select("available_copies,total_copies").eq("id", borrow.book_id).single();
    const book = bookData as any;
    if (book) {
      await supabase.from("books").update({ available_copies: Math.min(book.total_copies ?? 100, (book.available_copies ?? 0) + 1) } as never).eq("id", borrow.book_id);
    }

    revalidatePath("/library/borrows");
  }
  return { error: error?.message };
}

export async function renewBook(borrowId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: borrowData } = await supabase.from("book_borrows").select("*").eq("id", borrowId).single();
  const borrow = borrowData as any;
  if (!borrow) return { error: "Borrow record not found." };

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
    revalidatePath("/library/borrows");
  }
  return { error: error?.message };
}

export async function payFine(borrowId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("book_borrows")
    .update({ fine_paid: true } as never)
    .eq("id", borrowId);

  if (!error) {
    revalidatePath("/library/borrows");
    revalidatePath("/library/fines");
  }
  return { error: error?.message };
}

export async function markFinePaid(borrowId: string) {
  return payFine(borrowId);
}

export async function getLibraryAnalytics() {
  const supabase = await createClient();
  const [
    { count: totalBooks },
    { count: totalBorrows },
    { count: activeBorrows },
    { count: overdueBorrows },
  ] = await Promise.all([
    supabase.from("books").select("*", { count: "exact", head: true }),
    supabase.from("book_borrows").select("*", { count: "exact", head: true }),
    supabase.from("book_borrows").select("*", { count: "exact", head: true }).eq("status", "borrowed"),
    supabase.from("book_borrows").select("*", { count: "exact", head: true }).eq("status", "overdue"),
  ]);

  return {
    totalBooks: totalBooks ?? 0,
    totalBorrows: totalBorrows ?? 0,
    activeBorrows: activeBorrows ?? 0,
    overdueBorrows: overdueBorrows ?? 0,
    overdue: overdueBorrows ?? 0,
    returnedThisMonth: (totalBorrows ?? 0) - (activeBorrows ?? 0),
  };
}
