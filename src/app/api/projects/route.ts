import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { createProjectSchema, projectQuerySchema } from "@/lib/validations/project";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/projects - List portfolio projects with filtering, search and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = projectQuerySchema.parse({
      category: searchParams.get("category") || undefined,
      featured: searchParams.get("featured") || undefined,
      published: searchParams.get("published") || undefined,
      search: searchParams.get("search") || undefined,
      limit: searchParams.get("limit") || undefined,
      page: searchParams.get("page") || undefined,
    });

    const where: Prisma.PortfolioProjectWhereInput = {};

    if (query.category) {
      where.category = query.category;
    }
    if (query.featured !== undefined) {
      where.isFeatured = query.featured;
    }
    if (query.published !== undefined) {
      where.isPublished = query.published;
    } else {
      // Default to only published projects for public consumption unless explicitly requested
      where.isPublished = true;
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
        { tagline: { contains: query.search, mode: "insensitive" } },
        { technologies: { has: query.search } },
      ];
    }

    const skip = (query.page - 1) * query.limit;

    const [total, projects] = await Promise.all([
      prisma.portfolioProject.count({ where }),
      prisma.portfolioProject.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip,
        take: query.limit,
      }),
    ]);

    return apiSuccess({
      projects,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    return handleApiError(error, "GET /api/projects");
  }
}

/**
 * POST /api/projects - Create a new portfolio project
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createProjectSchema.parse(body);

    logger.info("CreateProject", `Creating project with slug: ${validatedData.slug}`);

    const newProject = await prisma.portfolioProject.create({
      data: validatedData,
    });

    return apiSuccess(newProject, 201, "Portfolio project created successfully");
  } catch (error) {
    return handleApiError(error, "POST /api/projects");
  }
}
