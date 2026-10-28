import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { updateServiceSchema } from "@/lib/validations/service";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ idOrSlug: string }>;
}

async function findServiceByIdOrSlug(idOrSlug: string) {
  return prisma.service.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
  });
}

/**
 * GET /api/services/[idOrSlug] - Get single service
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { idOrSlug } = await params;
    const service = await findServiceByIdOrSlug(idOrSlug);

    if (!service) {
      return apiError("Service not found", 404, undefined, "NOT_FOUND");
    }

    return apiSuccess(service);
  } catch (error) {
    return handleApiError(error, "GET /api/services/[idOrSlug]");
  }
}

/**
 * PUT /api/services/[idOrSlug] - Update service
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { idOrSlug } = await params;
    const existing = await findServiceByIdOrSlug(idOrSlug);

    if (!existing) {
      return apiError("Service not found", 404, undefined, "NOT_FOUND");
    }

    const body = await request.json();
    const validatedData = updateServiceSchema.parse(body);

    logger.info("UpdateService", `Updating service ID: ${existing.id}`);

    const updated = await prisma.service.update({
      where: { id: existing.id },
      data: validatedData,
    });

    return apiSuccess(updated, 200, "Service updated successfully");
  } catch (error) {
    return handleApiError(error, "PUT /api/services/[idOrSlug]");
  }
}

/**
 * DELETE /api/services/[idOrSlug] - Delete service
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { idOrSlug } = await params;
    const existing = await findServiceByIdOrSlug(idOrSlug);

    if (!existing) {
      return apiError("Service not found", 404, undefined, "NOT_FOUND");
    }

    logger.warn("DeleteService", `Deleting service ID: ${existing.id} (${existing.slug})`);

    await prisma.service.delete({
      where: { id: existing.id },
    });

    return apiSuccess({ id: existing.id, slug: existing.slug }, 200, "Service deleted successfully");
  } catch (error) {
    return handleApiError(error, "DELETE /api/services/[idOrSlug]");
  }
}
