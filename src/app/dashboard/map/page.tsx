'use client'

// Live map page
// Real-time map display with bin locations and statuses
// Shows color-coded markers for bin fill levels

import React, { useEffect, useRef, useState } from 'react'
import { DashboardLayout } from '@/components/shared/DashboardLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/shared/Button'
import { SkeletonMap } from '@/components/shared/Skeleton'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Map as MapIcon,
  AlertCircle,
  Loader,
  Zap,
  X,
  Phone,
  Clock,
  Gauge,
  MapPin,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { binsService } from '@/services/firestore'
import { Bin } from '@/lib/types'
import { getBinStatusColor, getRelativeTime, formatDistance, calculateDistance } from '@/utils/helpers'
import { optimizeRoute } from '@/utils/routeOptimization'
import MapComponent from '@/components/dashboard/MapComponent'

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [showRoute, setShowRoute] = useState(false)
  const [optimizedRoute, setOptimizedRoute] = useState<any>(null)

  const { bins, fullBins, setShowBinDetail, setSelectedBin: setStoreBin } = useAppStore()

  // Initialize map (OpenStreetMap via Leaflet)
  useEffect(() => {
    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.warn('Geolocation error:', error)
          // Default to a central location
          setUserLocation({ lat: 28.7041, lng: 77.1025 }) // Delhi
        }
      )
    } else {
      setUserLocation({ lat: 28.7041, lng: 77.1025 })
    }

    setIsLoading(false)
  }, [])

  // Handle optimize route
  const handleOptimizeRoute = () => {
    if (userLocation && fullBins.length > 0) {
      const route = optimizeRoute(fullBins, userLocation.lat, userLocation.lng)
      setOptimizedRoute(route)
      setShowRoute(true)
    }
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Live Map"
        subtitle="Real-time bin locations and collection status"
        icon={MapIcon}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleOptimizeRoute}
              disabled={fullBins.length === 0}
              variant="secondary"
              icon={Zap}
            >
              Optimize Route
            </Button>
            <Link href="/dashboard">
              <Button variant="ghost">Back</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="lg:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
        >
          {isLoading ? (
            <SkeletonMap />
          ) : (
            <>
              {/* Map using OpenStreetMap (Leaflet) */}
              <div className="relative w-full h-96 lg:h-full">
                {userLocation ? (
                  // Dynamically import MapComponent client-side
                  <MapComponent
                    bins={bins}
                    userLocation={userLocation}
                    optimizedRoute={optimizedRoute}
                    onSelectBin={(b) => {
                      setSelectedBin(b)
                      setStoreBin(b)
                      setShowBinDetail(true)
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Loader className="w-8 h-8 text-gray-400 animate-spin" />
                  </div>
                )}

                {/* Bin markers legend */}
                <div className="absolute bottom-4 left-4 bg-white rounded-md p-3 shadow-md text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>Available (0-79%)</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
                    <span>Nearly Full (80-94%)</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <span>Full (95-100%)</span>
                  </div>
                </div>
              </div>

              {/* Route overlay (if optimized route is shown) */}
              {showRoute && optimizedRoute && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-4 left-4 right-4 bg-white rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-lg z-10 max-w-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Optimized Route</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          <strong>Distance:</strong> {formatDistance(optimizedRoute.totalDistance)}
                        </p>
                        <p>
                          <strong>Estimated Time:</strong> {optimizedRoute.estimatedTime} mins
                        </p>
                        <p>
                          <strong>Bins to Collect:</strong> {optimizedRoute.waypoints.length}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowRoute(false)}
                      className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </motion.div>

        {/* Sidebar - Bin details or Route info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg border border-gray-200 overflow-y-auto max-h-screen shadow-sm"
        >
          {selectedBin ? (
            <>
              {/* Bin details */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Bin #{selectedBin.id}</h3>
                    <p className="text-blue-100 text-sm mt-1">{selectedBin.location || 'Unknown'}</p>
                  </div>
                  <button
                    onClick={() => setSelectedBin(null)}
                    className="p-1 hover:bg-blue-500 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Fill percentage */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Fill Level</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {selectedBin.fillPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedBin.fillPercentage}%` }}
                      className={`h-full ${getBinStatusColor(selectedBin.fillPercentage)}`}
                    />
                  </div>
                </div>

                {/* Status badge */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${getBinStatusColor(
                      selectedBin.fillPercentage
                    )} ${selectedBin.fillPercentage >= 95 ? 'animate-pulse' : ''}`}
                  />
                  <span className="font-medium text-gray-900 capitalize">
                    {selectedBin.status}
                  </span>
                </div>

                {/* Last updated */}
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {getRelativeTime(selectedBin.lastUpdated)}
                </div>

                {/* Distance calculation */}
                {userLocation && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {formatDistance(calculateDistance(
                      userLocation.lat,
                      userLocation.lng,
                      selectedBin.latitude,
                      selectedBin.longitude
                    ))}
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-gray-200" />

                {/* Collection button */}
                {selectedBin.fillPercentage >= 80 && (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Mark as Collected
                  </Button>
                )}

                {/* Report button */}
                <Button variant="secondary" size="lg" className="w-full">
                  Report Issue
                </Button>
              </div>
            </>
          ) : showRoute && optimizedRoute ? (
            <>
              {/* Route details */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h3 className="text-lg font-bold text-white">Optimized Route</h3>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-1">
                    <strong>Total Distance:</strong>{' '}
                    {formatDistance(optimizedRoute.totalDistance)}
                  </p>
                  <p className="text-sm text-gray-700 mb-1">
                    <strong>Estimated Time:</strong> {optimizedRoute.estimatedTime} minutes
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Bins to Collect:</strong> {optimizedRoute.waypoints.length}
                  </p>
                </div>

                {/* Waypoints list */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Collection Sequence</h4>
                  <div className="space-y-2">
                    {optimizedRoute.waypoints.map((bin: Bin, index: number) => (
                      <motion.div
                        key={bin.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedBin(bin)}
                        className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors flex items-center gap-3"
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">Bin #{bin.id}</p>
                          <p className="text-xs text-gray-500 truncate">{bin.location}</p>
                        </div>
                        <Gauge className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Default sidebar */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h3 className="text-lg font-bold text-white">Bins Overview</h3>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Total Bins</span>
                    <span className="text-xl font-bold text-blue-600">{bins.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Full Bins</span>
                    <span className="text-xl font-bold text-red-600">{fullBins.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Nearly Full</span>
                    <span className="text-xl font-bold text-yellow-600">
                      {
                        bins.filter(
                          (b) => b.fillPercentage >= 80 && b.fillPercentage < 95
                        ).length
                      }
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs text-gray-500 mb-3">Click on a bin to view details</p>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {bins.map((bin, i) => (
                      <motion.div
                        key={bin.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        onClick={() => setSelectedBin(bin)}
                        className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            Bin #{bin.id}
                          </span>
                          <div
                            className={`w-2 h-2 rounded-full ${getBinStatusColor(
                              bin.fillPercentage
                            )}`}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {bin.fillPercentage.toFixed(0)}% filled
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
