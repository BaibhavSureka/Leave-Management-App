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
