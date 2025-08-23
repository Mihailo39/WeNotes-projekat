import { randomBytes } from "crypto";

export const REFRESH_TTL_DAYS = 7;

export function generateRefreshToken(): string {
  // 32 bytes -> 64 hex chars (fits common VARCHAR(64) columns)
  return randomBytes(32).toString("hex");
}

export function calcRefreshExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
}
