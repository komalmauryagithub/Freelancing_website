import { z } from "zod";

export const createServiceSchema = z.object({
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug is too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
  title: z.string().min(2, "Title must be at least 2 characters").max(100),
  shortDesc: z.string().min(10, "Short description must be at least 10 characters").max(300),
  fullDesc: z.string().min(20, "Full description must be at least 20 characters"),
  category: z.string().min(2).max(60),
  iconName: z.string().min(1, "Icon name is required"),
  priceStartingAt: z.number().int().positive().optional().nullable(),
  turnaroundTime: z.string().optional().nullable(),
  deliverables: z.array(z.string()).min(1, "At least one deliverable is required"),
  processSteps: z.array(z.string()).min(1, "At least one process step is required"),
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const updateServiceSchema = createServiceSchema.partial();

export const serviceQuerySchema = z.object({
  category: z.string().optional(),
  active: z
    .string()
    .optional()
    .transform((val) => (val === "true" ? true : val === "false" ? false : undefined)),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type ServiceQueryInput = z.infer<typeof serviceQuerySchema>;
