import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAuth } from "@/lib/authorization";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createProjectRequestSchema = z.object({
  title: z.string().min(3).max(150),
  description: z.string().min(10).max(3000),
  serviceId: z.string().optional(),
  budget: z.string().optional(),
});

/**
 * GET /api/portal/projects - List project requests belonging strictly to the current client
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;

    // Enforce isolation: regular clients only see their own projects; admins see all
    const where = user.role === "ADMIN" ? {} : { userId: user.id };

    const projectRequests = await prisma.projectRequest.findMany({
      where,
      include: {
        service: { select: { title: true, slug: true } },
        proposals: { select: { id: true, title: true, totalAmount: true, status: true } },
        invoices: { select: { id: true, invoiceNumber: true, total: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess({ projectRequests });
  } catch (error) {
    return handleApiError(error, "GET /api/portal/projects");
  }
}

/**
 * POST /api/portal/projects - Client creates project request attached to their user ID
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    const body = await request.json();
    const validatedData = createProjectRequestSchema.parse(body);

    const projectRequest = await prisma.projectRequest.create({
      data: {
        userId: user.id, // Strictly bind to authenticated user
        title: validatedData.title,
        description: validatedData.description,
        serviceId: validatedData.serviceId || null,
        budget: validatedData.budget || null,
        status: "SUBMITTED",
      },
    });

    return apiSuccess(projectRequest, 201, "Project request created successfully");
  } catch (error) {
    return handleApiError(error, "POST /api/portal/projects");
  }
}
