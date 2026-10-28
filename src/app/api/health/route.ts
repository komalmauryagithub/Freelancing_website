import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus: "connected" | "disconnected" = "disconnected";
  let latencyMs = 0;

  try {
    // Perform a lightweight query to verify database connectivity
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
    latencyMs = Date.now() - startTime;
  } catch (error) {
    logger.warn("HealthCheck", "Database connectivity check failed", {
      reason: error instanceof Error ? error.message : "Unknown",
    });
    dbStatus = "disconnected";
  }

  const isHealthy = dbStatus === "connected";

  const responseBody = {
    status: isHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      latencyMs: isHealthy ? latencyMs : null,
    },
    version: "1.0.0",
  };

  return NextResponse.json(responseBody, {
    status: isHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
