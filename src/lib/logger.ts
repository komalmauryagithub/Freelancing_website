/**
 * Structured server-side logger that prevents credential and secret leakage.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const SENSITIVE_KEYS = [
  "password",
  "secret",
  "token",
  "apikey",
  "api_key",
  "authorization",
  "database_url",
  "cookie",
  "access_token",
  "refresh_token",
  "private_key",
];

function sanitizeValue(key: string, value: unknown): unknown {
  if (value === null || value === undefined) return value;

  const lowerKey = key.toLowerCase();
  for (const sensitive of SENSITIVE_KEYS) {
    if (lowerKey.includes(sensitive)) {
      return "[REDACTED]";
    }
  }

  if (typeof value === "string") {
    // Redact connection strings with credentials like postgresql://user:pass@host
    return value.replace(
      /([a-zA-Z]+:\/\/[^:]+:)[^@]+(@.+)/g,
      "$1***$2"
    );
  }

  if (typeof value === "object") {
    return sanitizeObject(value as Record<string, unknown>);
  }

  return value;
}

function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    sanitized[k] = sanitizeValue(k, v);
  }
  return sanitized;
}

function createLog(
  level: LogLevel,
  context: string,
  message: string,
  data?: Record<string, unknown>,
  err?: unknown
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    context,
    message,
    data: data ? sanitizeObject(data) : undefined,
  };

  if (err instanceof Error) {
    entry.error = {
      name: err.name,
      message: err.message,
      // Only include stack trace in non-production
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
    };
  }

  const formatted = JSON.stringify(entry);

  if (level === "error") {
    console.error(formatted);
  } else if (level === "warn") {
    console.warn(formatted);
  } else if (level === "info") {
    console.info(formatted);
  } else {
    console.log(formatted);
  }
}

export const logger = {
  debug: (context: string, message: string, data?: Record<string, unknown>) =>
    createLog("debug", context, message, data),
  info: (context: string, message: string, data?: Record<string, unknown>) =>
    createLog("info", context, message, data),
  warn: (context: string, message: string, data?: Record<string, unknown>) =>
    createLog("warn", context, message, data),
  error: (
    context: string,
    message: string,
    err?: unknown,
    data?: Record<string, unknown>
  ) => createLog("error", context, message, data, err),
};

export default logger;
