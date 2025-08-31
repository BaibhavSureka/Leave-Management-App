import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getSupabase() {
  return createClient(supabaseUrl, supabaseKey);
}

export function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function getUserFromToken(token) {
  console.log("getUserFromToken: Starting with token present:", !!token);

  if (!token) {
    console.log("getUserFromToken: No token provided");
    return null;
  }

  const supabase = getSupabaseAdmin();

  try {
    console.log("getUserFromToken: Verifying token with Supabase");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError) {
      console.log(
        "getUserFromToken: Token verification failed:",
        userError.message
      );
      return null;
    }

    if (!user) {
      console.log("getUserFromToken: No user found for token");
      return null;
    }

    console.log("getUserFromToken: ✅ Token valid for user:", user.email);

    // Import ProfileService here to avoid circular imports
    const { profileService } = await import("./profile-service.js");

    try {
      console.log("getUserFromToken: Fetching profile via ProfileService");
      const profile = await profileService.getProfile(user.id);
      console.log(
        "getUserFromToken: Profile result:",
        profile ? "found" : "not found"
      );

      return { user, profile };
    } catch (profileError) {
      console.error(
        "getUserFromToken: Profile fetch failed:",
        profileError.message
      );
      // Return user info even if profile fetch fails
      return { user, profile: null };
    }
  } catch (error) {
    console.error("getUserFromToken: Unexpected error:", error.message);
    return null;
  }
}
