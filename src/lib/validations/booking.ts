import { z } from "zod";

export const createBookingSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please provide a valid email address"),
  topic: z.string().trim().min(3, "Topic must be at least 3 characters").max(150),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  scheduledAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Valid ISO date/time string is required",
  }),
  durationMinutes: z.number().int().min(15).max(120).default(30),
  timezone: z.string().default("UTC"),
});

export const rescheduleBookingSchema = z.object({
  scheduledAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Valid ISO date/time string is required",
  }),
  timezone: z.string().optional(),
  reason: z.string().max(500).optional(),
});

export const cancelBookingSchema = z.object({
  reason: z.string().min(3, "Please provide a reason for cancellation").max(500),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type RescheduleBookingInput = z.infer<typeof rescheduleBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
