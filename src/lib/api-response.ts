import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logger } from "@/lib/logger";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]> | string[];
  errorCode?: string;
}

export function apiSuccess<T>(data: T, status = 200, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

export function apiError(
  message: string,
  status = 500,
  errors?: Record<string, string[]> | string[],
  errorCode?: string
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
      errorCode,
    },
    { status }
  );
}

export function handleApiError(error: unknown, context: string): NextResponse<ApiResponse> {
  // 1. Zod Validation Errors
  if (error instanceof ZodError) {
    const formattedErrors: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const path = issue.path.join(".") || "body";
      if (!formattedErrors[path]) {
        formattedErrors[path] = [];
      }
      formattedErrors[path].push(issue.message);
    }

    logger.warn(context, "Validation failure", { errors: formattedErrors });

    return apiError("Validation failed. Please verify your inputs.", 400, formattedErrors, "VALIDATION_ERROR");
  }

  // 2. Prisma Known Errors
  if (typeof error === "object" && error !== null && "code" in error) {
    const prismaError = error as { code: string; meta?: Record<string, unknown>; message?: string };

    logger.error(context, `Database error code: ${prismaError.code}`, error);

    // P2002: Unique constraint failed
    if (prismaError.code === "P2002") {
      const target = (prismaError.meta?.target as string[]) || ["field"];
      return apiError(
        `A record with this ${target.join(", ")} already exists.`,
        409,
        undefined,
        "CONFLICT"
      );
    }

    // P2025: Record not found
    if (prismaError.code === "P2025") {
      return apiError("Requested resource was not found.", 404, undefined, "NOT_FOUND");
    }

    // P2003: Foreign key constraint failure
    if (prismaError.code === "P2003") {
      return apiError("Referenced relationship is invalid or missing.", 400, undefined, "FOREIGN_KEY_ERROR");
    }
  }

  // 3. Generic / Internal errors
  logger.error(context, "Unhandled server error", error);

  return apiError(
    process.env.NODE_ENV === "production"
      ? "An unexpected internal server error occurred."
      : error instanceof Error
      ? error.message
      : "Internal server error",
    500,
    undefined,
    "INTERNAL_SERVER_ERROR"
  );
}
