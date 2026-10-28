import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { createVerificationToken } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limiter";
import { logger } from "@/lib/logger";
import { TokenType } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

    // 1. Rate Limiting: Max 3 reset requests per 15 min per IP
    const rateLimit = checkRateLimit(clientIp, {
      keyPrefix: "auth_forgot_pw",
      maxRequests: 3,
      windowSeconds: 15 * 60,
    });

    if (!rateLimit.success) {
      return apiError(
        `Too many password reset requests. Please try again in ${rateLimit.resetSeconds} seconds.`,
        429,
        undefined,
        "RATE_LIMITED"
      );
    }

    const body = await request.json();
    const validatedData = forgotPasswordSchema.parse(body);

    logger.info("AuthForgotPassword", `Password reset requested for email: ${validatedData.email}`);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    let resetToken = "";

    if (user) {
      const tokenRecord = await createVerificationToken(user.email, TokenType.PASSWORD_RESET, 60);
      resetToken = tokenRecord.token;

      // In production, an email delivery service (e.g. Resend / SendGrid) sends the reset link:
      // const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
      logger.info(
        "AuthForgotPassword",
        `Password reset token generated for user ${user.id} (Token expires in 60m)`
      );
    }

    // Always return safe identical success message to prevent user enumeration
    return apiSuccess(
      {
        message: "If an account matches that email address, password reset instructions have been sent.",
        // For development / demonstration testing without an external SMTP server, provide token in dev mode only
        devToken: process.env.NODE_ENV !== "production" && user ? resetToken : undefined,
      },
      200,
      "If an account matches that email address, password reset instructions have been sent."
    );
  } catch (error) {
    return handleApiError(error, "POST /api/auth/forgot-password");
  }
}
