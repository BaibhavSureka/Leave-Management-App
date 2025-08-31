import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";

// Global error handlers
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

let authRouter, adminRouter, leavesRouter, approvalsRouter;

try {
  const authModule = await import("./routes/auth.js");
  authRouter = authModule.authRouter;

  const adminModule = await import("./routes/admin.js");
  adminRouter = adminModule.adminRouter;

  const leavesModule = await import("./routes/leaves.js");
  leavesRouter = leavesModule.leavesRouter;

  const approvalsModule = await import("./routes/approvals.js");
  approvalsRouter = approvalsModule.approvalsRouter;
} catch (error) {
  console.error("Error importing routes:", error);
  process.exit(1);
}

const app = new Hono();

// Add request logging middleware
app.use("*", async (c, next) => {
  const start = Date.now();
  const method = c.req.method;
  const url = c.req.url;
  const path = new URL(url).pathname;

  console.log(`📨 ${method} ${path} - Started`);

  // Log headers for auth endpoints
  if (path.includes("/auth/")) {
    const authHeader = c.req.header("authorization");
    console.log(`   Auth header: ${authHeader ? "Present" : "Missing"}`);
  }

  await next();

  const end = Date.now();
  const status = c.res.status;
  const duration = end - start;

  const statusEmoji = status >= 400 ? "❌" : status >= 300 ? "⚠️" : "✅";
  console.log(`${statusEmoji} ${method} ${path} - ${status} (${duration}ms)`);
});

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

app.get("/", (c) => c.json({ ok: true, name: "Leave Management API" }));

try {
  app.route("/api/auth", authRouter);
  app.route("/api/admin", adminRouter);
  app.route("/api/leaves", leavesRouter);
  app.route("/api/approvals", approvalsRouter);
} catch (error) {
  console.error("Error setting up routes:", error);
  process.exit(1);
}

// Start Node server
const port = Number(process.env.PORT || 8787);

try {
  const { serve } = await import("@hono/node-server");
  serve({ fetch: app.fetch, port });

  // Add graceful shutdown
  process.on("SIGTERM", () => {
    process.exit(0);
  });

  process.on("SIGINT", () => {
    process.exit(0);
  });
} catch (error) {
  console.error("Error starting server:", error);
  process.exit(1);
}

export default {
  port,
  fetch: app.fetch,
};
