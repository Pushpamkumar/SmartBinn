'use client'

// Main navigation bar component
// Displays user info, notifications, and online status in top navbar

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { Bell, LogOut, User, Menu, X, Activity } from 'lucide-react'
import { authService } from '@/services/auth'

interface NavbarProps {
  onMenuClick?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const router = useRouter()
  const {
    currentUser,
    notificationCount,
    resetNotificationCount,
    isOnline,
    toggleSidebar,
  } = useAppStore()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  // Handle logout
  const handleLogout = async () => {
    try {
      await authService.logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-dropdown]')) {
        setShowDropdown(false)
        setShowNotifications(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-40">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left side - Logo and toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">SD</span>
            </div>
            <span className="font-bold text-gray-900 hidden md:inline">SmartDustbin</span>
          </Link>
        </div>

        {/* Right side - Status and user menu */}
        <div className="flex items-center gap-4">
          {/* Online Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
            <Activity
              className={`w-4 h-4 ${isOnline ? 'text-green-500' : 'text-red-500'}`}
            />
            <span className="text-sm font-medium text-gray-700">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Notifications Bell */}
          <div className="relative" data-dropdown>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications)
                setShowDropdown(false)
              }}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    {notificationCount > 0 && (
                      <button
                        onClick={() => {
                          resetNotificationCount()
                          setShowNotifications(false)
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  {notificationCount === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No notifications
                    </p>
                  ) : (
                    <p className="text-sm text-gray-700">
                      You have {notificationCount} new alert{notificationCount > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" data-dropdown>
            <button
              onClick={() => {
                setShowDropdown(!showDropdown)
                setShowNotifications(false)
              }}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {currentUser?.displayName?.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline text-sm font-medium text-gray-700">
                {currentUser?.displayName}
              </span>
            </button>

            {/* Profile Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <p className="font-semibold text-gray-900">
                    {currentUser?.displayName}
                  </p>
                  <p className="text-sm text-gray-500">{currentUser?.email}</p>
                  <p className="text-xs text-gray-400 mt-1 capitalize">
                    {currentUser?.role}
                  </p>
                </div>
                <div className="p-2">
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
