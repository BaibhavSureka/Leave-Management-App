import { Hono } from "hono";
import { getSupabaseAdmin, getUserFromToken } from "../lib/supabase.js";
import { deleteCalendarEvent } from "../lib/google.js";

export const leavesRouter = new Hono();

async function requireUser(c) {
  const token = c.req.header("authorization")?.replace("Bearer ", "");
  const info = await getUserFromToken(token);
  if (!info) return c.json({ error: "unauthorized" }, 401);
  return info;
}

leavesRouter.get("/", async (c) => {
  const info = await requireUser(c);
  if (info.status) return info;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("leaves")
    .select("*, leave_types(name)")
    .eq("user_id", info.user.id)
    .order("created_at", { ascending: false });
  if (error) return c.json({ error: error.message }, 400);
  return c.json(data);
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
