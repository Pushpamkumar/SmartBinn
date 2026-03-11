// Types and interfaces used throughout the application
// Centralized type definitions for type safety

/**
 * User roles in the system
 */
export enum UserRole {
  ADMIN = 'admin',
  FIELD_WORKER = 'field_worker',
}

/**
 * Bin status indicators
 */
export enum BinStatus {
  AVAILABLE = 'available', // 0-79% fill
  NEARLY_FULL = 'nearly_full', // 80-94% fill
  FULL = 'full', // 95-100% fill
}

/**
 * Alert severity levels
 */
export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

/**
 * Bin data model stored in Firestore
 */
export interface Bin {
  id: string
  latitude: number
  longitude: number
  fillPercentage: number
  status: BinStatus
  lastUpdated: number // Firestore timestamp
  reportedByUser?: string
  isCollected: boolean
  location?: string // Human-readable address
  capacity?: number // Bin capacity in liters
  binType?: string // Type of waste bin
  collectionCount?: number // Total times collected
}

/**
 * Alert data model
 */
export interface Alert {
  id: string
  binId: string
  severity: AlertSeverity
  message: string
  createdAt: number // Firestore timestamp
  resolved: boolean
  resolvedAt?: number
  collectionId?: string
}

/**
 * User profile data model
 */
export interface UserProfile {
  uid: string
  email: string
  role: UserRole
  displayName: string
  photoURL?: string
  createdAt: number
  lastLogin: number
  isActive: boolean
}

/**
 * Fleet vehicle tracking data
 */
export interface FleetVehicle {
  id: string
  vehicleNumber: string
  driverId: string
  driverName: string
  latitude: number
  longitude: number
  status: 'available' | 'on_route' | 'collecting'
  currentRoute?: {
    startedAt: number
    estimatedEndTime: number
    binsToCollect: string[]
    binsCollected: string[]
  }
  lastUpdated: number
}

/**
 * Analytics data
 */
export interface Analytics {
  totalBins: number
  fullBins: number
  collectionEfficiency: number
  averageFillTime: number
  todaysCollections: number
  avgResponseTime: number
}

/**
 * Route optimization result
 */
export interface OptimizedRoute {
  waypoints: Bin[]
  totalDistance: number
  estimatedTime: number
  polylinePath: Array<{ lat: number; lng: number }>
}

/**
 * Real-time location update for users
 */
export interface LocationUpdate {
  latitude: number
  longitude: number
  timestamp: number
  accuracy?: number
}

/**
 * Collection event tracking
 */
export interface CollectionEvent {
  id: string
  binId: string
  collectedAt: number
  collectedByUserId: string
  previousFillLevel: number
  weight?: number
  notes?: string
}
