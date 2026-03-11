'use client'

// Settings page
// User preferences, notification settings, and account management

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/shared/DashboardLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/shared/Button'
import { motion } from 'framer-motion'
import { Settings, Bell, Lock, Eye, EyeOff, Save } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { requestNotificationPermission } from '@/services/sensorSimulation'
import { authService } from '@/services/auth'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const { currentUser } = useAppStore()

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    pushNotifications: true,
    weeklyReports: true,
    criticalOnly: false,
    quietHours: false,
    quietStart: '22:00',
    quietEnd: '06:00',
  })

  const [generalSettings, setGeneralSettings] = useState({
    theme: 'light',
    language: 'en',
  })

  const [isSaving, setIsSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Handle settings save
  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      // In production, would save to backend
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle enable notifications
  const handleEnableNotifications = async () => {
    try {
      await requestNotificationPermission()
      setNotificationSettings((prev) => ({
        ...prev,
        pushNotifications: true,
      }))
    } catch (error) {
      console.error('Error enabling notifications:', error)
    }
  }

  // Handle logout
  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await authService.logout()
        router.push('/')
      } catch (error) {
        console.error('Logout error:', error)
      }
    }
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences"
        icon={Settings}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-6">Profile Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={currentUser?.displayName || ''}
                  readOnly
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={currentUser?.email || ''}
                  readOnly
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <input
                  type="text"
                  value={currentUser?.role || ''}
                  readOnly
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 capitalize"
                />
              </div>
            </div>
          </motion.div>

          {/* Notification settings */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">Notification Settings</h2>
            </div>

            <div className="space-y-4">
              {/* Email alerts */}
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-all">
                <div>
                  <p className="font-medium text-gray-900">Email Alerts</p>
                  <p className="text-sm text-gray-600">Receive alerts via email</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.emailAlerts}
                  onChange={(e) =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      emailAlerts: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
              </label>

              {/* Push notifications */}
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-all">
                <div>
                  <p className="font-medium text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-600">Browser notifications for urgent alerts</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.pushNotifications}
                  onChange={(e) =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      pushNotifications: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
              </label>

              {/* Weekly reports */}
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-all">
                <div>
                  <p className="font-medium text-gray-900">Weekly Reports</p>
                  <p className="text-sm text-gray-600">Get weekly summary reports</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.weeklyReports}
                  onChange={(e) =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      weeklyReports: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
              </label>

              {/* Critical only */}
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-all">
                <div>
                  <p className="font-medium text-gray-900">Critical Alerts Only</p>
                  <p className="text-sm text-gray-600">Only notify for critical events</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.criticalOnly}
                  onChange={(e) =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      criticalOnly: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
              </label>

              {/* Quiet hours */}
              <div className="border-t border-gray-200 pt-4">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-all mb-4">
                  <div>
                    <p className="font-medium text-gray-900">Quiet Hours</p>
                    <p className="text-sm text-gray-600">No notifications during these hours</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.quietHours}
                    onChange={(e) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        quietHours: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                </label>

                {notificationSettings.quietHours && (
                  <div className="space-y-3 ml-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={notificationSettings.quietStart}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            quietStart: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={notificationSettings.quietEnd}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            quietEnd: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-6">Preferences</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <select
                  value={generalSettings.theme}
                  onChange={(e) =>
                    setGeneralSettings((prev) => ({
                      ...prev,
                      theme: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select
                  value={generalSettings.language}
                  onChange={(e) =>
                    setGeneralSettings((prev) => ({
                      ...prev,
                      language: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Save button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4"
          >
            <Button
              onClick={handleSaveSettings}
              isLoading={isSaving}
              size="lg"
              icon={Save}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Changes
            </Button>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Danger zone */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-red-50 border border-red-200 rounded-lg p-6 shadow-sm"
          >
            <h3 className="text-lg font-bold text-red-900 mb-4">Danger Zone</h3>

            <div className="space-y-3">
              <Button
                onClick={handleLogout}
                variant="danger"
                size="lg"
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Logout
              </Button>

              <Button variant="secondary" size="lg" className="w-full">
                Delete Account
              </Button>
            </div>

            <p className="text-xs text-red-600 mt-4">
              Deleting your account is permanent and cannot be undone.
            </p>
          </motion.div>

          {/* Session info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Session</h3>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Last Login</p>
                <p className="font-medium text-gray-900">
                  {currentUser?.lastLogin ? new Date(currentUser.lastLogin).toLocaleString() : 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-gray-600 mb-1">Account Created</p>
                <p className="font-medium text-gray-900">
                  {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-gray-600 mb-1">Status</p>
                <p className="font-medium text-green-600">Active</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}
