import { Hono } from "hono";
import { getSupabaseAdmin, getUserFromToken } from "../lib/supabase.js";

export const authRouter = new Hono();

// Debug endpoint to check environment variable
authRouter.get("/debug/env", async (c) => {
  return c.json({
    FIRST_ADMIN_EMAIL: process.env.FIRST_ADMIN_EMAIL,
    NODE_ENV: process.env.NODE_ENV,
    envLoaded: !!process.env.FIRST_ADMIN_EMAIL,
  });
});

authRouter.get("/me", async (c) => {
  const token = c.req.header("authorization")?.replace("Bearer ", "");
  const info = await getUserFromToken(token);
  if (!info) return c.json({ error: "unauthorized" }, 401);
  return c.json({ user: info.user, profile: info.profile });
});

authRouter.post("/profiles/upsert", async (c) => {
  const token = c.req.header("authorization")?.replace("Bearer ", "");
  const info = await getUserFromToken(token);
  if (!info) return c.json({ error: "unauthorized" }, 401);
  const supabase = getSupabaseAdmin();
  const { full_name, avatar_url } = await c.req.json();

  // Check if profile already exists to preserve role
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", info.user.id)
    .single();

  // Only set role if user doesn't exist (first login) or has no role
  const shouldSetRole = !existingProfile || !existingProfile.role;
  const isFirstAdmin = info.user.email === process.env.FIRST_ADMIN_EMAIL;
  const defaultRole = isFirstAdmin ? "ADMIN" : "MEMBER";

  const profileData = {
    id: info.user.id,
    email: info.user.email,
    full_name: full_name || info.user.user_metadata?.full_name || "",
    avatar_url: avatar_url || info.user.user_metadata?.avatar_url || "",
  };

  // Only include role if we should set it (first login or no existing role)
  if (shouldSetRole) {
    profileData.role = defaultRole;
  }

  await supabase.from("profiles").upsert(profileData, { onConflict: "id" });
  return c.json({ ok: true });
});

// Get all profiles (for admin use)
authRouter.get("/profiles", async (c) => {
  const token = c.req.header("authorization")?.replace("Bearer ", "");
  const info = await getUserFromToken(token);
  if (
    !info ||
    (info.profile?.role !== "ADMIN" && info.profile?.role !== "MANAGER")
  ) {
    return c.json({ error: "forbidden" }, 403);
  }
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name");
  return c.json(data || []);
});
