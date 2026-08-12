import { z } from "zod";

export const hostelSchema = z.object({
  name: z.string().min(1, "Hostel name is required"),
  type: z.enum(["male", "female", "mixed"]),
  warden_id: z.string().uuid().optional(),
  address: z.string().optional(),
});

export const hostelBlockSchema = z.object({
  hostel_id: z.string().uuid(),
  name: z.string().min(1, "Block name is required"),
});

export const hostelFloorSchema = z.object({
  block_id: z.string().uuid(),
  floor_number: z.number().int().min(0),
});

export const hostelRoomSchema = z.object({
  floor_id: z.string().uuid(),
  room_number: z.string().min(1, "Room number is required"),
  capacity: z.number().int().min(1, "Capacity must be at least 1").max(20, "Capacity cannot exceed 20"),
  type: z.enum(["single", "shared", "dormitory"]),
});

export const hostelBedSchema = z.object({
  room_id: z.string().uuid(),
  bed_number: z.string().min(1, "Bed number is required"),
  status: z.enum(["available", "occupied", "maintenance"]).optional(),
});

export const bedAllocationSchema = z.object({
  bed_id: z.string().uuid({ message: "Bed selection is required" }),
  student_id: z.string().uuid({ message: "Student selection is required" }),
});

export const leaveRequestSchema = z
  .object({
    hostel_id: z.string().uuid({ message: "Hostel is required" }),
    from_date: z.string().min(1, "From date is required"),
    to_date: z.string().min(1, "To date is required"),
    reason: z.string().min(5, "Please provide a reason (minimum 5 characters)"),
    destination: z.string().optional(),
    additional_details: z.string().optional(),
  })
  .refine((data) => new Date(data.from_date) <= new Date(data.to_date), {
    message: "From date cannot be after To date",
    path: ["to_date"],
  });

export const leaveApprovalSchema = z
  .object({
    leave_id: z.string().uuid(),
    status: z.enum(["approved", "rejected"]),
    warden_remark: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.status === "rejected") {
        return !!data.warden_remark && data.warden_remark.trim().length > 0;
      }
      return true;
    },
    {
      message: "Rejection reason is required when rejecting a leave request",
      path: ["warden_remark"],
    }
  );

export const hostelComplaintSchema = z.object({
  hostel_id: z.string().uuid({ message: "Hostel selection is required" }),
  category: z.enum(["maintenance", "cleanliness", "food", "security", "noise", "other"]),
  description: z.string().min(10, "Please provide a detailed description (min 10 characters)"),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
});

export const hostelAttendanceSchema = z.object({
  student_id: z.string().uuid(),
  hostel_id: z.string().uuid(),
  date: z.string(),
  status: z.enum(["present", "absent", "on_leave"]),
});

export const hostelFeeSchema = z
  .object({
    student_id: z.string().uuid({ message: "Student is required" }),
    hostel_id: z.string().uuid({ message: "Hostel is required" }),
    period: z.string().min(1, "Fee period is required"),
    amount: z.number().min(0, "Fee amount cannot be negative"),
    paid_amount: z.number().min(0, "Paid amount cannot be negative").default(0),
    due_date: z.string().min(1, "Due date is required"),
  })
  .refine((data) => data.paid_amount <= data.amount, {
    message: "Paid amount cannot be greater than total fee amount",
    path: ["paid_amount"],
  });

export type HostelInput = z.infer<typeof hostelSchema>;
export type LeaveRequestInput = z.infer<typeof leaveRequestSchema>;
export type LeaveApprovalInput = z.infer<typeof leaveApprovalSchema>;
export type HostelComplaintInput = z.infer<typeof hostelComplaintSchema>;
export type BedAllocationInput = z.infer<typeof bedAllocationSchema>;
export type HostelFeeInput = z.infer<typeof hostelFeeSchema>;

