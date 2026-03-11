'use client'

// Alerts page
// Displays all active alerts with action buttons

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/shared/DashboardLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/shared/Button'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  Trash2,
  CheckCircle,
  Clock,
  MapPin,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { getRelativeTime } from '@/utils/helpers'
import { alertsService } from '@/services/firestore'

export default function AlertsPage() {
  const { alerts } = useAppStore()
  const [resolvingIds, setResolvingIds] = useState<Set<string>>(new Set())

  // Separate resolved and unresolved alerts
  const unresolvedAlerts = alerts.filter((a) => !a.resolved)
  const resolvedAlerts = alerts.filter((a) => a.resolved)

  // Handle resolve alert
  const handleResolveAlert = async (alertId: string) => {
    setResolvingIds((prev) => new Set(prev).add(alertId))
    try {
      await alertsService.resolve(alertId)
    } catch (error) {
      console.error('Error resolving alert:', error)
    } finally {
      setResolvingIds((prev) => {
        const next = new Set(prev)
        next.delete(alertId)
        return next
      })
    }
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Alerts"
        subtitle="Real-time notifications and warnings"
        icon={AlertCircle}
      />

      {/* Alert stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <p className="text-gray-600 text-sm mb-2">Unresolved Alerts</p>
          <p className="text-4xl font-bold text-red-600">{unresolvedAlerts.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <p className="text-gray-600 text-sm mb-2">Resolved Alerts</p>
          <p className="text-4xl font-bold text-green-600">{resolvedAlerts.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <p className="text-gray-600 text-sm mb-2">Total Alerts</p>
          <p className="text-4xl font-bold text-gray-900">{alerts.length}</p>
        </motion.div>
      </div>

      {/* Unresolved alerts section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Alerts</h2>

        {unresolvedAlerts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white rounded-lg border border-gray-200"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-gray-700 text-lg font-medium">No active alerts</p>
            <p className="text-gray-500">All bins are within acceptable levels</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {unresolvedAlerts.map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white border-l-4 border-red-500 border rounded-lg p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                      <h3 className="font-bold text-gray-900">
                        {alert.severity.toUpperCase()} ALERT
                      </h3>
                    </div>

                    <p className="text-gray-700 mb-3">{alert.message}</p>

                    <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        <span>Bin #{alert.binId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{getRelativeTime(alert.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleResolveAlert(alert.id)}
                    isLoading={resolvingIds.has(alert.id)}
                    variant="primary"
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 ml-4"
                  >
                    Dismiss
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved alerts section */}
      {resolvedAlerts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Resolved Alerts</h2>

          <div className="space-y-4">
            {resolvedAlerts.slice(0, 10).map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-gray-50 border border-gray-200 rounded-lg p-6 opacity-75"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <h3 className="font-bold text-gray-900">RESOLVED</h3>
                    </div>

                    <p className="text-gray-600 mb-3">{alert.message}</p>

                    <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        <span>Bin #{alert.binId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{getRelativeTime(alert.resolvedAt || alert.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
