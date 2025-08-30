import { useEffect, useState } from "react"
import { Routes, Route, Navigate, useNavigate } from "react-router-dom"
import { supabase } from "./lib/supabase.js"
import { ThemeProvider, useTheme } from "./contexts/ThemeContext.jsx"
import Sidebar from "./components/Sidebar.jsx"
import Login from "./pages/Login.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import ApplyLeave from "./pages/ApplyLeave.jsx"
import MyLeaves from "./pages/MyLeaves.jsx"
import Approvals from "./pages/Approvals.jsx"
import AdminLeaveTypes from "./pages/admin/AdminLeaveTypes.jsx"
import AdminIntegrations from "./pages/admin/AdminIntegrations.jsx"
import AdminUserAssignments from "./pages/admin/AdminUserAssignments.jsx"
import AdminRoleManagement from "./pages/admin/AdminRoleManagement.jsx"
import AdminUserLeaveTypes from "./pages/admin/AdminUserLeaveTypes.jsx"
import AdminProjects from "./pages/admin/AdminProjects.jsx"
import AdminRegions from "./pages/admin/AdminRegions.jsx"
import AdminGroups from "./pages/admin/AdminGroups.jsx"

function useSession() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    
    // Listen for auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })
    
    return () => sub.subscription.unsubscribe()
  }, [])
  
  return { session, loading }
}

function PrivateRoute({ children }) {
  const { session, loading } = useSession()
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }
  if (!session) return <Navigate to="/login" replace />
  return children
}

function Layout({ children }) {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  
  useEffect(() => {
    ;(async () => {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      if (!token) {
        setProfileLoading(false)
        return
      }
      
      try {
        console.log("🔍 Fetching profile with token:", token.substring(0, 20) + "...")
        
        // First, try to get existing profile
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        
        console.log("📝 Profile response:", data)
        
        if (data?.profile) {
          setProfile(data.profile)
        } else if (data?.user && !data?.profile) {
          // Profile doesn't exist, create it
          console.log("Creating profile for user:", data.user.email)
          const createRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/profiles/upsert`, {
            method: "POST",
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              full_name: data.user.user_metadata?.full_name || data.user.email,
              avatar_url: data.user.user_metadata?.avatar_url || ""
            }),
          })
          
          if (createRes.ok) {
            console.log("✅ Profile created successfully")
            // Retry fetching profile
            const retryRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            const retryData = await retryRes.json()
            if (retryData?.profile) {
              setProfile(retryData.profile)
            }
          } else {
            console.error("❌ Failed to create profile:", await createRes.text())
          }
        }
      } catch (error) {
        console.error("Error fetching/creating profile:", error)
      } finally {
        setProfileLoading(false)
      }
    })()
  }, [])

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Setting up your profile...</p>
        </div>
      </div>
    )
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar profile={profile} onSignOut={handleSignOut} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/apply-leave"
          element={
            <PrivateRoute>
              <Layout>
                <ApplyLeave />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/my-leaves"
          element={
            <PrivateRoute>
              <Layout>
                <MyLeaves />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/approvals"
          element={
            <PrivateRoute>
              <Layout>
                <Approvals />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/leave-types"
          element={
            <PrivateRoute>
              <Layout>
                <AdminLeaveTypes />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute>
              <Layout>
                <AdminUserAssignments />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <PrivateRoute>
              <Layout>
                <AdminRoleManagement />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/user-leave-types"
          element={
            <PrivateRoute>
              <Layout>
                <AdminUserLeaveTypes />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/integrations"
          element={
            <PrivateRoute>
              <Layout>
                <AdminIntegrations />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/projects"
          element={
            <PrivateRoute>
              <Layout>
                <AdminProjects />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/regions"
          element={
            <PrivateRoute>
              <Layout>
                <AdminRegions />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/groups"
          element={
            <PrivateRoute>
              <Layout>
                <AdminGroups />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/integrations/success"
          element={
            <PrivateRoute>
              <Layout>
                <div className="p-6">
                  <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Google Calendar Connected Successfully!</h3>
                        <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                          <p>Your Google account has been connected and calendar integration is now active.</p>
                        </div>
                        <div className="mt-4">
                          <a
                            href="/admin/integrations"
                            className="text-sm font-medium text-green-800 dark:text-green-200 hover:text-green-900 dark:hover:text-green-100"
                          >
                            Return to Integrations →
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Layout>
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

function AppWithTheme() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  )
}

export default AppWithTheme
