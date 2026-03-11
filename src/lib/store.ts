// Global state management using Zustand
// Centralized store for app state including auth, bins, alerts, UI state

import { create } from 'zustand'
import { Bin, Alert, UserProfile, FleetVehicle } from '@/lib/types'

interface AppState {
  // Auth state
  currentUser: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean

  // Data state
  bins: Bin[]
  fullBins: Bin[]
  alerts: Alert[]
  fleetVehicles: FleetVehicle[]
  userLocation: { lat: number; lng: number } | null

  // UI state
  isOnline: boolean
  selectedBin: Bin | null
  showBinDetail: boolean
  notificationCount: number
  sidebarOpen: boolean

  // Actions
  setCurrentUser: (user: UserProfile | null) => void
  setIsAuthenticated: (value: boolean) => void
  setIsLoading: (value: boolean) => void
  setBins: (bins: Bin[]) => void
  setFullBins: (bins: Bin[]) => void
  setAlerts: (alerts: Alert[]) => void
  setFleetVehicles: (vehicles: FleetVehicle[]) => void
  setUserLocation: (location: { lat: number; lng: number } | null) => void
  setIsOnline: (value: boolean) => void
  setSelectedBin: (bin: Bin | null) => void
  setShowBinDetail: (show: boolean) => void
  setNotificationCount: (count: number) => void
  incrementNotificationCount: () => void
  resetNotificationCount: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

/**
 * Create app state store
 * This is the single source of truth for the entire application state
 */
export const useAppStore = create<AppState>((set) => ({
  // Initial state
  currentUser: null,
  isAuthenticated: false,
  isLoading: true,
  bins: [],
  fullBins: [],
  alerts: [],
  fleetVehicles: [],
  userLocation: null,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  selectedBin: null,
  showBinDetail: false,
  notificationCount: 0,
  sidebarOpen: true,

  // Auth actions
  setCurrentUser: (user) => set({ currentUser: user }),
  setIsAuthenticated: (value) => set({ isAuthenticated: value }),
  setIsLoading: (value) => set({ isLoading: value }),

  // Data actions
  setBins: (bins) => set({ bins }),
  setFullBins: (bins) => set({ fullBins: bins }),
  setAlerts: (alerts) => set({ alerts }),
  setFleetVehicles: (vehicles) => set({ fleetVehicles: vehicles }),
  setUserLocation: (location) => set({ userLocation: location }),

  // UI actions
  setIsOnline: (value) => set({ isOnline: value }),
  setSelectedBin: (bin) => set({ selectedBin: bin }),
  setShowBinDetail: (show) => set({ showBinDetail: show }),
  setNotificationCount: (count) => set({ notificationCount: Math.max(0, count) }),
  incrementNotificationCount: () =>
    set((state) => ({ notificationCount: state.notificationCount + 1 })),
  resetNotificationCount: () => set({ notificationCount: 0 }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))
