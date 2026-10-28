import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { updateProjectSchema } from "@/lib/validations/project";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ idOrSlug: string }>;
}

/**
 * Helper to find project by slug or ID
 */
async function findProjectByIdOrSlug(idOrSlug: string) {
  return prisma.portfolioProject.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
  });
}

/**
 * GET /api/projects/[idOrSlug] - Retrieve a single project
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { idOrSlug } = await params;
    const project = await findProjectByIdOrSlug(idOrSlug);

    if (!project) {
      return apiError("Project not found", 404, undefined, "NOT_FOUND");
    }

    return apiSuccess(project);
  } catch (error) {
    return handleApiError(error, "GET /api/projects/[idOrSlug]");
  }
}

/**
 * PUT /api/projects/[idOrSlug] - Update an existing project
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { idOrSlug } = await params;
    const existing = await findProjectByIdOrSlug(idOrSlug);

    if (!existing) {
      return apiError("Project not found", 404, undefined, "NOT_FOUND");
    }

    const body = await request.json();
    const validatedData = updateProjectSchema.parse(body);

    logger.info("UpdateProject", `Updating project ID: ${existing.id}`);

    const updated = await prisma.portfolioProject.update({
      where: { id: existing.id },
      data: validatedData,
    });

    return apiSuccess(updated, 200, "Project updated successfully");
  } catch (error) {
    return handleApiError(error, "PUT /api/projects/[idOrSlug]");
  }
}

/**
 * DELETE /api/projects/[idOrSlug] - Delete a project
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { idOrSlug } = await params;
    const existing = await findProjectByIdOrSlug(idOrSlug);

    if (!existing) {
      return apiError("Project not found", 404, undefined, "NOT_FOUND");
    }

    logger.warn("DeleteProject", `Deleting project ID: ${existing.id} (${existing.slug})`);

    await prisma.portfolioProject.delete({
      where: { id: existing.id },
    });

    return apiSuccess({ id: existing.id, slug: existing.slug }, 200, "Project deleted successfully");
  } catch (error) {
    return handleApiError(error, "DELETE /api/projects/[idOrSlug]");
  }
}
