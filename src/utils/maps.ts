// Map utility functions and helpers
// Handles map operations, route calculations, and geolocation

import { Bin } from '@/lib/types'
import { calculateDistance } from '@/utils/helpers'

/**
 * Polyline encoding for Google Maps
 * Encodes a list of lat/lng points to a polyline string
 */
export const encodePolyline = (
  points: Array<{ lat: number; lng: number }>,
  precision: number = 5
): string => {
  let encoded = ''

  let prevLat = 0
  let prevLng = 0

  const factor = Math.pow(10, precision)

  for (const point of points) {
    const lat = point.lat
    const lng = point.lng

    const dlat = lat - prevLat
    const dlng = lng - prevLng

    encodeValue(dlat * factor)
    encodeValue(dlng * factor)

    prevLat = lat
    prevLng = lng
  }

  function encodeValue(value: number): void {
    value = Math.round(value)
    value = (value << 1) ^ (value >> 31)

    while (value >= 0x20) {
      const chunk = (0x20 | (value & 0x1f)) + 63
      encoded += String.fromCharCode(chunk)
      value >>= 5
    }

    encoded += String.fromCharCode(value + 63)
  }

  return encoded
}

/**
 * Decode polyline to lat/lng points
 */
export const decodePolyline = (
  encoded: string,
  precision: number = 5
): Array<{ lat: number; lng: number }> => {
  const factor = Math.pow(10, precision)
  const points: Array<{ lat: number; lng: number }> = []

  let index = 0
  let lat = 0
  let lng = 0

  while (index < encoded.length) {
    let result = 0
    let shift = 0

    while (true) {
      const b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
      if (b < 0x20) break
    }

    const dlat = result & 1 ? ~(result >> 1) : result >> 1
    lat += dlat
    shift = 0
    result = 0

    while (true) {
      const b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
      if (b < 0x20) break
    }

    const dlng = result & 1 ? ~(result >> 1) : result >> 1
    lng += dlng

    points.push({
      lat: lat / factor,
      lng: lng / factor,
    })
  }

  return points
}

/**
 * Parse bounds from string format
 */
export const parseBounds = (boundsString: string) => {
  try {
    const bounds = boundsString.split(',').map(Number)
    return {
      minLat: bounds[0],
      minLng: bounds[1],
      maxLat: bounds[2],
      maxLng: bounds[3],
    }
  } catch {
    return null
  }
}

/**
 * Calculate center point of coordinates
 */
export const calculateCenter = (
  points: Array<{ lat: number; lng: number }>
): { lat: number; lng: number } => {
  if (points.length === 0) {
    return { lat: 0, lng: 0 }
  }

  const sum = points.reduce(
    (acc, point) => ({
      lat: acc.lat + point.lat,
      lng: acc.lng + point.lng,
    }),
    { lat: 0, lng: 0 }
  )

  return {
    lat: sum.lat / points.length,
    lng: sum.lng / points.length,
  }
}

/**
 * Get user's current location using geolocation API
 */
export const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => {
        reject(error)
      }
    )
  })
}

/**
 * Watch user location with continuous updates
 */
export const watchLocation = (
  callback: (location: { lat: number; lng: number }) => void,
  onError?: (error: GeolocationPositionError) => void
): number => {
  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      })
    },
    onError,
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  )
}

/**
 * Stop watching location
 */
export const stopWatchLocation = (watchId: number): void => {
  navigator.geolocation.clearWatch(watchId)
}
