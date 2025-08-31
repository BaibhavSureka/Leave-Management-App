import { getSupabaseAdmin } from "./supabase.js";

// Service to handle profile operations with RLS bypass
export class ProfileService {
  constructor() {
    this.supabase = getSupabaseAdmin();
  }

  async createProfile(userId, email, userData = {}) {
    console.log("ProfileService: Creating profile for", userId, email);

    // Determine role based on email
    let role = "MEMBER";
    if (email === "admin@demo.com") {
      role = "ADMIN";
    } else if (email === "manager@demo.com") {
      role = "MANAGER";
    } else if (email === process.env.FIRST_ADMIN_EMAIL) {
      role = "ADMIN";
    }

    const profileData = {
      id: userId,
      email: email,
      full_name: userData.full_name || userData.name || "",
      avatar_url: userData.avatar_url || "",
      role: role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("ProfileService: Profile data to insert:", profileData);

    // Use raw SQL to bypass RLS completely
    const { data, error } = await this.supabase.rpc(
      "create_profile_bypass_rls",
      {
        p_id: userId,
        p_email: email,
        p_full_name: profileData.full_name,
        p_avatar_url: profileData.avatar_url,
        p_role: role,
      }
    );

    if (error) {
      console.error("ProfileService: RPC failed, trying direct insert:", error);

      // Fallback to direct insert
      const { data: insertData, error: insertError } = await this.supabase
        .from("profiles")
        .insert(profileData)
        .select()
        .single();

      if (insertError) {
        console.error(
          "ProfileService: Direct insert also failed:",
          insertError
        );
        throw new Error(`Failed to create profile: ${insertError.message}`);
      }

      return insertData;
    }

    return data;
  }

  async getProfile(userId) {
    console.log("ProfileService: Getting profile for", userId);

    // Direct select (skip RPC)
    const { data, error } = await this.supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url, role, created_at, updated_at")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("ProfileService: Failed to fetch profile:", error);
      return null;
    }

    return data;
  }

  async upsertProfile(userId, email, userData = {}) {
    console.log("ProfileService: Upserting profile for", userId, email);

    // Check if profile exists first
    const existing = await this.getProfile(userId);

    if (existing) {
      console.log("ProfileService: Profile exists, updating");
      // Update existing profile
      const updateData = {
        email: email,
        full_name: userData.full_name || existing.full_name,
        avatar_url: userData.avatar_url || existing.avatar_url || "",
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update profile: ${error.message}`);
      }

      return data;
    } else {
      console.log("ProfileService: Profile doesn't exist, creating");
      // Create new profile
      return await this.createProfile(userId, email, userData);
    }
  }
}

export const profileService = new ProfileService();
