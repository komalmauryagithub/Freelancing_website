import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { verifyEmailSchema } from "@/lib/validations/auth";
import { consumeVerificationToken } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { TokenType } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = verifyEmailSchema.parse(body);

    const tokenRecord = await consumeVerificationToken(
      validatedData.token,
      TokenType.EMAIL_VERIFICATION
    );

    if (!tokenRecord) {
      return apiError(
        "Invalid or expired verification link.",
        400,
        undefined,
        "INVALID_TOKEN"
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: tokenRecord.identifier },
    });

    if (!user) {
      return apiError("Account not found.", 404, undefined, "USER_NOT_FOUND");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    logger.info("AuthVerifyEmail", `Email verified for user: ${user.id}`);

    return apiSuccess({ verified: true }, 200, "Email verified successfully");
  } catch (error) {
    return handleApiError(error, "POST /api/auth/verify-email");
  }
}
