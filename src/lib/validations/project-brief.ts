import { z } from "zod";

export const projectBriefSchema = z.object({
  projectType: z.enum([
    "business_website",
    "dynamic_application",
    "crm_admin_panel",
    "ecommerce",
    "dashboard",
    "custom",
  ], {
    errorMap: () => ({ message: "Please select a valid project type." }),
  }),
  selectedFeatures: z
    .array(z.string())
    .min(1, "Please select at least one feature for your project."),
  requirements: z
    .string()
    .trim()
    .min(15, "Please provide at least 15 characters describing your requirements.")
    .max(5000, "Requirements text is too long."),
  indicativeBudget: z.string().min(1, "Please choose an indicative budget range."),
  timeline: z.string().min(1, "Please select an expected timeline."),
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(100),
  email: z.string().trim().email("Please provide a valid contact email address.").toLowerCase(),
  company: z.string().trim().max(100).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  attachments: z.array(z.string()).default([]),
  idempotencyKey: z.string().optional(),
});

export type ProjectBriefInput = z.infer<typeof projectBriefSchema>;
