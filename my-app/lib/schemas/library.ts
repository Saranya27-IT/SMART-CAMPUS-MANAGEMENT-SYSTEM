import { z } from "zod";

export const bookCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
});

export const bookAuthorSchema = z.object({
  name: z.string().min(1, "Author name is required"),
  bio: z.string().optional(),
});

export const bookPublisherSchema = z.object({
  name: z.string().min(1, "Publisher name is required"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export const bookSchema = z.object({
  isbn: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category_id: z.string().uuid("Invalid category").optional().or(z.literal("")),
  author_id: z.string().uuid("Invalid author").optional().or(z.literal("")),
  author_name: z.string().optional(),
  publisher_id: z.string().uuid("Invalid publisher").optional().or(z.literal("")),
  publisher_name: z.string().optional(),
  publication_year: z.number().int().min(1000).max(new Date().getFullYear()).optional(),
  edition: z.string().optional(),
  total_copies: z.number().int().min(1, "At least 1 copy required"),
  location_shelf: z.string().optional(),
});

export const borrowSchema = z.object({
  copy_id: z.string().uuid("Invalid copy"),
  book_id: z.string().uuid("Invalid book"),
  student_id: z.string().uuid("Invalid student"),
  due_date: z.string().min(1, "Due date is required"),
  notes: z.string().optional(),
});

export const returnSchema = z.object({
  borrow_id: z.string().uuid(),
  notes: z.string().optional(),
});

export const renewalSchema = z.object({
  borrow_id: z.string().uuid(),
});

export const finePaymentSchema = z.object({
  borrow_id: z.string().uuid(),
  amount: z.number().min(0),
});

export type BookInput = z.infer<typeof bookSchema>;
export type BorrowInput = z.infer<typeof borrowSchema>;
export type ReturnInput = z.infer<typeof returnSchema>;
export type BookCategoryInput = z.infer<typeof bookCategorySchema>;
export type BookAuthorInput = z.infer<typeof bookAuthorSchema>;
export type BookPublisherInput = z.infer<typeof bookPublisherSchema>;
