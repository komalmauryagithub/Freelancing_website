import { getCurrentSession, SanitizedUser } from "@/lib/auth";
import { apiError } from "@/lib/api-response";
import { NextResponse } from "next/server";

export interface AuthContext {
  user: SanitizedUser;
  sessionId: string;
}

/**
 * Ensures user is authenticated. Returns AuthContext or a 401 NextResponse.
 */
export async function requireAuth(): Promise<AuthContext | NextResponse> {
  const sessionData = await getCurrentSession();

  if (!sessionData) {
    return apiError("Authentication required to access this resource", 401, undefined, "UNAUTHORIZED");
  }

  return {
    user: sessionData.user,
    sessionId: sessionData.session.id,
  };
}

/**
 * Ensures authenticated user has ADMIN role. Returns AuthContext or a 403 NextResponse.
 */
export async function requireAdmin(): Promise<AuthContext | NextResponse> {
  const auth = await requireAuth();

  if (auth instanceof NextResponse) {
    return auth;
  }

  if (auth.user.role !== "ADMIN") {
    return apiError("Access denied. Administrator privileges required.", 403, undefined, "FORBIDDEN");
  }

  return auth;
}

/**
 * Ensures authenticated user has CLIENT or ADMIN role.
 */
export async function requireClientOrAdmin(): Promise<AuthContext | NextResponse> {
  const auth = await requireAuth();

  if (auth instanceof NextResponse) {
    return auth;
  }

  if (auth.user.role !== "CLIENT" && auth.user.role !== "ADMIN" && auth.user.role !== "FREELANCER") {
    return apiError("Access denied.", 403, undefined, "FORBIDDEN");
  }

  return auth;
}

/**
 * Cross-client data access protection check.
 * Verifies that the resource belongs to the current user, unless the current user is an ADMIN.
 */
export function canAccessResource(
  resourceOwnerId: string | null | undefined,
  currentUserId: string,
  currentUserRole: string
): boolean {
  if (currentUserRole === "ADMIN") return true;
  if (!resourceOwnerId) return false;
  return resourceOwnerId === currentUserId;
}
