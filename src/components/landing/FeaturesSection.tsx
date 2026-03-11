'use client'

// Features section for landing page
// Showcases key product features

import React from 'react'
import { motion } from 'framer-motion'
import {
  Zap,
  Bell,
  Route,
  Smartphone,
  BarChart3,
  WifiOff,
  Trello,
  TrendingUp,
} from 'lucide-react'

interface Feature {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  color: string
}

const features: Feature[] = [
  {
    icon: Zap,
    title: 'Real-time Monitoring',
    description: 'Get live updates on bin fill levels across your entire city',
    color: 'from-yellow-400 to-orange-500',
  },
  {
    icon: Bell,
    title: 'Auto Alerts',
    description: 'Automatic notifications when bins reach capacity',
    color: 'from-red-400 to-pink-500',
  },
  {
    icon: Route,
    title: 'Route Optimization',
    description: 'AI-optimized collection routes to save fuel and time',
    color: 'from-green-400 to-emerald-500',
  },
  {
    icon: Smartphone,
    title: 'Admin Fleet Tracking',
    description: 'Track collection vehicles in real-time from your dashboard',
    color: 'from-blue-400 to-cyan-500',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Detailed insights into waste patterns and collection efficiency',
    color: 'from-purple-400 to-indigo-500',
  },
  {
    icon: WifiOff,
    title: 'Offline Sync',
    description: 'Seamless data sync when network connectivity returns',
    color: 'from-teal-400 to-blue-500',
  },
]

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-24 bg-white" id="features">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage waste collection efficiently and sustainably
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 border border-gray-200 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-lg bg-gradient-to-br ${feature.color} p-3 mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-full h-full text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>

                {/* Arrow */}
                <div className="mt-4 text-gray-300 group-hover:text-gray-400 transition-colors">
                  →
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
