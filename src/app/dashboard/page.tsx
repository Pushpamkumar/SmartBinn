'use client'

// Dashboard main page
// Shows overview, stats, and recently collected bins

import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/shared/DashboardLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { SkeletonCard } from '@/components/shared/Skeleton'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BarChart3,
  AlertCircle,
  Trash2,
  TrendingUp,
  Map,
  ArrowRight,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { binsService, alertsService, collectionEventsService } from '@/services/firestore'
import { Bin, Alert } from '@/lib/types'

interface StatCard {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  trend?: string
}

export default function DashboardPage() {
  const { bins, fullBins, alerts } = useAppStore()
  const [stats, setStats] = useState<StatCard[]>([])
  const [recentCollections, setRecentCollections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true)
      try {
        // Get today's collections
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const collectionsToday = await collectionEventsService.getByDateRange(
          today.getTime(),
          tomorrow.getTime()
        )

        // Calculate stats
        const fullAlertsCount = alerts.filter((a) => a.severity === 'critical' && !a.resolved)
          .length

        setStats([
          {
            label: 'Total Bins',
            value: bins.length.toString(),
            icon: Trash2,
            color: 'from-blue-500 to-blue-600',
            trend: '+12%',
          },
          {
            label: 'Full Bins',
            value: fullBins.length.toString(),
            icon: AlertCircle,
            color: 'from-red-500 to-red-600',
            trend: fullBins.length > 5 ? 'Critical' : 'Normal',
          },
          {
            label: 'Active Alerts',
            value: fullAlertsCount.toString(),
            icon: AlertCircle,
            color: 'from-orange-500 to-orange-600',
          },
          {
            label: 'Collected Today',
            value: collectionsToday.length.toString(),
            icon: TrendingUp,
            color: 'from-green-500 to-green-600',
          },
        ])

        setRecentCollections(collectionsToday.slice(0, 5))
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [bins, fullBins, alerts])

  return (
    <DashboardLayout>
      <PageHeader
        title="Dashboard"
        subtitle="Real-time waste management overview"
        icon={BarChart3}
      />

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoading
          ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
          : stats.map((stat, i) => {
              const Icon = stat.icon

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    </div>
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  {stat.trend && (
                    <p className="text-sm text-gray-500">
                      <span className="text-green-600 font-medium">{stat.trend}</span>
                    </p>
                  )}
                </motion.div>
              )
            })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent collections */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Collections</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {recentCollections.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Trash2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No collections today yet</p>
              </div>
            ) : (
              recentCollections.map((collection, i) => (
                <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Bin #{collection.binId}</p>
                      <p className="text-sm text-gray-500">
                        Collected by {collection.collectedByUserId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">Collected</p>
                      <p className="text-xs text-gray-500">
                        {new Date(collection.collectedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          </div>

          <div className="p-6 space-y-3">
            <Link
              href="/dashboard/map"
              className="flex items-center justify-between p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Map className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">View Live Map</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            </Link>

            <Link
              href="/dashboard/alerts"
              className="flex items-center justify-between p-4 rounded-lg bg-red-50 hover:bg-red-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-gray-900">
                  View Alerts ({alerts.filter((a) => !a.resolved).length})
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            </Link>

            <Link
              href="/dashboard/analytics"
              className="flex items-center justify-between p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">View Analytics</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            </Link>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
