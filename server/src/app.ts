// src/app.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// Rate limiters
import { loginLimiter, refreshLimiter } from "./Middlewares/rateLimiter";

// Controllers
import { AuthController } from "./WebAPI/controllers/auth/AuthController";
import { UserController } from "./WebAPI/controllers/user/UserController";
import { NoteController } from "./WebAPI/controllers/note/NoteController";

// Services
import { AuthService } from "./Services/auth/AuthService";
import { UserService } from "./Services/user/UserService";
import { NoteService } from "./Services/note/NoteService";

// Repositories
import { UserRepository } from "./Database/repositories/users/UserRepository";
import { NoteRepository } from "./Database/repositories/notes/NoteRepository";
import { RefreshTokenRepository } from "./Database/repositories/auth/RefreshTokenRepository";

// Middlewares (global)
import { notFound } from "./Middlewares/notFound";
import { errorHandler } from "./Middlewares/errorHandler";

dotenv.config();

const app = express();

// Ako koristiš secure cookies iza proxy-ja (npr. render/vercel/nginx), omogući trust proxy.
// U dev-u možeš ostaviti isključeno ili uslovno:
if (process.env.TRUST_PROXY === "1") {
  app.set("trust proxy", 1);
}

// CORS
const ALLOW_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173"; // prilagodi po potrebi
app.use(
  cors({
    origin: ALLOW_ORIGIN,
    credentials: true, // zbog httpOnly refresh cookie
  })
);

// Parsers
app.use(express.json({ limit: '10mb' })); // Povećan limit za slike
app.use(cookieParser());

// Healthcheck (korisno za brzu proveru)
app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// ----------------- Wiring: repo -> service -> controller -----------------
const userRepository = new UserRepository();
const noteRepository = new NoteRepository();
const refreshTokenRepository = new RefreshTokenRepository();

// AuthService — ako ti konstruktor trenutno prima samo userRepository, dodaj i refreshTokenRepository
// (naš predlog AuthService ima login/register/refresh/logoutAll i koristi refreshTokenRepository unutra)
const authService = new AuthService(userRepository, refreshTokenRepository);

const userService = new UserService(userRepository, refreshTokenRepository);
const noteService = new NoteService(noteRepository);

// Controllers
const authController = new AuthController(authService);
const userController = new UserController(userService, userRepository);
const noteController = new NoteController(noteService);

// ----------------- Routes -----------------

// Rate-limiteri za auth pod-rute (moraju ići PRE mount-a kontrolera da pogode iste putanje)
app.use("/api/v1/auth/login", loginLimiter);
app.use("/api/v1/auth/refresh", refreshLimiter);

// Auth
app.use("/api/v1/auth", authController.getRouter());

// Users (PATCH /users/:id, DELETE /users/:id, GET /users/me)
app.use("/api/v1/user", userController.getRouter());

// Notes
app.use("/api/v1/notes", noteController.getRouter());


// 404 + error handler (uvek na dnu)
app.use(notFound);
app.use(errorHandler);

export default app;
