import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 60_000, // 1 min
  max: 10,          // dozvoli 10 pokušaja u minutu
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Try again soon." }
});

export const refreshLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many refresh attempts." }
});
