import { NextRequest } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const sessionData = await getCurrentSession();

    if (!sessionData) {
      return apiSuccess({ user: null, authenticated: false });
    }

    return apiSuccess({
      user: sessionData.user,
      authenticated: true,
      sessionId: sessionData.session.id,
    });
  } catch (error) {
    return handleApiError(error, "GET /api/auth/me");
  }
}
