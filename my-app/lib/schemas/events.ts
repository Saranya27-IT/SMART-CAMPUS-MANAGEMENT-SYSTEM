import { z } from "zod";

export const eventCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  color: z.string().optional(),
});

export const eventSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  category_id: z.string().uuid().optional(),
  venue: z.string().min(1, "Venue is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  capacity: z.number().int().min(1, "Capacity must be at least 1"),
  registration_deadline: z.string().optional(),
  status: z.enum(["draft", "upcoming", "ongoing", "completed", "cancelled"]).optional(),
  is_public: z.boolean().optional(),
  allow_faculty: z.boolean().optional(),
});

export const eventRegistrationSchema = z.object({
  event_id: z.string().uuid(),
});

export const checkInSchema = z.object({
  event_id: z.string().uuid(),
  qr_code: z.string().min(1, "QR code is required"),
});

export const certificateSchema = z.object({
  registration_id: z.string().uuid(),
});

export type EventInput = z.infer<typeof eventSchema>;
export type EventRegistrationInput = z.infer<typeof eventRegistrationSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
