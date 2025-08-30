import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase.js"

export default function Approvals() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  async function load() {
    try {
      console.log('Loading approvals...');
      const token = (await supabase.auth.getSession()).data.session?.access_token
      console.log('Token exists:', !!token);
      console.log('Backend URL:', import.meta.env.VITE_BACKEND_URL);
      
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/approvals`;
      console.log('Making request to:', url);
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);
      
      if (res.ok) {
        const data = await res.json()
        console.log('Approvals data:', data);
        setRows(data || [])
      } else {
        const errorText = await res.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error("Error loading approvals:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const updateStatus = async (id, status) => {
    try {
      console.log(`Attempting to update leave ${id} to status ${status}`);
      const token = (await supabase.auth.getSession()).data.session?.access_token
      console.log('Token exists:', !!token);
      console.log('Backend URL:', import.meta.env.VITE_BACKEND_URL);
      
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/approvals/${id}`;
      console.log('Making request to:', url);
      
      const res = await fetch(url, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status }),
      })
      
      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);
      
      if (res.ok) {
        const responseData = await res.json();
        console.log('Success response:', responseData);
        alert(`Leave request ${status.toLowerCase()} successfully`)
        load()
      } else {
        const errorData = await res.text();
        console.error('Error response:', errorData);
        alert(`Error ${status.toLowerCase()}ing leave request: ${errorData}`)
      }
    } catch (error) {
      console.error('Network error:', error);
      alert(`Error ${status.toLowerCase()}ing leave request: ${error.message}`)
    }
  }

  const getStatusBadge = (status) => {
    const classes = {
      PENDING: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-900/30",
      APPROVED: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-900/30", 
      REJECTED: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900/30",
      CANCELLED: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-900/30"
    }
    return <span className={classes[status] || "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-900/30"}>{status}</span>
  }

  const filteredRows = rows.filter(r => {
    if (filter === 'ALL') return true
    return r.status === filter
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading approval requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leave Approvals</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Review and approve leave requests from your team
          </p>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Approval Hierarchy:</strong> Members → Manager approval • Managers → Admin approval • Admins don't need approval
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Filter:</span>
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === status 
                    ? 'text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600' 
                    : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {filteredRows.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center">
              <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {filter === 'ALL' ? 'No leave requests to review' : `No ${filter.toLowerCase()} requests found`}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">Check back later for new requests to review</p>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Leave Type</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dates</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredRows.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {r.profiles?.full_name || r.profiles?.email || 'Unknown User'}
                        </div>
                        {r.profiles?.email && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {r.profiles.email}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {r.leave_types?.name || r.leave_type_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{r.start_date}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">to {r.end_date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {r.total_days ? `${r.total_days} day${r.total_days !== '1' ? 's' : ''}` : '-'}
                        </div>
                        {r.half_day && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">Half day</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(r.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                          {r.reason || <span className="text-gray-400 dark:text-gray-500">No reason provided</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {r.status === "PENDING" && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => updateStatus(r.id, "APPROVED")} 
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Approve
                            </button>
                            <button 
                              onClick={() => updateStatus(r.id, "REJECTED")} 
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
