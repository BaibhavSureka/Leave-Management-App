import { Hono } from "hono";
import { getSupabaseAdmin, getUserFromToken } from "../lib/supabase.js";
import { getGoogleAuthUrl, handleOAuthCallback } from "../lib/google.js";

export const adminRouter = new Hono();

async function requireAdmin(c) {
  const token = c.req.header("authorization")?.replace("Bearer ", "");
  const info = await getUserFromToken(token);
  if (!info || info.profile?.role !== "ADMIN") {
    return c.json({ error: "forbidden" }, 403);
  }
  return info;
}

// Leave Types
adminRouter.get("/leave-types", async (c) => {
  const info = await requireAdmin(c);
  if (info.status) return info;
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("leave_types").select("*").order("name");
  return c.json(data || []);
});

adminRouter.post("/leave-types", async (c) => {
  const info = await requireAdmin(c);
  if (info.status) return info;
  const supabase = getSupabaseAdmin();
  const body = await c.req.json();
  const { data, error } = await supabase
    .from("leave_types")
    .insert({
      name: body.name,
      active: true,
    })
    .select()
    .single();
  if (error) return c.json({ error: error.message }, 400);
  return c.json(data);
});

adminRouter.patch("/leave-types/:id", async (c) => {
  const info = await requireAdmin(c);
  if (info.status) return info;
  const supabase = getSupabaseAdmin();
  const id = c.req.param("id");
  const body = await c.req.json();
  const { data, error } = await supabase
    .from("leave_types")
    .update({
      name: body.name,
      active: body.active,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) return c.json({ error: error.message }, 400);
  return c.json(data);
});

adminRouter.delete("/leave-types/:id", async (c) => {
  const info = await requireAdmin(c);
  if (info.status) return info;
  const supabase = getSupabaseAdmin();
  const id = c.req.param("id");
  await supabase.from("leave_types").delete().eq("id", id);
  return c.json({ ok: true });
});

// Assign leave types to users
adminRouter.post("/assign-leave-type", async (c) => {
  const info = await requireAdmin(c);
  if (info.status) return info;
  const supabase = getSupabaseAdmin();
  const body = await c.req.json();
  await supabase.from("user_leave_types").upsert(
    {
      user_id: body.user_id,
      leave_type_id: body.leave_type_id,
    },
    { onConflict: "user_id,leave_type_id" }
  );
  return c.json({ ok: true });
});

// Projects / Regions / Groups (basic CRUD)
for (const table of ["projects", "regions", "groups"]) {
  adminRouter.get(`/${table}`, async (c) => {
    const info = await requireAdmin(c);
    if (info.status) return info;
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.from(table).select("*").order("name");
    return c.json(data || []);
  });
  adminRouter.post(`/${table}`, async (c) => {
    const info = await requireAdmin(c);
    if (info.status) return info;
    const supabase = getSupabaseAdmin();
    const body = await c.req.json();
    const { data, error } = await supabase
      .from(table)
      .insert({ name: body.name, active: true })
      .select()
      .single();
    if (error) return c.json({ error: error.message }, 400);
    return c.json(data);
  });
  adminRouter.patch(`/${table}/:id`, async (c) => {
    const info = await requireAdmin(c);
    if (info.status) return info;
    const supabase = getSupabaseAdmin();
    const id = c.req.param("id");
    const body = await c.req.json();
    const { data, error } = await supabase
      .from(table)
      .update({ name: body.name, active: body.active })
      .eq("id", id)
      .select()
      .single();
    if (error) return c.json({ error: error.message }, 400);
    return c.json(data);
  });
  adminRouter.delete(`/${table}/:id`, async (c) => {
    const info = await requireAdmin(c);
    if (info.status) return info;
    const supabase = getSupabaseAdmin();
    const id = c.req.param("id");
    await supabase.from(table).delete().eq("id", id);
    return c.json({ ok: true });
  });
}

// Google Calendar settings
adminRouter.get("/google/oauth/url", async (c) => {
  const info = await requireAdmin(c);
  if (info.status) return info;
  const url = await getGoogleAuthUrl();
  return c.json({ url });
});

adminRouter.get("/google/oauth/callback", async (c) => {
  const code = c.req.query("code");
  if (!code) return c.text("Missing code", 400);
  await handleOAuthCallback(code);
  return c.redirect(`${process.env.APP_ORIGIN}/admin/integrations/success`);
});

adminRouter.get("/google/settings", async (c) => {
  const info = await requireAdmin(c);
  if (info.status) return info;
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("google_settings")
    .select("calendar_id, access_token, refresh_token, expiry_date")
    .eq("id", 1)
    .single();
  return c.json(data || {});
});

adminRouter.post("/google/settings", async (c) => {
  const info = await requireAdmin(c);
  if (info.status) return info;
  const supabase = getSupabaseAdmin();
  const body = await c.req.json();
  await supabase.from("google_settings").upsert(
    {
      id: 1,
      calendar_id: body.calendar_id || null,
    },
    { onConflict: "id" }
  );
  return c.json({ ok: true });
});

// User management endpoints
adminRouter.get("/users", async (c) => {
  const info = await requireAdmin(c);
  if (info.status) return info;
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name");

  console.log(
    `👥 Users loaded:`,
    data?.map((u) => `${u.email}: ${u.role}`)
  );
  return c.json(data || []);
});

// User leave type assignments
adminRouter.get("/user-leave-assignments", async (c) => {
  const info = await requireAdmin(c);
  if (info.status) return info;
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("user_leave_types").select(`
      user_id,
      leave_type_id,
      profiles!user_leave_types_user_id_fkey(full_name, email, role),
      leave_types!user_leave_types_leave_type_id_fkey(name)
    `);

  const formatted = (data || []).map((item) => ({
    user_id: item.user_id,
    leave_type_id: item.leave_type_id,
    user_name: item.profiles?.full_name,
    user_email: item.profiles?.email,
    user_role: item.profiles?.role,
    leave_type_name: item.leave_types?.name,
  }));

  return c.json(formatted);
});

adminRouter.delete("/remove-leave-assignment", async (c) => {
  const info = await requireAdmin(c);
  if (info.status) return info;
  const supabase = getSupabaseAdmin();
  const { user_id, leave_type_id } = await c.req.json();
  await supabase
    .from("user_leave_types")
    .delete()
    .eq("user_id", user_id)
    .eq("leave_type_id", leave_type_id);
  return c.json({ ok: true });
});

// Role Management
adminRouter.patch("/users/:userId/role", async (c) => {
  const info = await requireAdmin(c);
  if (info.status) return info;
  const supabase = getSupabaseAdmin();
  const userId = c.req.param("userId");
  const { role } = await c.req.json();

  console.log(`🔧 Role update attempt: User ${userId} → ${role}`);

  // Validate role
  if (!["ADMIN", "MANAGER", "MEMBER"].includes(role)) {
    return c.json({ error: "Invalid role" }, 400);
  }

  // Prevent changing own role
  if (userId === info.user.id) {
    return c.json({ error: "Cannot change your own role" }, 400);
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error(`❌ Role update failed:`, error);
    return c.json({ error: error.message }, 400);
  }

  console.log(`✅ Role update successful:`, data);
  return c.json(data);
});

// Get user leave type assignments (for admin UI)
adminRouter.get("/user-leave-types", async (c) => {
  const info = await requireAdmin(c);
  if (info.status) return info;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("user_leave_types").select("*");

  if (error) return c.json({ error: error.message }, 400);
  return c.json(data);
});

// Assign leave type to user (for admin UI)
adminRouter.post("/user-leave-types", async (c) => {
  const info = await requireAdmin(c);
  if (info.status) return info;

  const { user_id, leave_type_id } = await c.req.json();

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("user_leave_types")
    .insert({ user_id, leave_type_id })
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 400);
  return c.json(data);
});

// Remove leave type assignment from user (for admin UI)
adminRouter.delete("/user-leave-types", async (c) => {
  const info = await requireAdmin(c);
  if (info.status) return info;

  const { user_id, leave_type_id } = await c.req.json();

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("user_leave_types")
    .delete()
    .eq("user_id", user_id)
    .eq("leave_type_id", leave_type_id);

  if (error) return c.json({ error: error.message }, 400);
  return c.json({ success: true });
});
