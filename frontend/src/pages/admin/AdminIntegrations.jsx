 
import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase.js"

export default function AdminIntegrations() {
  const [settings, setSettings] = useState({ calendar_id: "" })
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)

  async function load() {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/google/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
        setConnected(!!data.access_token)
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const connectGoogle = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/google/oauth/url`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert("Error getting Google OAuth URL")
      }
    } catch (error) {
      alert("Error connecting to Google")
    }
  }

  const saveCalendar = async () => {
    if (!settings.calendar_id.trim()) {
      alert("Please enter a Calendar ID")
      return
    }
    
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/google/settings`, {
        method: "POST",
        headers: { "content-type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ calendar_id: settings.calendar_id }),
      })
      
      if (res.ok) {
        alert("Calendar settings saved successfully!")
        load()
      } else {
        alert("Error saving calendar settings")
      }
    } catch (error) {
      alert("Error saving calendar settings")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading integrations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Google Calendar Integration</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Connect your Google account to automatically sync approved leaves with Google Calendar</p>
        </div>

        {/* Connection Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                <span className="text-2xl">📅</span>
                Google Account Connection
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {connected ? 'Google account is connected and ready to sync' : 'Connect your Google account to enable calendar integration'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                connected 
                  ? 'text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-900/30' 
                  : 'text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900/30'
              }`}>
                {connected ? 'Connected' : 'Not Connected'}
              </span>
              <button 
                onClick={connectGoogle} 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {connected ? 'Reconnect' : 'Connect Google'}
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Calendar Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Google Calendar ID
              </label>
              <input
                type="text"
                value={settings.calendar_id || ""}
                onChange={(e) => setSettings({ ...settings, calendar_id: e.target.value })}
                placeholder="primary or your-calendar@group.calendar.google.com"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Enter the Calendar ID where leave events should be created. Use "primary" for your main calendar.
              </p>
            </div>
            
            <button 
              onClick={saveCalendar} 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-green-400 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Calendar Settings
            </button>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">How Google Calendar Integration Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="font-medium text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                <span className="text-lg">📝</span>
                Leave Approved
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                When a leave request is approved by a manager
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="font-medium text-green-900 dark:text-green-200 mb-2 flex items-center gap-2">
                <span className="text-lg">🔄</span>
                Auto Sync
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                System automatically creates an event in your Google Calendar
              </p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="font-medium text-purple-900 dark:text-purple-200 mb-2 flex items-center gap-2">
                <span className="text-lg">👥</span>
                Team Visibility
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Team members can see leave schedules in their shared calendar
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
