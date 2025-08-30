import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRouter } from "./routes/auth.js";
import { adminRouter } from "./routes/admin.js";
import { leavesRouter } from "./routes/leaves.js";
import { approvalsRouter } from "./routes/approvals.js";

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

app.route("/api/auth", authRouter);
app.route("/api/admin", adminRouter);
app.route("/api/leaves", leavesRouter);
app.route("/api/approvals", approvalsRouter);

// Start Node server
const port = Number(process.env.PORT || 8787);
export default {
  port,
  fetch: app.fetch,
};

if (process.env.NODE_ENV !== "production") {
  // run with node http server for local
  const { serve } = await import("@hono/node-server");
  serve({ fetch: app.fetch, port });
  console.log(`Backend listening on http://localhost:${port}`);
}
