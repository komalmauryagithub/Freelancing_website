import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { loginSchema } from "@/lib/validations/auth";
import {
  verifyPassword,
  createSession,
  getSessionCookieAttributes,
  sanitizeUser,
} from "@/lib/auth";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limiter";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

    // 1. Rate Limiting: Max 5 attempts per 15 minutes
    const rateLimit = checkRateLimit(clientIp, {
      keyPrefix: "auth_login",
      maxRequests: 5,
      windowSeconds: 15 * 60,
    });

    if (!rateLimit.success) {
      logger.warn("AuthLogin", `Rate limit exceeded for IP: ${clientIp}`);
      return apiError(
        `Too many login attempts. Please try again in ${rateLimit.resetSeconds} seconds.`,
        429,
        undefined,
        "RATE_LIMITED"
      );
    }

    // 2. Validate inputs
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    // 3. Look up user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    // Safe timing-resistant check: always perform a bcrypt compare simulation if user or hash is missing
    const dummyHash = "$2a$12$e8pA7QO8wB6yFkY32Xg5yeqX8tZ.v/F6gE5dC2bA1a0zY8xW7vU6u";
    const passwordHashToCompare = user?.passwordHash || dummyHash;

    const isPasswordValid = await verifyPassword(validatedData.password, passwordHashToCompare);

    if (!user || !user.passwordHash || !isPasswordValid) {
      logger.warn("AuthLogin", `Failed login attempt for email: ${validatedData.email} from IP: ${clientIp}`);
      // Safe error message that does not reveal if account exists
      return apiError("Invalid email or password.", 401, undefined, "INVALID_CREDENTIALS");
    }

    // Reset rate limiter on successful login
    resetRateLimit("auth_login", clientIp);

    logger.info("AuthLogin", `Successful login for user: ${user.id} (${user.role})`);

    // 4. Create server-side session
    const userAgent = request.headers.get("user-agent") || undefined;
    const { token, expiresAt } = await createSession(user.id, clientIp, userAgent);

    // 5. Send response with secure session cookie
    const response = apiSuccess(
      {
        user: sanitizeUser(user),
      },
      200,
      "Logged in successfully"
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
    return handleApiError(error, "POST /api/auth/login");
  }
}
