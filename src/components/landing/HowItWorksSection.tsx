'use client'

// How it works section - step-by-step process

import React from 'react'
import { motion } from 'framer-motion'
import { Smartphone, Cloud, Bell, Truck } from 'lucide-react'

interface Step {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  step: number
}

const steps: Step[] = [
  {
    icon: Smartphone,
    title: 'Sensor Detection',
    description: 'IoT sensors in bins detect fill levels in real-time',
    step: 1,
  },
  {
    icon: Cloud,
    title: 'Data to Cloud',
    description: 'Data is securely transmitted to our cloud platform',
    step: 2,
  },
  {
    icon: Bell,
    title: 'Admin Alerts',
    description: 'Admins receive instant notifications when bins are full',
    step: 3,
  },
  {
    icon: Truck,
    title: 'Vehicle Dispatch',
    description: 'Optimal route calculated and collection vehicle dispatched',
    step: 4,
  },
]

export const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From detection to collection in just four simple steps
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, index) => {
            const Icon = item.icon

            return (
              <div key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="h-full"
                >
                  <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm h-full flex flex-col relative">
                    {/* Step number badge */}
                    <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      {item.step}
                    </div>

                    {/* Icon */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center mb-4 mt-4">
                      <Icon className="w-8 h-8 text-blue-600" />
                    </div>

                    {/* Title and description */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm flex-grow">{item.description}</p>

                    {/* Connector arrow */}
                    {index < steps.length - 1 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        className="hidden lg:flex absolute -right-6 top-1/2 transform -translate-y-1/2 text-gray-300 text-2xl"
                      >
                        →
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
