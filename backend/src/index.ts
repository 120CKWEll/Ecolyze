import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { config } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import analyzeRoutes from "./routes/analyze.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import historyRoutes from "./routes/history.routes.js";
import locationsRoutes from "./routes/locations.routes.js";
import rewardsRoutes from "./routes/rewards.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

// Middlewares
app.use(
  cors({
    origin: [config.frontendUrl, "http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Request Logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  const now = new Date().toLocaleTimeString();
  console.log(`[${now}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root & Health Check
app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "Ecolyze (RecycleSmart) Backend API",
    version: "1.0.0",
    status: "online",
    environment: process.env.NODE_ENV || "development",
    endpoints: {
      auth: "/api/auth (login, register, me)",
      analyze: "/api/analyze (AI waste image scan)",
      chat: "/api/chat (AI Assistant)",
      history: "/api/history (User scan history)",
      locations: "/api/locations (KKU drop-off points)",
      rewards: "/api/rewards (Redemption & Points)",
      admin: "/api/admin (Dashboard, Stats, Reports, Guidelines, Users)",
    },
    aiConfigured: Boolean(config.geminiApiKey),
    supabaseConfigured: Boolean(config.supabaseUrl && config.supabaseAnonKey),
  });
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// Register API Routes
app.use("/api/auth", authRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/locations", locationsRoutes);
app.use("/api/rewards", rewardsRoutes);
app.use("/api/admin", adminRoutes);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Global Error Handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled Server Error:", err);
  const message = err instanceof Error ? err.message : "Internal Server Error";
  res.status(500).json({ error: message });
});

// Start Server
app.listen(config.port, () => {
  console.log("==================================================");
  console.log(`🚀 Ecolyze Backend API Server is running!`);
  console.log(`📡 URL: http://localhost:${config.port}`);
  console.log(`🌐 Frontend Allowed: ${config.frontendUrl}`);
  console.log(`🤖 Gemini AI: ${config.geminiApiKey ? "Configured ✓" : "Missing ✗"}`);
  console.log(`🗄️ Supabase: ${config.supabaseUrl ? "Configured ✓" : "Missing ✗"}`);
  console.log("==================================================");
});
