import { google } from "googleapis"
import { getSupabaseAdmin } from "./supabase.js"

async function getGoogleSettings() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from("google_settings").select("*").eq("id", 1).single()
  if (error) return null
  return data
}

async function saveGoogleTokens(tokens) {
  const supabase = getSupabaseAdmin()
  const payload = {
    id: 1,
    access_token: tokens.access_token || null,
    refresh_token: tokens.refresh_token || null,
    expiry_date: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
  }
  await supabase.from("google_settings").upsert(payload, { onConflict: "id" })
}

export async function getOAuth2Client() {
  const settings = await getGoogleSettings()
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI

  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
  if (settings?.refresh_token) {
    oAuth2Client.setCredentials({
      access_token: settings.access_token || undefined,
      refresh_token: settings.refresh_token,
      expiry_date: settings.expiry_date ? new Date(settings.expiry_date).getTime() : undefined,
    })
  }
  // Hook to persist refreshed tokens
  oAuth2Client.on("tokens", async (tokens) => {
    const merged = {
      access_token: tokens.access_token || settings?.access_token,
      refresh_token: tokens.refresh_token || settings?.refresh_token,
      expiry_date: tokens.expiry_date || (settings?.expiry_date ? new Date(settings.expiry_date).getTime() : undefined),
    }
    await saveGoogleTokens(merged)
  })
  return oAuth2Client
}

export async function getGoogleAuthUrl() {
  const oAuth2Client = await getOAuth2Client()
  const scopes = ["https://www.googleapis.com/auth/calendar"]
  return oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  })
}

export async function handleOAuthCallback(code) {
  const oAuth2Client = await getOAuth2Client()
  const { tokens } = await oAuth2Client.getToken(code)
  await saveGoogleTokens(tokens)
  return true
}

export async function createCalendarEvent({ summary, description, startDate, endDate, calendarId }) {
  const oAuth2Client = await getOAuth2Client()
  const calendar = google.calendar({ version: "v3", auth: oAuth2Client })
  const settings = await getSupabaseAdmin().from("google_settings").select("*").eq("id", 1).single()
  const targetCalendar = calendarId || settings.data?.calendar_id || process.env.DEFAULT_CALENDAR_ID
  if (!targetCalendar) throw new Error("No calendar configured")

  const res = await calendar.events.insert({
    calendarId: targetCalendar,
    requestBody: {
      summary,
      description,
      start: { date: startDate },
      end: { date: endDate },
    },
  })
  return res.data.id
}

export async function deleteCalendarEvent({ eventId, calendarId }) {
  if (!eventId) return
  const oAuth2Client = await getOAuth2Client()
  const calendar = google.calendar({ version: "v3", auth: oAuth2Client })
  const settings = await getSupabaseAdmin().from("google_settings").select("*").eq("id", 1).single()
  const targetCalendar = calendarId || settings.data?.calendar_id || process.env.DEFAULT_CALENDAR_ID
  if (!targetCalendar) return
  try {
    await calendar.events.delete({ calendarId: targetCalendar, eventId })
  } catch (e) {
    // ignore if already deleted
  }
}
