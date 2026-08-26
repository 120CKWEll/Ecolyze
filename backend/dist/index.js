"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_js_1 = require("./config/env.js");
const auth_routes_js_1 = __importDefault(require("./routes/auth.routes.js"));
const analyze_routes_js_1 = __importDefault(require("./routes/analyze.routes.js"));
const chat_routes_js_1 = __importDefault(require("./routes/chat.routes.js"));
const history_routes_js_1 = __importDefault(require("./routes/history.routes.js"));
const locations_routes_js_1 = __importDefault(require("./routes/locations.routes.js"));
const rewards_routes_js_1 = __importDefault(require("./routes/rewards.routes.js"));
const admin_routes_js_1 = __importDefault(require("./routes/admin.routes.js"));
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)({
    origin: [env_js_1.config.frontendUrl, "http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
}));
app.use(express_1.default.json({ limit: "15mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "15mb" }));
// Request Logger
app.use((req, _res, next) => {
    const now = new Date().toLocaleTimeString();
    console.log(`[${now}] ${req.method} ${req.originalUrl}`);
    next();
});
// Root & Health Check
app.get("/", (_req, res) => {
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
        aiConfigured: Boolean(env_js_1.config.geminiApiKey),
        supabaseConfigured: Boolean(env_js_1.config.supabaseUrl && env_js_1.config.supabaseAnonKey),
    });
});
app.get("/api/health", (_req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
    });
});
// Register API Routes
app.use("/api/auth", auth_routes_js_1.default);
app.use("/api/analyze", analyze_routes_js_1.default);
app.use("/api/chat", chat_routes_js_1.default);
app.use("/api/history", history_routes_js_1.default);
app.use("/api/locations", locations_routes_js_1.default);
app.use("/api/rewards", rewards_routes_js_1.default);
app.use("/api/admin", admin_routes_js_1.default);
// 404 Handler
app.use((_req, res) => {
    res.status(404).json({ error: "Endpoint not found" });
});
// Global Error Handler
app.use((err, _req, res, _next) => {
    console.error("Unhandled Server Error:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    res.status(500).json({ error: message });
});
// Start Server
app.listen(env_js_1.config.port, () => {
    console.log("==================================================");
    console.log(`🚀 Ecolyze Backend API Server is running!`);
    console.log(`📡 URL: http://localhost:${env_js_1.config.port}`);
    console.log(`🌐 Frontend Allowed: ${env_js_1.config.frontendUrl}`);
    console.log(`🤖 Gemini AI: ${env_js_1.config.geminiApiKey ? "Configured ✓" : "Missing ✗"}`);
    console.log(`🗄️ Supabase: ${env_js_1.config.supabaseUrl ? "Configured ✓" : "Missing ✗"}`);
    console.log("==================================================");
});
