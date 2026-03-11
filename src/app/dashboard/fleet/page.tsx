'use client'

// Fleet management page
// Track collection vehicles and their routes

import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/shared/DashboardLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { motion } from 'framer-motion'
import { Zap, Truck, MapPin, Activity, Clock, Navigation } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { fleetService } from '@/services/firestore'
import { FleetVehicle } from '@/lib/types'

export default function FleetPage() {
  const { isOnline } = useAppStore()
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Subscribe to fleet updates
  useEffect(() => {
    setIsLoading(true)
    const unsubscribe = fleetService.subscribeAll((updatedVehicles) => {
      setVehicles(updatedVehicles)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Sample vehicles for demo
  const demoVehicles: FleetVehicle[] = [
    {
      id: 'v1',
      vehicleNumber: 'DL-01-AB-1234',
      driverId: 'driver1',
      driverName: 'Rajesh Kumar',
      latitude: 28.7041,
      longitude: 77.1025,
      status: 'on_route',
      currentRoute: {
        startedAt: Date.now() - 3600000,
        estimatedEndTime: Date.now() + 7200000,
        binsToCollect: ['bin1', 'bin2', 'bin3', 'bin4', 'bin5'],
        binsCollected: ['bin1', 'bin2'],
      },
      lastUpdated: Date.now(),
    },
    {
      id: 'v2',
      vehicleNumber: 'DL-02-CD-5678',
      driverId: 'driver2',
      driverName: 'Priya Singh',
      latitude: 28.6139,
      longitude: 77.209,
      status: 'collecting',
      currentRoute: {
        startedAt: Date.now() - 1800000,
        estimatedEndTime: Date.now() + 5400000,
        binsToCollect: ['bin6', 'bin7', 'bin8'],
        binsCollected: ['bin6'],
      },
      lastUpdated: Date.now(),
    },
    {
      id: 'v3',
      vehicleNumber: 'DL-03-EF-9012',
      driverId: 'driver3',
      driverName: 'Amit Patel',
      latitude: 28.5355,
      longitude: 77.391,
      status: 'available',
      lastUpdated: Date.now(),
    },
  ]

  const statusColors: Record<string, { bg: string; text: string; icon: React.ComponentType }> = {
    available: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      icon: CheckCircle,
    },
    on_route: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      icon: Truck,
    },
    collecting: {
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      icon: Activity,
    },
  }

  const displayVehicles = vehicles.length > 0 ? vehicles : demoVehicles

  return (
    <DashboardLayout>
      <PageHeader
        title="Fleet Management"
        subtitle="Real-time vehicle tracking and route monitoring"
        icon={Truck}
      />

      {/* Fleet stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total Vehicles',
            value: displayVehicles.length.toString(),
            icon: Truck,
          },
          {
            label: 'On Route',
            value: displayVehicles.filter((v) => v.status === 'on_route').length.toString(),
            icon: Navigation,
          },
          {
            label: 'Collecting',
            value: displayVehicles.filter((v) => v.status === 'collecting').length.toString(),
            icon: Activity,
          },
          {
            label: 'Available',
            value: displayVehicles.filter((v) => v.status === 'available').length.toString(),
            icon: Zap,
          },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Vehicles grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {displayVehicles.map((vehicle, i) => {
          const statusInfo = statusColors[vehicle.status] || statusColors.available
          const StatusIcon = statusInfo.icon

          return (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{vehicle.vehicleNumber}</h3>
                    <p className="text-blue-100 text-sm">{vehicle.driverName}</p>
                  </div>
                  <div className={`${statusInfo.bg} ${statusInfo.text} px-3 py-1 rounded-full text-sm font-semibold`}>
                    {vehicle.status === 'on_route'
                      ? 'On Route'
                      : vehicle.status === 'collecting'
                      ? 'Collecting'
                      : 'Available'}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Location */}
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Current Location</p>
                    <p className="font-medium text-gray-900">
                      {vehicle.latitude.toFixed(4)}, {vehicle.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>

                {/* Status icon and info */}
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <p className="font-medium text-gray-900 capitalize">{vehicle.status}</p>
                  </div>
                </div>

                {/* Current route (if active) */}
                {vehicle.currentRoute && (
                  <>
                    <div className="border-t border-gray-200 pt-4 space-y-3">
                      <h4 className="font-semibold text-gray-900 text-sm">Current Route</h4>

                      <div className="flex items-start gap-3">
                        <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Estimated Completion</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(vehicle.currentRoute.estimatedEndTime).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      {/* Bins collected */}
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Bins Collected</p>
                        <div className="flex flex-wrap gap-2">
                          {vehicle.currentRoute.binsCollected.map((binId, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"
                            >
                              ✓ {binId}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Remaining bins */}
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Remaining Bins</p>
                        <div className="flex flex-wrap gap-2">
                          {vehicle.currentRoute?.binsToCollect
                            .filter((b) => !vehicle.currentRoute?.binsCollected.includes(b))
                            .map((binId, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold"
                              >
                                {binId}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Map placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 bg-white rounded-lg border border-gray-200 p-8 shadow-sm"
      >
        <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
          <div className="text-center">
            <Navigation className="w-16 h-16 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Fleet Map</p>
            <p className="text-gray-500 text-sm">
              In production, this would show real-time vehicle locations
            </p>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}

// Icon component
const CheckCircle = ({ className = '' }: { className?: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  </svg>
)
