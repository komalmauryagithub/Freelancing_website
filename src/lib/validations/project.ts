import { z } from "zod";

export const ProjectCategoryEnum = z.enum([
  "DYNAMIC_WEB_APPS",
  "ECOMMERCE",
  "ADMIN_CRM",
  "BUSINESS_WEBSITES",
  "API_INTEGRATION",
  "REDESIGN_PERFORMANCE",
]);

export const createProjectSchema = z.object({
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug is too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
  title: z.string().min(2, "Title must be at least 2 characters").max(120),
  tagline: z.string().min(5, "Tagline must be at least 5 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: ProjectCategoryEnum,
  clientName: z.string().max(100).optional().nullable(),
  liveUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")).nullable(),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")).nullable(),
  coverImage: z.string().min(1, "Cover image path or URL is required"),
  images: z.array(z.string()).default([]),
  technologies: z.array(z.string()).min(1, "At least one technology is required"),
  challenge: z.string().optional().nullable(),
  solution: z.string().optional().nullable(),
  features: z.array(z.string()).default([]),
  sampleMetrics: z.array(z.string()).default([]),
  sortOrder: z.number().int().default(0),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});

export const updateProjectSchema = createProjectSchema.partial();

export const projectQuerySchema = z.object({
  category: ProjectCategoryEnum.optional(),
  featured: z
    .string()
    .optional()
    .transform((val) => (val === "true" ? true : val === "false" ? false : undefined)),
  published: z
    .string()
    .optional()
    .transform((val) => (val === "true" ? true : val === "false" ? false : undefined)),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  page: z.coerce.number().int().min(1).default(1),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;
