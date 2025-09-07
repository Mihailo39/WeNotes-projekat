export const refreshCookieName = "rt";

export const refreshCookieOptions = {
  httpOnly: true,
  secure: (process.env.NODE_ENV === "production") || (process.env.TRUST_PROXY === "1"),
  sameSite: ((process.env.NODE_ENV === "production") || (process.env.TRUST_PROXY === "1")) ? "none" as const : "lax" as const,
  path: "/api/v1/auth",
  maxAge: 1000 * 60 * 60 * 24 * 7 // 7 dana trajanje
};
