import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { createServiceSchema, serviceQuerySchema } from "@/lib/validations/service";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/services - List services with optional active/category filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = serviceQuerySchema.parse({
      category: searchParams.get("category") || undefined,
      active: searchParams.get("active") || undefined,
    });

    const where: Prisma.ServiceWhereInput = {};

    if (query.category) {
      where.category = query.category;
    }
    if (query.active !== undefined) {
      where.isActive = query.active;
    } else {
      // Default to active services for clients
      where.isActive = true;
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return apiSuccess({ services, total: services.length });
  } catch (error) {
    return handleApiError(error, "GET /api/services");
  }
}

/**
 * POST /api/services - Create a new service offering
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createServiceSchema.parse(body);

    logger.info("CreateService", `Creating service with slug: ${validatedData.slug}`);

    const newService = await prisma.service.create({
      data: validatedData,
    });

    return apiSuccess(newService, 201, "Service created successfully");
  } catch (error) {
    return handleApiError(error, "POST /api/services");
  }
}
