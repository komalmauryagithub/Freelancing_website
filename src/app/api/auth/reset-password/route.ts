import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { resetPasswordSchema } from "@/lib/validations/auth";
import {
  hashPassword,
  consumeVerificationToken,
  revokeAllUserSessions,
} from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limiter";
import { logger } from "@/lib/logger";
import { TokenType } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

    const rateLimit = checkRateLimit(clientIp, {
      keyPrefix: "auth_reset_pw",
      maxRequests: 5,
      windowSeconds: 15 * 60,
    });

    if (!rateLimit.success) {
      return apiError(
        `Too many password reset attempts. Please try again in ${rateLimit.resetSeconds} seconds.`,
        429,
        undefined,
        "RATE_LIMITED"
      );
    }

    const body = await request.json();
    const validatedData = resetPasswordSchema.parse(body);

    // 1. Consume token atomically
    const tokenRecord = await consumeVerificationToken(
      validatedData.token,
      TokenType.PASSWORD_RESET
    );

    if (!tokenRecord) {
      logger.warn("AuthResetPassword", `Invalid or expired reset token attempt from IP: ${clientIp}`);
      return apiError(
        "Invalid or expired password reset link. Please request a new one.",
        400,
        undefined,
        "INVALID_TOKEN"
      );
    }

    // 2. Find user by identifier (email)
    const user = await prisma.user.findUnique({
      where: { email: tokenRecord.identifier },
    });

    if (!user) {
      return apiError("Account not found.", 404, undefined, "USER_NOT_FOUND");
    }

    // 3. Hash new password & update
    const newPasswordHash = await hashPassword(validatedData.newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    // 4. Revoke all active sessions for this user for security
    await revokeAllUserSessions(user.id);

    logger.info("AuthResetPassword", `Password successfully reset for user: ${user.id}`);

    return apiSuccess(
      { success: true },
      200,
      "Your password has been successfully reset. Please log in with your new credentials."
    );
  } catch (error) {
    return handleApiError(error, "POST /api/auth/reset-password");
  }
}
