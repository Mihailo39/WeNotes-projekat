import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 60_000, // Minut
  max: 10,          // dozvoli 10 pokušaja u minutu radi lakseg testiranja
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
