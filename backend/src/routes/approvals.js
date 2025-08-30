import { Hono } from "hono";
import { getSupabaseAdmin, getUserFromToken } from "../lib/supabase.js";
import { createCalendarEvent } from "../lib/google.js";
import { sendEmail, sendSlack } from "../lib/notify.js";

export const approvalsRouter = new Hono();

async function requireManager(c) {
  const token = c.req.header("authorization")?.replace("Bearer ", "");
  const info = await getUserFromToken(token);
  if (
    !info ||
    (info.profile?.role !== "MANAGER" && info.profile?.role !== "ADMIN")
  ) {
    return c.json({ error: "forbidden" }, 403);
  }
  return info;
}

// Get all leaves for approval (different statuses)
approvalsRouter.get("/", async (c) => {
  const info = await requireManager(c);
  if (info.status) return info;
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("leaves")
    .select(
      "*, profiles!leaves_user_id_fkey(full_name,email,role), leave_types(name)"
    )
    .order("created_at", { ascending: false });

  // Role-based filtering
  if (info.profile?.role === "MANAGER") {
    // Managers can only see leaves that require MANAGER approval (from MEMBERS)
    query = query.eq("approver_required_role", "MANAGER");
  } else if (info.profile?.role === "ADMIN") {
    // Admins can see ALL leaves (for overview) but can only approve leaves requiring ADMIN approval
    // We'll handle the approval permission in the PUT endpoint
  }

  const { data, error } = await query;
  if (error) return c.json({ error: error.message }, 400);
  return c.json(data);
});

approvalsRouter.get("/pending", async (c) => {
  const info = await requireManager(c);
  if (info.status) return info;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("leaves")
    .select(
      "*, profiles!leaves_user_id_fkey(full_name,email), leave_types(name)"
    )
    .eq("status", "PENDING")
    .order("created_at", { ascending: false });
  if (error) return c.json({ error: error.message }, 400);
  return c.json(data);
});

approvalsRouter.post("/:id/decision", async (c) => {
  const info = await requireManager(c);
  if (info.status) return info;
  const id = c.req.param("id");
  const { decision, note } = await c.req.json();
  if (!["APPROVED", "REJECTED"].includes(decision))
    return c.json({ error: "invalid decision" }, 400);

  const supabase = getSupabaseAdmin();
  const { data: leave } = await supabase
    .from("leaves")
    .select(
      "*, profiles!leaves_user_id_fkey(full_name,email), leave_types(name)"
    )
    .eq("id", id)
    .single();
  if (!leave) return c.json({ error: "not found" }, 404);
  if (leave.status !== "PENDING")
    return c.json({ error: "already decided" }, 400);

  let calendar_event_id = null;
  if (decision === "APPROVED") {
    const summary = `${leave.leave_types.name} | ${
      leave.profiles.full_name || leave.profiles.email
    } | ${leave.start_date} - ${leave.end_date}`;
    calendar_event_id = await createCalendarEvent({
      summary,
      description: leave.reason || "",
      startDate: leave.start_date,
      endDate: leave.end_date,
    });
  }

  const { data: updated, error } = await supabase
    .from("leaves")
    .update({
      status: decision,
      approved_by: info.user.id,
      approved_at: new Date().toISOString(),
      decision_note: note || null,
      calendar_event_id,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) return c.json({ error: error.message }, 400);

  // Notifications
  const toEmail = leave.profiles.email;
  const subject = `Leave ${decision.toLowerCase()}`;
  const html = `
    <p>Hi ${leave.profiles.full_name || leave.profiles.email},</p>
    <p>Your leave request (${leave.leave_types.name}, ${leave.start_date} → ${
    leave.end_date
  }) has been <b>${decision.toLowerCase()}</b>.</p>
    ${decision === "APPROVED" ? `<p>Calendar event created.</p>` : ""}
    ${note ? `<p>Note: ${note}</p>` : ""}
  `;
  await sendEmail({ to: toEmail, subject, html });
  await sendSlack({
    text: `Leave ${decision}: ${summaryForSlack(leave)} by ${info.user.email}`,
  });

  return c.json(updated);
});

// PUT route for frontend compatibility
approvalsRouter.put("/:id", async (c) => {
  const info = await requireManager(c);
  if (info.status) return info;
  const id = c.req.param("id");
  const { status } = await c.req.json();

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return c.json({ error: "invalid status" }, 400);
  }

  const supabase = getSupabaseAdmin();
  const { data: leave } = await supabase
    .from("leaves")
    .select(
      "*, profiles!leaves_user_id_fkey(full_name,email,role), leave_types(name)"
    )
    .eq("id", id)
    .single();
  if (!leave) return c.json({ error: "not found" }, 404);
  if (leave.status !== "PENDING")
    return c.json({ error: "already decided" }, 400);

  // Check if the current user has permission to approve this leave
  const canApprove =
    (info.profile?.role === "MANAGER" &&
      leave.approver_required_role === "MANAGER") ||
    info.profile?.role === "ADMIN"; // Admins can approve any leave

  if (!canApprove) {
    return c.json(
      { error: "You don't have permission to approve this leave" },
      403
    );
  }

  let calendar_event_id = null;
  if (status === "APPROVED") {
    const summary = `${leave.leave_types.name} | ${
      leave.profiles.full_name || leave.profiles.email
    } | ${leave.start_date} - ${leave.end_date}`;
    calendar_event_id = await createCalendarEvent({
      summary,
      description: leave.reason || "",
      startDate: leave.start_date,
      endDate: leave.end_date,
    });
  }

  const { data: updated, error } = await supabase
    .from("leaves")
    .update({
      status: status,
      approved_by: info.user.id,
      approved_at: new Date().toISOString(),
      calendar_event_id,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) return c.json({ error: error.message }, 400);

  return c.json(updated);
});

function summaryForSlack(leave) {
  return `${leave.leave_types.name} | ${
    leave.profiles.full_name || leave.profiles.email
  } | ${leave.start_date} - ${leave.end_date}`;
}
