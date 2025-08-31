import { Hono } from "hono";
import { getSupabaseAdmin, getUserFromToken } from "../lib/supabase.js";
import { deleteCalendarEvent } from "../lib/google.js";

export const leavesRouter = new Hono();

async function requireUser(c) {
  console.log("=== REQUIRE USER ===");
  const token = c.req.header("authorization")?.replace("Bearer ", "");
  console.log("Token received:", token ? "Yes" : "No");

  const info = await getUserFromToken(token);
  console.log("User info:", {
    user: info?.user ? { id: info.user.id, email: info.user.email } : null,
    profile: info?.profile
      ? { id: info.profile.id, role: info.profile.role }
      : null,
  });

  if (!info) {
    console.log("No user info - returning 401");
    return c.json({ error: "unauthorized" }, 401);
  }
  return info;
}

leavesRouter.get("/", async (c) => {
  console.log("=== GET /leaves endpoint hit ===");
  const info = await requireUser(c);
  if (info.status) {
    console.log("Auth failed, returning error");
    return info;
  }

  console.log("Getting leaves for user:", info.user.id);
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("leaves")
    .select("*, leave_types(name)")
    .eq("user_id", info.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Database error:", error);
    return c.json({ error: error.message }, 400);
  }

  console.log("Leaves data:", data);
  return c.json(data);
});

leavesRouter.get("/types", async (c) => {
  console.log("=== GET /leaves/types endpoint hit ===");
  const info = await requireUser(c);
  if (info.status) {
    console.log("Auth failed, returning error");
    return info;
  }

  console.log("Getting assigned leave types for user:", info.user.id);
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("user_leave_types")
    .select(
      `
      leave_type_id,
      leave_types!user_leave_types_leave_type_id_fkey(*)
    `
    )
    .eq("user_id", info.user.id);

  if (error) {
    console.log("Database error:", error);
    return c.json({ error: error.message }, 400);
  }

  // Extract the leave_types data
  const leaveTypes = data
    .map((item) => item.leave_types)
    .filter((type) => type && type.active);
  console.log("Assigned leave types:", leaveTypes);
  return c.json(leaveTypes);
});

leavesRouter.post("/", async (c) => {
  const info = await requireUser(c);
  if (info.status) return info;
  const body = await c.req.json();
  const supabase = getSupabaseAdmin();

  // Block admins from applying for leave
  if (info.profile?.role === "ADMIN") {
    return c.json({ error: "Admins cannot apply for leave" }, 403);
  }

  // check leave type assignment
  const { data: assigned } = await supabase
    .from("user_leave_types")
    .select("*")
    .eq("user_id", info.user.id)
    .eq("leave_type_id", body.leave_type_id)
    .maybeSingle();
  if (!assigned) return c.json({ error: "Leave type not assigned" }, 403);

  // Determine initial status based on role hierarchy
  let initialStatus = "PENDING";
  let approver_required_role = null;

  if (info.profile?.role === "MEMBER") {
    approver_required_role = "MANAGER"; // Members need Manager approval
  } else if (info.profile?.role === "MANAGER") {
    approver_required_role = "ADMIN"; // Managers need Admin approval
  }

  const { data, error } = await supabase
    .from("leaves")
    .insert({
      user_id: info.user.id,
      leave_type_id: body.leave_type_id,
      reason: body.reason || "",
      start_date: body.start_date,
      end_date: body.end_date,
      half_day: !!body.half_day,
      total_days: body.total_days || null,
      status: initialStatus,
      approver_required_role: approver_required_role,
    })
    .select()
    .single();
  if (error) return c.json({ error: error.message }, 400);
  return c.json(data);
});

leavesRouter.delete("/:id", async (c) => {
  const info = await requireUser(c);
  if (info.status) return info;
  const id = c.req.param("id");
  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from("leaves")
    .select("*")
    .eq("id", id)
    .single();
  if (!existing || existing.user_id !== info.user.id)
    return c.json({ error: "not found" }, 404);

  // If approved with event, unsync
  if (existing.status === "APPROVED" && existing.calendar_event_id) {
    await deleteCalendarEvent({ eventId: existing.calendar_event_id });
  }

  const { data, error } = await supabase
    .from("leaves")
    .update({ status: "CANCELLED" })
    .eq("id", id)
    .select()
    .single();
  if (error) return c.json({ error: error.message }, 400);
  return c.json(data);
});
