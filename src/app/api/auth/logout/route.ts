import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { AUTH_COOKIE_NAME, revokeSession } from "@/lib/auth";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME);

    if (sessionCookie?.value) {
      logger.info("AuthLogout", "Revoking active session");
      await revokeSession(sessionCookie.value);
    }

    const response = apiSuccess({ loggedOut: true }, 200, "Logged out successfully");

    // Clear session cookie
    response.cookies.set(AUTH_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true" || process.env.RENDER === "true",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    return handleApiError(error, "POST /api/auth/logout");
  }
}
