import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase.js"

export default function DebugConnection() {
  const [status, setStatus] = useState({
    supabase: "checking...",
    backend: "checking...",
    session: "checking..."
  })

  useEffect(() => {
    async function runTests() {
      // Test 1: Supabase connection
      try {
        const { data, error } = await supabase.from("profiles").select("count", { count: "exact", head: true })
        if (error) throw error
        setStatus(prev => ({ ...prev, supabase: "✅ Connected" }))
      } catch (err) {
        setStatus(prev => ({ ...prev, supabase: `❌ Error: ${err.message}` }))
      }

      // Test 2: Backend connection
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL
        const response = await fetch(`${backendUrl}/`)
        const data = await response.json()
        setStatus(prev => ({ ...prev, backend: `✅ Connected: ${data.name}` }))
      } catch (err) {
        setStatus(prev => ({ ...prev, backend: `❌ Error: ${err.message}` }))
      }

      // Test 3: Session check
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        setStatus(prev => ({ 
          ...prev, 
          session: session ? `✅ Logged in as: ${session.user.email}` : "❌ Not logged in" 
        }))
      } catch (err) {
        setStatus(prev => ({ ...prev, session: `❌ Error: ${err.message}` }))
      }
    }

    runTests()
  }, [])

  return (
    <div style={{ padding: 20, backgroundColor: "#f0f0f0", margin: 20 }}>
      <h3>🔧 Debug Connection Status</h3>
      <div><strong>Supabase:</strong> {status.supabase}</div>
      <div><strong>Backend:</strong> {status.backend}</div>
      <div><strong>Session:</strong> {status.session}</div>
      
      <h4>Environment Variables:</h4>
      <div><strong>VITE_SUPABASE_URL:</strong> {import.meta.env.VITE_SUPABASE_URL || "❌ Missing"}</div>
      <div><strong>VITE_BACKEND_URL:</strong> {import.meta.env.VITE_BACKEND_URL || "❌ Missing"}</div>
      <div><strong>VITE_SUPABASE_ANON_KEY:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? "✅ Present" : "❌ Missing"}</div>
    </div>
  )
}
