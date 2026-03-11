'use client'

// Analytics page
// Displays charts, metrics, and insights about waste collection

import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/shared/DashboardLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Clock,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'

// Sample data
const collectionData = [
  { name: 'Mon', collections: 24, completed: 22 },
  { name: 'Tue', collections: 19, completed: 18 },
  { name: 'Wed', collections: 28, completed: 26 },
  { name: 'Thu', collections: 35, completed: 33 },
  { name: 'Fri', collections: 42, completed: 41 },
  { name: 'Sat', collections: 31, completed: 30 },
  { name: 'Sun', collections: 15, completed: 15 },
]

const fillDistribution = [
  { name: 'Available', value: 65, color: '#10b981' },
  { name: 'Nearly Full', value: 20, color: '#f59e0b' },
  { name: 'Full', value: 15, color: '#ef4444' },
]

const wasteTypeData = [
  { name: 'Organic', value: 35 },
  { name: 'Plastic', value: 25 },
  { name: 'Paper', value: 20 },
  { name: 'Metal', value: 10 },
  { name: 'Other', value: 10 },
]

const hourlyData = [
  { hour: '00:00', bins: 5 },
  { hour: '06:00', bins: 12 },
  { hour: '12:00', bins: 28 },
  { hour: '18:00', bins: 35 },
  { hour: '23:00', bins: 18 },
]

export default function AnalyticsPage() {
  const { bins, fullBins } = useAppStore()

  const [metrics, setMetrics] = useState({
    totalBins: 0,
    avgFillTime: 0,
    collectionEfficiency: 0,
    costSavings: 0,
  })

  useEffect(() => {
    setMetrics({
      totalBins: bins.length,
      avgFillTime: Math.round(Math.random() * 48) + 24, // 24-72 hours
      collectionEfficiency: Math.round(Math.random() * 20 + 80), // 80-100%
      costSavings: Math.round(Math.random() * 5000) + 2000, // $2000-$7000
    })
  }, [bins])

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6']

  return (
    <DashboardLayout>
      <PageHeader
        title="Analytics"
        subtitle="Waste collection insights and performance metrics"
        icon={BarChart3}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            label: 'Total Bins',
            value: metrics.totalBins,
            unit: '',
            icon: '📊',
            color: 'from-blue-500 to-blue-600',
          },
          {
            label: 'Avg Fill Time',
            value: metrics.avgFillTime,
            unit: 'hrs',
            icon: '⏱️',
            color: 'from-purple-500 to-purple-600',
          },
          {
            label: 'Collection Efficiency',
            value: metrics.collectionEfficiency,
            unit: '%',
            icon: '✅',
            color: 'from-green-500 to-green-600',
          },
          {
            label: 'Cost Savings',
            value: `$${metrics.costSavings}`,
            unit: '/mo',
            icon: '💰',
            color: 'from-emerald-500 to-emerald-600',
          },
        ].map((metric, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm mb-1">{metric.label}</p>
                <p className="text-3xl font-bold text-gray-900">
                  {metric.value}
                  <span className="text-lg text-gray-500 ml-1">{metric.unit}</span>
                </p>
              </div>
              <span className="text-2xl">{metric.icon}</span>
            </div>
            <p className="text-xs text-green-600 font-medium">↑ 12% vs last month</p>
          </motion.div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Collections over time */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">Weekly Collections</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={collectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Bar dataKey="collections" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="completed" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bin status distribution */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">Bin Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={fillDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {fillDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Hourly bin fill rate */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">Average Hourly Fill Rate</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="hour" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Line
                type="monotone"
                dataKey="bins"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ fill: '#0ea5e9', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Performance metrics */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6">Performance Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={wasteTypeData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="name" stroke="#6b7280" />
              <PolarRadiusAxis stroke="#6b7280" />
              <Radar
                name="Distribution %"
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.4}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Summary section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-lg font-bold mb-2">Peak Hour</h4>
            <p className="text-3xl font-bold">6:00 PM</p>
            <p className="text-blue-100 text-sm mt-1">Most bins filled daily</p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-2">Avg Response Time</h4>
            <p className="text-3xl font-bold">12 mins</p>
            <p className="text-blue-100 text-sm mt-1">Alert to collection dispatch</p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-2">Route Efficiency</h4>
            <p className="text-3xl font-bold">87%</p>
            <p className="text-blue-100 text-sm mt-1">Optimal route utilization</p>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}
