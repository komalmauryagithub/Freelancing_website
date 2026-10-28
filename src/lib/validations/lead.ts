import { z } from "zod";

export const createLeadSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please provide a valid email address"),
  company: z.string().trim().max(100).optional().or(z.literal("")),
  budgetRange: z.string().optional().or(z.literal("")),
  timeline: z.string().optional().or(z.literal("")),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(3000),
  source: z.string().max(50).optional().default("contact_form"),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
