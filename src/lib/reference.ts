import crypto from "crypto";

export function generateReferenceNumber(prefix: "PRJ" | "QUO" | "INV" | "LEAD"): string {
  const year = new Date().getFullYear();
  const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${year}-${randomHex}`;
}
