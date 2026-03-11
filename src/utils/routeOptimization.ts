// Route optimization algorithm
// Implements nearest-neighbor algorithm for efficient collection routes

import { Bin } from '@/lib/types'
import { calculateDistance } from '@/utils/helpers'

export interface RouteOptimizationResult {
  waypoints: Bin[]
  totalDistance: number
  estimatedTime: number // in minutes
  polylinePath: Array<{ lat: number; lng: number }>
}

/**
 * Optimize collection route using nearest-neighbor algorithm
 * Finds the shortest path to visit all full bins
 *
 * Algorithm:
 * 1. Start from current location
 * 2. Always go to nearest unvisited full bin
 * 3. Repeat until all bins visited
 *
 * Time Complexity: O(n²) - suitable for small to medium routes
 * This is a greedy approximation of the Traveling Salesman Problem
 */
export const optimizeRoute = (
  fullBins: Bin[],
  startLat: number,
  startLng: number
): RouteOptimizationResult => {
  if (fullBins.length === 0) {
    return {
      waypoints: [],
      totalDistance: 0,
      estimatedTime: 0,
      polylinePath: [],
    }
  }

  // Average speed assumption: 30 km/h for collection routes
  const AVERAGE_SPEED_KMH = 30
  // Time to collect per bin in minutes
  const COLLECTION_TIME_MINUTES = 5

  // Initialize route with current location
  const route: Bin[] = []
  const visited = new Set<string>()
  let currentLat = startLat
  let currentLng = startLng
  let totalDistance = 0

  // Nearest-neighbor algorithm
  while (visited.size < fullBins.length) {
    let nearestBin: Bin | null = null
    let nearestDistance = Infinity

    // Find nearest unvisited bin
    for (const bin of fullBins) {
      if (visited.has(bin.id)) continue

      const distance = calculateDistance(currentLat, currentLng, bin.latitude, bin.longitude)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestBin = bin
      }
    }

    if (!nearestBin) break

    // Add to route
    route.push(nearestBin)
    visited.add(nearestBin.id)
    totalDistance += nearestDistance
    currentLat = nearestBin.latitude
    currentLng = nearestBin.longitude
  }

  // Build polyline path (simplified - in production would use actual routing API)
  const polylinePath: Array<{ lat: number; lng: number }> = [
    { lat: startLat, lng: startLng },
  ]

  for (const bin of route) {
    polylinePath.push({
      lat: bin.latitude,
      lng: bin.longitude,
    })
  }

  // Calculate estimated time: travel time + collection time
  const travelTimeMinutes = (totalDistance / AVERAGE_SPEED_KMH) * 60
  const collectionTimeMinutes = route.length * COLLECTION_TIME_MINUTES
  const estimatedTime = travelTimeMinutes + collectionTimeMinutes

  return {
    waypoints: route,
    totalDistance,
    estimatedTime: Math.round(estimatedTime),
    polylinePath,
  }
}

/**
 * Calculate total distance of a route
 */
export const calculateRouteDistance = (bins: Bin[], startLat: number, startLng: number): number => {
  if (bins.length === 0) return 0

  let totalDistance = 0
  let currentLat = startLat
  let currentLng = startLng

  for (const bin of bins) {
    totalDistance += calculateDistance(currentLat, currentLng, bin.latitude, bin.longitude)
    currentLat = bin.latitude
    currentLng = bin.longitude
  }

  return totalDistance
}

/**
 * Estimate delivery time based on distance
 * Assumes 30 km/h average speed plus 5 minutes per stop
 */
export const estimateDeliveryTime = (
  distanceKm: number,
  numberOfStops: number
): number => {
  const AVERAGE_SPEED = 30 // km/h
  const TIME_PER_STOP = 5 // minutes
  const travelTime = (distanceKm / AVERAGE_SPEED) * 60
  return Math.round(travelTime + numberOfStops * TIME_PER_STOP)
}

/**
 * Validate route for optimization
 */
export const isValidRoute = (bins: Bin[]): boolean => {
  return (
    Array.isArray(bins) &&
    bins.length > 0 &&
    bins.every((bin) => typeof bin.latitude === 'number' && typeof bin.longitude === 'number')
  )
}
