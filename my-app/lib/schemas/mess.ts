import { z } from "zod";

export const messMenuSchema = z.object({
  date: z.string().min(1, "Date is required"),
  meal_type: z.enum(["breakfast", "lunch", "snacks", "dinner"]),
  items: z
    .array(z.string().min(1, "Item cannot be empty"))
    .min(1, "At least one item is required"),
});

export const messAttendanceSchema = z.object({
  student_id: z.string().uuid(),
  date: z.string(),
  meal_type: z.enum(["breakfast", "lunch", "snacks", "dinner"]),
  present: z.boolean(),
});

export const messFeedbackSchema = z.object({
  date: z.string().min(1, "Date is required"),
  meal_type: z.enum(["breakfast", "lunch", "snacks", "dinner"]),
  rating: z.number().int().min(1, "Rating must be at least 1 star").max(5, "Rating cannot exceed 5 stars"),
  comment: z.string().max(500, "Comment cannot exceed 500 characters").optional(),
});

export const messComplaintSchema = z.object({
  description: z.string().min(10, "Please provide a detailed description (min 10 characters)"),
  category: z.enum(["quality", "hygiene", "quantity", "service", "other"]),
  meal_date: z.string().optional(),
  meal_type: z.enum(["breakfast", "lunch", "snacks", "dinner"]).optional(),
});

export const complaintUpdateSchema = z.object({
  complaint_id: z.string().uuid(),
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
  resolution_remarks: z.string().optional(),
});

export const messSuggestionSchema = z.object({
  suggestion: z.string().min(5, "Please provide a suggestion (min 5 characters)"),
});

export type MessMenuInput = z.infer<typeof messMenuSchema>;
export type MessFeedbackInput = z.infer<typeof messFeedbackSchema>;
export type MessComplaintInput = z.infer<typeof messComplaintSchema>;
export type MessAttendanceInput = z.infer<typeof messAttendanceSchema>;
export type MessSuggestionInput = z.infer<typeof messSuggestionSchema>;

