import crypto from "crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { User, TokenType } from "@prisma/client";

export const AUTH_COOKIE_NAME = "vanguard_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

const BCRYPT_SALT_ROUNDS = 12;

export interface SanitizedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isEmailVerified: boolean;
  avatar: string | null;
  company: string | null;
  createdAt: Date;
}

export function sanitizeUser(user: User): SanitizedUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    avatar: user.avatar,
    company: user.company,
    createdAt: user.createdAt,
  };
}

/**
 * Hash password with bcrypt salt rounds = 12
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

/**
 * Verify password against stored bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a cryptographically secure random token (64 hex chars)
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Create a new server-side session for a user
 */
export async function createSession(
  userId: string,
  ipAddress?: string | null,
  userAgent?: string | null
) {
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  const session = await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    },
  });

  return { session, token, expiresAt };
}

/**
 * Validate session token against database and check expiration
 */
export async function validateSessionToken(token: string) {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;

  // Check if session has expired
  if (session.expiresAt.getTime() < Date.now()) {
    // Clean up expired session asynchronously
    prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return {
    session,
    user: sanitizeUser(session.user),
    rawUser: session.user,
  };
}

/**
 * Revoke/delete a single session
 */
export async function revokeSession(token: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { token },
  });
}

/**
 * Revoke all sessions for a user (e.g. after password reset)
 */
export async function revokeAllUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { userId },
  });
}

/**
 * Get current session from incoming request cookies
 */
export async function getCurrentSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME);

  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  return validateSessionToken(sessionCookie.value);
}

/**
 * Helper to set secure session cookie
 */
export function getSessionCookieAttributes(expiresAt: Date, token?: string) {
  const isHttps = process.env.COOKIE_SECURE === "true" || process.env.RENDER === "true";
  return {
    name: AUTH_COOKIE_NAME,
    value: token || "",
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax" as const,
    path: "/",
    expires: expiresAt,
  };
}

/**
 * Create a verification or password reset token (1 hour expiry)
 */
export async function createVerificationToken(
  identifier: string,
  type: TokenType,
  expiresInMinutes = 60
) {
  // Delete any existing tokens of the same type for this identifier
  await prisma.verificationToken.deleteMany({
    where: { identifier, type },
  });

  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  const record = await prisma.verificationToken.create({
    data: {
      identifier,
      token,
      type,
      expiresAt,
    },
  });

  return record;
}

/**
 * Verify and consume a verification or password reset token
 */
export async function consumeVerificationToken(token: string, type: TokenType) {
  const record = await prisma.verificationToken.findFirst({
    where: { token, type },
  });

  if (!record) return null;

  if (record.expiresAt.getTime() < Date.now()) {
    await prisma.verificationToken.delete({ where: { id: record.id } }).catch(() => {});
    return null;
  }

  // Consume token so it cannot be reused
  await prisma.verificationToken.delete({ where: { id: record.id } });

  return record;
}
