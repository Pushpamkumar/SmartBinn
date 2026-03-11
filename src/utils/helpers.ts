// Utility functions for the application

import { BinStatus } from '@/lib/types'

/**
 * Get bin status color based on fill percentage
 * Green: 0-79%, Yellow: 80-94%, Red: 95-100%
 */
export const getBinStatusColor = (fillPercentage: number): string => {
  if (fillPercentage < 80) return 'bg-green-500'
  if (fillPercentage < 95) return 'bg-yellow-500'
  return 'bg-red-500'
}

/**
 * Get bin status color for badge/text
 */
export const getBinStatusTextColor = (fillPercentage: number): string => {
  if (fillPercentage < 80) return 'text-green-600'
  if (fillPercentage < 95) return 'text-yellow-600'
  return 'text-red-600'
}

/**
 * Get bin status badge background
 */
export const getBinStatusBgColor = (fillPercentage: number): string => {
  if (fillPercentage < 80) return 'bg-green-100'
  if (fillPercentage < 95) return 'bg-yellow-100'
  return 'bg-red-100'
}

/**
 * Convert bin status enum to human-readable text
 */
export const getBinStatusLabel = (status: BinStatus): string => {
  const labels: Record<BinStatus, string> = {
    [BinStatus.AVAILABLE]: 'Available',
    [BinStatus.NEARLY_FULL]: 'Nearly Full',
    [BinStatus.FULL]: 'Full',
  }
  return labels[status]
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Format distance for display (km or m)
 */
export const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`
  }
  return `${km.toFixed(2)}km`
}

/**
 * Format timestamp to readable date string
 */
export const formatDate = (timestamp: number | Date): string => {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/**
 * Get relative time (e.g., "2 minutes ago")
 */
export const getRelativeTime = (timestamp: number): string => {
  const now = Date.now()
  const seconds = Math.floor((now - timestamp) / 1000)

  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Format percentage with fixed decimals
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`
}

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/**
 * Clamp value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}

/**
 * Debounce function for function calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Check if service worker is supported
 */
export const isServiceWorkerSupported = (): boolean => {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator
}

/**
 * Check geolocation support
 */
export const isGeolocationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'geolocation' in navigator
}

/**
 * Get stored theme preference
 */
export const getTheme = (): string => {
  if (typeof window === 'undefined') return 'light'
  return localStorage.getItem('theme') || 'light'
}

/**
 * Set theme preference
 */
export const setTheme = (theme: string): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem('theme', theme)
  document.documentElement.classList.toggle('dark', theme === 'dark')
}
