import { Hono } from "hono";
import { getSupabaseAdmin } from "../lib/supabase.js";
import { getUserFromToken } from "../lib/supabase.js";
import { profileService } from "../lib/profile-service.js";

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
  console.log("=== /auth/me endpoint hit ===");

  const authHeader = c.req.header("authorization");
  console.log("Authorization header present:", !!authHeader);

  const token = authHeader?.replace("Bearer ", "");
  console.log(
    "Token extracted:",
    token ? `Yes (length: ${token.length})` : "No"
  );

  const info = await getUserFromToken(token);
  console.log(
    "User info from token:",
    info ? `Found user: ${info.user.email}` : "Not found"
  );

  if (!info) {
    console.log("No user info - returning 401");
    return c.json({ error: "unauthorized" }, 401);
  }

  console.log(
    "✅ User authenticated:",
    info.user.email,
    "Role:",
    info.profile?.role
  );
  console.log("Full profile data:", JSON.stringify(info.profile, null, 2));

  return c.json({
    user: info.user,
    profile: info.profile,
  });
});

authRouter.post("/profiles/upsert", async (c) => {
  console.log("=== /auth/profiles/upsert endpoint hit ===");

  const token = c.req.header("authorization")?.replace("Bearer ", "");
  console.log("Token present:", !!token);

  const info = await getUserFromToken(token);
  if (!info) {
    console.log("No user info - returning 401");
    return c.json({ error: "unauthorized" }, 401);
  }

  console.log("✅ User authenticated for upsert:", info.user.email);

  const { full_name, avatar_url } = await c.req.json();
  console.log("Request body:", { full_name, avatar_url });

  try {
    // Use ProfileService to handle the upsert
    const profile = await profileService.upsertProfile(
      info.user.id,
      info.user.email,
      {
        full_name,
        avatar_url,
      }
    );

    console.log("✅ Profile upsert successful via ProfileService:", profile);
    return c.json({ ok: true, profile });
  } catch (error) {
    console.error("❌ ProfileService upsert failed:", error);
    return c.json({ error: "Failed to update profile: " + error.message }, 500);
  }
}); // Get all profiles (for admin use)
authRouter.get("/profiles", async (c) => {
  console.log("=== /auth/profiles endpoint hit ===");

  const token = c.req.header("authorization")?.replace("Bearer ", "");
  console.log("Token present:", !!token);

  const info = await getUserFromToken(token);
  console.log(
    "User info:",
    info ? `${info.user.email} (${info.profile?.role})` : "None"
  );

  if (
    !info ||
    (info.profile?.role !== "ADMIN" && info.profile?.role !== "MANAGER")
  ) {
    console.log("❌ Forbidden - user role:", info?.profile?.role);
    return c.json({ error: "forbidden" }, 403);
  }

  console.log("✅ User authorized to view profiles");
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name");

  console.log(
    "Profiles query result:",
    data ? `${data.length} profiles` : "No data"
  );
  console.log("Profiles query error:", error);

  return c.json(data || []);
});

// Email/Password Login
authRouter.post("/login", async (c) => {
  console.log("=== /auth/login endpoint hit ===");

  const { email, password } = await c.req.json();
  console.log("Login attempt for email:", email);

  if (!email || !password) {
    console.log("❌ Missing email or password");
    return c.json({ error: "Email and password are required" }, 400);
  }

  const supabase = getSupabaseAdmin();

  try {
    // Authenticate user
    console.log("Attempting to sign in user with email:", email);
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    console.log("Auth response:", {
      user: authData?.user?.id,
      session: !!authData?.session,
      error: authError,
    });

    if (authError) {
      console.log("❌ Authentication failed:", authError.message);
      return c.json({ error: authError.message }, 401);
    }

    if (!authData.user) {
      console.log("❌ No user returned from auth");
      return c.json({ error: "Authentication failed" }, 401);
    }

    console.log("✅ User authenticated successfully:", authData.user.email);

    // Use ProfileService to handle profile creation/retrieval
    try {
      console.log("Attempting to create/get profile using ProfileService");
      let profile = await profileService.getProfile(authData.user.id);

      if (!profile) {
        console.log("Profile doesn't exist, creating new one");
        profile = await profileService.createProfile(
          authData.user.id,
          authData.user.email,
          {
            full_name: authData.user.user_metadata?.full_name || "",
            avatar_url: authData.user.user_metadata?.avatar_url || "",
          }
        );
      }

      console.log("✅ Profile operation successful:", profile);

      return c.json({
        user: authData.user,
        session: authData.session,
        profile: profile,
        access_token: authData.session?.access_token,
        refresh_token: authData.session?.refresh_token,
      });
    } catch (profileError) {
      console.error("❌ Profile operation failed:", profileError);
      // Return successful auth even if profile creation fails
      return c.json({
        user: authData.user,
        session: authData.session,
        profile: null,
        profileError: profileError.message,
        access_token: authData.session?.access_token,
        refresh_token: authData.session?.refresh_token,
      });
    }
  } catch (error) {
    console.error("❌ Login endpoint error:", error);
    return c.json({ error: "Internal server error: " + error.message }, 500);
  }
});
