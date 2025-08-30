import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

console.log("🚀 Starting Leave Management API...");
console.log("📍 Environment:", process.env.NODE_ENV);
console.log("🔗 Supabase URL:", process.env.SUPABASE_URL ? "✅ Set" : "❌ Missing");
console.log("🔑 Supabase Key:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Missing");
console.log("🌐 APP_ORIGIN:", process.env.APP_ORIGIN);

let authRouter, adminRouter, leavesRouter, approvalsRouter;

try {
  console.log("📥 Importing route modules...");
  const authModule = await import("./routes/auth.js");
  authRouter = authModule.authRouter;
  console.log("✅ Auth router imported");

  const adminModule = await import("./routes/admin.js");
  adminRouter = adminModule.adminRouter;
  console.log("✅ Admin router imported");

  const leavesModule = await import("./routes/leaves.js");
  leavesRouter = leavesModule.leavesRouter;
  console.log("✅ Leaves router imported");

  const approvalsModule = await import("./routes/approvals.js");
  approvalsRouter = approvalsModule.approvalsRouter;
  console.log("✅ Approvals router imported");
} catch (error) {
  console.error("❌ Error importing routes:", error);
  process.exit(1);
}

console.log("🏗️ Creating Hono app...");
const app = new Hono();

console.log("🔧 Setting up CORS...");
app.use(
  "*",
  cors({
    origin: "*",
    credentials: true,
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

console.log("📍 Setting up routes...");
app.get("/", (c) => c.json({ ok: true, name: "Leave Management API" }));

try {
  app.route("/api/auth", authRouter);
  console.log("✅ Auth routes registered");
  
  app.route("/api/admin", adminRouter);
  console.log("✅ Admin routes registered");
  
  app.route("/api/leaves", leavesRouter);
  console.log("✅ Leaves routes registered");
  
  app.route("/api/approvals", approvalsRouter);
  console.log("✅ Approvals routes registered");
} catch (error) {
  console.error("❌ Error setting up routes:", error);
  process.exit(1);
}

// Start Node server
const port = Number(process.env.PORT || 8787);
console.log("🚀 Starting server on port:", port);

try {
  // Always start the server (both development and production)
  const { serve } = await import("@hono/node-server");
  console.log("✅ Node server module imported");
  
  const server = serve({ fetch: app.fetch, port });
  console.log(`🎉 Backend listening on port ${port}`);
  console.log(`🌐 Health check: http://localhost:${port}/`);
  
  // Add graceful shutdown
  process.on('SIGTERM', () => {
    console.log('📴 SIGTERM received, shutting down gracefully');
    process.exit(0);
  });
  
  process.on('SIGINT', () => {
    console.log('📴 SIGINT received, shutting down gracefully');
    process.exit(0);
  });
  
} catch (error) {
  console.error("❌ Error starting server:", error);
  console.error("Stack trace:", error.stack);
  process.exit(1);
}

export default {
  port,
  fetch: app.fetch,
};
