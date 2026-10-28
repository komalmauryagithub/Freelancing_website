import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { registerSchema } from "@/lib/validations/auth";
import {
  hashPassword,
  createSession,
  getSessionCookieAttributes,
  sanitizeUser,
} from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limiter";
import { logger } from "@/lib/logger";
import { UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

    // 1. Rate Limiting: Max 5 registration attempts per 15 minutes per IP
    const rateLimit = checkRateLimit(clientIp, {
      keyPrefix: "auth_register",
      maxRequests: 5,
      windowSeconds: 15 * 60,
    });

    if (!rateLimit.success) {
      logger.warn("AuthRegister", `Rate limit exceeded for IP: ${clientIp}`);
      return apiError(
        `Too many registration attempts. Please try again in ${rateLimit.resetSeconds} seconds.`,
        429,
        undefined,
        "RATE_LIMITED"
      );
    }

    // 2. Validate inputs
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // 3. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      // Return safe message without leaking details
      return apiError(
        "An account with this email already exists.",
        409,
        undefined,
        "USER_EXISTS"
      );
    }

    // 4. Hash password securely
    const passwordHash = await hashPassword(validatedData.password);

    // 5. Create user strictly as CLIENT role
    const newUser = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        passwordHash,
        role: UserRole.CLIENT, // Enforce CLIENT role — never trust client input
      },
    });

    logger.info("AuthRegister", `New client registered: ${newUser.id}`);

    // 6. Create session
    const userAgent = request.headers.get("user-agent") || undefined;
    const { token, expiresAt } = await createSession(newUser.id, clientIp, userAgent);

    // 7. Prepare response with secure session cookie
    const response = apiSuccess(
      {
        user: sanitizeUser(newUser),
      },
      201,
      "Account registered successfully"
    );

    const cookieAttributes = getSessionCookieAttributes(expiresAt, token);
    response.cookies.set(cookieAttributes.name, token, {
      httpOnly: cookieAttributes.httpOnly,
      secure: cookieAttributes.secure,
      sameSite: cookieAttributes.sameSite,
      path: cookieAttributes.path,
      expires: cookieAttributes.expires,
    });

    return response;
  } catch (error) {
    return handleApiError(error, "POST /api/auth/register");
  }
}
