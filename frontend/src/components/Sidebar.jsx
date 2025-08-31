import { Link, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { useTheme } from "../contexts/ThemeContext"
import React from "react";

export default function Sidebar({ profile, onSignOut }) {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  
  const role = profile?.role || "MEMBER"

  // Stabilize avatar to prevent flicker
  const [avatar, setAvatar] = useState("/placeholder-user.jpg");

  useEffect(() => {
    if (profile?.avatar_url) {
      setAvatar(profile.avatar_url);
    }
  }, [profile?.avatar_url]);

  const isActive = (path) => {
    return location.pathname === path
  }

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "🏠", roles: ["MEMBER", "MANAGER", "ADMIN"] },
    { path: "/apply-leave", label: "Apply Leave", icon: "➕", roles: ["MEMBER", "MANAGER"] }, // No ADMIN
    { path: "/my-leaves", label: "My Leaves", icon: "📋", roles: ["MEMBER", "MANAGER"] }, // No ADMIN
    { path: "/approvals", label: "Approvals", icon: "✅", roles: ["MANAGER", "ADMIN"] },
  ]

  const adminItems = [
    { path: "/admin/leave-types", label: "Leave Types", icon: "🏷️" },
    { path: "/admin/users", label: "User Assignments", icon: "👥" },
    { path: "/admin/roles", label: "Role Management", icon: "🔒" },
    { path: "/admin/user-leave-types", label: "Leave Type Assignments", icon: "📝" },
    { path: "/admin/projects", label: "Projects", icon: "🏢" },
    { path: "/admin/regions", label: "Regions", icon: "🌍" },
    { path: "/admin/groups", label: "Groups", icon: "👥" },
    { path: "/admin/integrations", label: "Integrations", icon: "🔗" },
  ]

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <Link to="/dashboard" className="flex items-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            LeaveManager
          </div>
        </Link>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <img
            src={profile?.avatar_url || avatar}
            alt="Profile"
            className="w-10 h-10 rounded-full"
            onError={(e) => { e.currentTarget.src = '/placeholder-user.jpg' }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {profile?.full_name || "User"}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {profile?.email}
              </p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                role === 'ADMIN' 
                  ? 'text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900/30' 
                  : role === 'MANAGER'
                  ? 'text-purple-800 dark:text-purple-200 bg-purple-100 dark:bg-purple-900/30'
                  : 'text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/30'
              }`}>
                {role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 p-4 space-y-2">
        {/* Main Navigation */}
        <div className="space-y-1">
          {navItems.map((item) => {
            if (!item.roles.includes(role)) return null
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Admin Section */}
        {role === "ADMIN" && (
          <>
            <div className="pt-4">
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Administration
              </h3>
              <div className="mt-2 space-y-1">
                {adminItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Footer Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <button
          onClick={toggleTheme}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="mr-3">{theme === 'dark' ? '☀️' : '🌙'}</span>
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        
        <button
          onClick={onSignOut}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <span className="mr-3">🚪</span>
          Sign Out
        </button>
      </div>
    </div>
  )
}