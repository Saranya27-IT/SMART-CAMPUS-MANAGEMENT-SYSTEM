import { z } from "zod";

export const bookCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional().nullable(),
});

export const bookAuthorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Author name is required"),
  bio: z.string().optional().nullable(),
});

export const bookPublisherSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Publisher name is required"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")).nullable(),
});

export const bookSchema = z.object({
  id: z.string().optional(),
  isbn: z.string().optional().nullable(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  cover_url: z.string().optional().nullable(),
  category_id: z.string().optional().nullable(),
  author_id: z.string().optional().nullable(),
  author_name: z.string().optional().nullable(),
  publisher_id: z.string().optional().nullable(),
  publisher_name: z.string().optional().nullable(),
  publication_year: z.coerce.number().int().min(1000).max(new Date().getFullYear() + 1).optional().nullable(),
  edition: z.string().optional().nullable(),
  language: z.string().optional().nullable(),
  total_copies: z.coerce.number().int().min(1, "At least 1 copy required"),
  location_shelf: z.string().optional().nullable(),
});

export const bookCopySchema = z.object({
  id: z.string().optional(),
  book_id: z.string().min(1, "Book is required"),
  copy_number: z.string().min(1, "Copy number is required"),
  qr_code: z.string().optional().nullable(),
  status: z.enum(["available", "borrowed", "overdue", "damaged", "lost", "maintenance"]),
  location: z.string().optional().nullable(),
  condition: z.string().optional().nullable(),
});

export const borrowSchema = z.object({
  copy_id: z.string().min(1, "Physical copy is required"),
  book_id: z.string().min(1, "Book is required"),
  student_id: z.string().min(1, "Borrower is required"),
  due_date: z.string().min(1, "Due date is required"),
  notes: z.string().optional().nullable(),
});

export const returnSchema = z.object({
  borrow_id: z.string().min(1, "Borrow record is required"),
  notes: z.string().optional().nullable(),
});

export const renewalSchema = z.object({
  borrow_id: z.string().min(1, "Borrow record is required"),
});

export const finePaymentSchema = z.object({
  borrow_id: z.string().min(1, "Borrow record is required"),
  action: z.enum(["pay", "waive"]),
  amount: z.number().min(0).optional(),
});

export type BookInput = z.infer<typeof bookSchema>;
export type BookCopyInput = z.infer<typeof bookCopySchema>;
export type BorrowInput = z.infer<typeof borrowSchema>;
export type ReturnInput = z.infer<typeof returnSchema>;
export type BookCategoryInput = z.infer<typeof bookCategorySchema>;
export type BookAuthorInput = z.infer<typeof bookAuthorSchema>;
export type BookPublisherInput = z.infer<typeof bookPublisherSchema>;
