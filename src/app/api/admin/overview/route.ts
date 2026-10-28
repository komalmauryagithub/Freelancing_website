import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/authorization";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/overview - Admin-only dashboard statistics
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof Response) return authResult;

    const [totalUsers, totalLeads, totalBookings, totalProjects, totalInvoices] =
      await Promise.all([
        prisma.user.count(),
        prisma.lead.count(),
        prisma.booking.count(),
        prisma.projectRequest.count(),
        prisma.invoice.count(),
      ]);

    const recentLeads = await prisma.lead.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess({
      stats: {
        totalUsers,
        totalLeads,
        totalBookings,
        totalProjects,
        totalInvoices,
      },
      recentLeads,
      recentBookings,
    });
  } catch (error) {
    return handleApiError(error, "GET /api/admin/overview");
  }
}
