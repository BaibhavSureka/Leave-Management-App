import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase.js"

export default function AdminRoleManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)

  async function loadUsers() {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      
      // Get current user info
      const currentRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (currentRes.ok) {
        const currentData = await currentRes.json()
        setCurrentUser(currentData)
      }

      // Get all users
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(data || [])
      }
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const updateUserRole = async (userId, newRole) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { 
          "content-type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ role: newRole }),
      })
      
      if (res.ok) {
        alert("User role updated successfully!")
        loadUsers()
      } else {
        alert("Error updating user role")
      }
    } catch (error) {
      alert("Error updating user role")
    }
  }

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'ADMIN': return 'text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900/30'
      case 'MANAGER': return 'text-purple-800 dark:text-purple-200 bg-purple-100 dark:bg-purple-900/30'
      case 'MEMBER': return 'text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/30'
      default: return 'text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-900/30'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Role Management</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Manage user roles and permissions across the organization</p>
        </div>

        {/* Role Explanation */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">Role Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900/30 mr-2">ADMIN</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Full Access</span>
              </div>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Manage leave types</li>
                <li>• Assign leave types to users</li>
                <li>• Manage user roles</li>
                <li>• Configure integrations</li>
                <li>• Approve/reject leaves</li>
                <li>• Apply for leaves</li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-purple-800 dark:text-purple-200 bg-purple-100 dark:bg-purple-900/30 mr-2">MANAGER</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Approval Rights</span>
              </div>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Approve/reject team leaves</li>
                <li>• View team leave requests</li>
                <li>• Apply for leaves</li>
                <li>• View own leave history</li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/30 mr-2">MEMBER</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Basic Access</span>
              </div>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Apply for leaves</li>
                <li>• View own leave history</li>
                <li>• Cancel own leaves</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Users ({users.length})</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Current Role</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.avatar_url && (
                          <img className="h-8 w-8 rounded-full mr-3" src={user.avatar_url} alt="" />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.full_name || 'No name set'}
                          </div>
                          {currentUser?.user?.id === user.id && (
                            <div className="text-xs text-blue-600 dark:text-blue-400">You</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {currentUser?.user?.id !== user.id && (
                        <div className="flex gap-2">
                          {user.role !== 'ADMIN' && (
                            <button
                              onClick={() => updateUserRole(user.id, 'ADMIN')}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50"
                            >
                              Make Admin
                            </button>
                          )}
                          {user.role !== 'MANAGER' && (
                            <button
                              onClick={() => updateUserRole(user.id, 'MANAGER')}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50"
                            >
                              Make Manager
                            </button>
                          )}
                          {user.role !== 'MEMBER' && (
                            <button
                              onClick={() => updateUserRole(user.id, 'MEMBER')}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                            >
                              Make Member
                            </button>
                          )}
                        </div>
                      )}
                      {currentUser?.user?.id === user.id && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">Cannot change own role</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Important Notes</h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <ul className="list-disc space-y-1 pl-5">
                  <li><strong>First Admin Setup:</strong> The first user needs to be manually promoted to ADMIN via database</li>
                  <li><strong>Self-Protection:</strong> You cannot change your own role for security</li>
                  <li><strong>ADMIN Access:</strong> Only ADMIN users can access this role management page</li>
                  <li><strong>Immediate Effect:</strong> Role changes take effect immediately after page refresh</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
