import { z } from "zod";

export const busStatusEnum = z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE", "BREAKDOWN"]);
export const routeStatusEnum = z.enum(["ACTIVE", "INACTIVE"]);
export const tripStatusEnum = z.enum(["SCHEDULED", "STARTED", "ON_ROUTE", "DELAYED", "COMPLETED", "CANCELLED"]);
export const complaintCategoryEnum = z.enum([
  "Breakdown",
  "Engine",
  "Tyre",
  "Brake",
  "Electrical",
  "AC",
  "Accident",
  "Other",
]);
export const complaintStatusEnum = z.enum([
  "PENDING",
  "ACKNOWLEDGED",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED",
]);

// ── Bus Schema ─────────────────────────────────────────────────────────────
export const busSchema = z.object({
  bus_number: z.string().min(1, "Bus number is required").max(30, "Bus number too long"),
  registration_number: z.string().min(1, "Registration number is required").max(50, "Registration number too long"),
  capacity: z.coerce.number().int().positive("Capacity must be greater than 0"),
  model: z.string().optional(),
  status: busStatusEnum.default("ACTIVE"),
  driver_id: z.string().uuid("Invalid driver selection").nullable().optional(),
  route_id: z.string().uuid("Invalid route selection").nullable().optional(),
  starting_area: z.string().optional(),
  destination: z.string().optional(),
});

// ── Route Schema ───────────────────────────────────────────────────────────
export const routeSchema = z.object({
  name: z.string().min(2, "Route name must be at least 2 characters").max(100),
  starting_area: z.string().min(2, "Starting area is required"),
  destination: z.string().min(2, "Destination is required"),
  college: z.string().default("K.S.R. College"),
  description: z.string().optional(),
  status: routeStatusEnum.default("ACTIVE"),
});

// ── Stop Schema ────────────────────────────────────────────────────────────
export const stopSchema = z.object({
  route_id: z.string().uuid("Route ID is required"),
  name: z.string().min(2, "Stop name is required"),
  sequence_number: z.coerce.number().int().positive("Sequence number must be a positive integer"),
  expected_arrival_time: z.string().min(1, "Expected arrival time is required"),
  expected_departure_time: z.string().optional(),
  address: z.string().optional(),
});

// ── Student Bus Allocation Schema ──────────────────────────────────────────
export const studentBusAllocationSchema = z.object({
  student_id: z.string().uuid("Student ID is required"),
  bus_id: z.string().uuid("Bus ID is required"),
  route_id: z.string().uuid("Route ID is required"),
  stop_id: z.string().uuid("Stop ID is required").nullable().optional(),
});

// ── Driver Trip Status Update Schema ────────────────────────────────────────
export const tripStatusUpdateSchema = z.object({
  trip_id: z.string().uuid("Trip ID is required"),
  status: tripStatusEnum,
  notes: z.string().optional(),
});

// ── Driver Bus Complaint Schema ─────────────────────────────────────────────
export const busComplaintSchema = z.object({
  bus_id: z.string().uuid("Bus ID is required"),
  category: complaintCategoryEnum,
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters long").max(1000),
});

// ── Admin Complaint Update Schema ───────────────────────────────────────────
export const adminComplaintUpdateSchema = z.object({
  complaint_id: z.string().uuid("Complaint ID is required"),
  status: complaintStatusEnum,
  admin_remarks: z.string().optional(),
});

export type BusFormValues = z.infer<typeof busSchema>;
export type RouteFormValues = z.infer<typeof routeSchema>;
export type StopFormValues = z.infer<typeof stopSchema>;
export type StudentBusAllocationValues = z.infer<typeof studentBusAllocationSchema>;
export type TripStatusUpdateValues = z.infer<typeof tripStatusUpdateSchema>;
export type BusComplaintValues = z.infer<typeof busComplaintSchema>;
export type AdminComplaintUpdateValues = z.infer<typeof adminComplaintUpdateSchema>;
