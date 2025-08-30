import { createClient } from "@supabase/supabase-js"

let supabaseAdmin

export function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  return supabaseAdmin
}

// Verify a user access token (from frontend) and return user + profile
export async function getUserFromToken(accessToken) {
  if (!accessToken) return null
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return null

  const admin = getSupabaseAdmin()
  const { data: profile } = await admin.from("profiles").select("*").eq("id", user.id).single()

  return { user, profile }
}
