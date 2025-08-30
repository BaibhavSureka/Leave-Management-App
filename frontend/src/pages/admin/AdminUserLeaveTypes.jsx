import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase.js"

export default function AdminUserLeaveTypes() {
  const [users, setUsers] = useState([])
  const [leaveTypes, setLeaveTypes] = useState([])
  const [userLeaveTypes, setUserLeaveTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState("")

  async function loadData() {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      
      // Load users
      const usersRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const usersData = await usersRes.json()
      setUsers(usersData || [])

      // Load leave types
      const leaveTypesRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/leave-types`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const leaveTypesData = await leaveTypesRes.json()
      setLeaveTypes(leaveTypesData || [])

      // Load user leave type assignments
      const assignmentsRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/user-leave-types`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const assignmentsData = await assignmentsRes.json()
      setUserLeaveTypes(assignmentsData || [])

    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const toggleLeaveTypeAssignment = async (userId, leaveTypeId, isAssigned) => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      
      if (isAssigned) {
        // Remove assignment
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/user-leave-types`, {
          method: "DELETE",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ user_id: userId, leave_type_id: leaveTypeId }),
        })
        
        if (res.ok) {
          setUserLeaveTypes(prev => prev.filter(ult => 
            !(ult.user_id === userId && ult.leave_type_id === leaveTypeId)
          ))
        }
      } else {
        // Add assignment
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/user-leave-types`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ user_id: userId, leave_type_id: leaveTypeId }),
        })
        
        if (res.ok) {
          const newAssignment = await res.json()
          setUserLeaveTypes(prev => [...prev, newAssignment])
        }
      }
    } catch (error) {
      console.error("Error toggling leave type assignment:", error)
      alert("Error updating leave type assignment")
    }
  }

  const assignAllLeaveTypes = async (userId) => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      
      for (const leaveType of leaveTypes) {
        const isAssigned = userLeaveTypes.some(ult => 
          ult.user_id === userId && ult.leave_type_id === leaveType.id
        )
        
        if (!isAssigned) {
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/user-leave-types`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ user_id: userId, leave_type_id: leaveType.id }),
          })
          
          if (res.ok) {
            const newAssignment = await res.json()
            setUserLeaveTypes(prev => [...prev, newAssignment])
          }
        }
      }
    } catch (error) {
      console.error("Error assigning all leave types:", error)
      alert("Error assigning all leave types")
    }
  }

  const isLeaveTypeAssigned = (userId, leaveTypeId) => {
    return userLeaveTypes.some(ult => 
      ult.user_id === userId && ult.leave_type_id === leaveTypeId
    )
  }

  const filteredUsers = selectedUser 
    ? users.filter(user => user.id === selectedUser)
    : users

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            User Leave Type Assignments
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage which leave types each user can apply for
          </p>
        </div>

        {/* User Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filter by User
          </label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Users</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        {/* Assignment Matrix */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  {leaveTypes.map((leaveType) => (
                    <th key={leaveType.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {leaveType.name}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.full_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN' 
                          ? 'text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900/30' 
                          : user.role === 'MANAGER'
                          ? 'text-purple-800 dark:text-purple-200 bg-purple-100 dark:bg-purple-900/30'
                          : 'text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/30'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    {leaveTypes.map((leaveType) => {
                      const isAssigned = isLeaveTypeAssigned(user.id, leaveType.id)
                      return (
                        <td key={leaveType.id} className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => toggleLeaveTypeAssignment(user.id, leaveType.id, isAssigned)}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                              isAssigned
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/50'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                            title={isAssigned ? 'Click to remove' : 'Click to assign'}
                          >
                            {isAssigned ? '✓' : '−'}
                          </button>
                        </td>
                      )
                    })}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => assignAllLeaveTypes(user.id)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                      >
                        Assign All
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <span className="text-green-800 dark:text-green-200 text-xs">✓</span>
            </div>
            <span>Assigned</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500 text-xs">−</span>
            </div>
            <span>Not Assigned</span>
          </div>
        </div>
      </div>
    </div>
  )
}
