'use client'

// Dashboard main layout
// Wraps all dashboard pages with navbar and sidebar

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/shared/Navbar'
import { Sidebar } from '@/components/shared/Sidebar'
import { OfflineIndicator } from '@/components/shared/OfflineIndicator'
import { useAppStore } from '@/lib/store'
import { usersService } from '@/services/firestore'
import { authService } from '@/services/auth'
import { UserRole } from '@/lib/types'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter()
  const { setCurrentUser, setIsAuthenticated, setIsLoading, isLoading } = useAppStore()

  // Initialize auth and load user profile
  useEffect(() => {
    const initializeAuth = async (): Promise<void | (() => void)> => {
      try {
        // Check if demo mode is enabled
        const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

        // Try to get authenticated user
        const user = await authService.getCurrentUser()

        if (!user && !isDemoMode) {
          // No user and not in demo mode - redirect to login
          router.push('/auth/login')
          return
        }

        if (!user && isDemoMode) {
          // Demo mode: create a demo user profile
          const demoProfile = {
            uid: 'demo-user-' + Date.now(),
            email: 'demo@smartdustbin.local',
            displayName: 'Demo User',
            role: UserRole.ADMIN,
            createdAt: Date.now(),
            lastLogin: Date.now(),
            isActive: true,
          }
          setCurrentUser(demoProfile)
          setIsAuthenticated(true)
          setIsLoading(false)
          return
        }

        // User is authenticated
        if (user) {
          // Load user profile from Supabase if possible
          let profile = null
          try {
            profile = await usersService.getProfile(user.uid)
          } catch (err) {
            console.warn('Could not fetch profile (offline/demo):', err)
          }

          if (!profile) {
            // fallback temporary profile to allow access
            profile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || '',
              role: UserRole.FIELD_WORKER,
              createdAt: Date.now(),
              lastLogin: Date.now(),
              isActive: true,
            }
          }

          setCurrentUser(profile)
          setIsAuthenticated(true)

          // Subscribe to profile changes (safe to ignore errors)
          let unsubscribe = () => {}
          try {
            unsubscribe = usersService.subscribe(user.uid, (updatedProfile) => {
              if (updatedProfile) {
                setCurrentUser(updatedProfile)
              }
            })
          } catch {
            // ignore subscription failures when offline
          }

          return () => unsubscribe()
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
          router.push('/auth/login')
        }
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [setCurrentUser, setIsAuthenticated, setIsLoading, router])

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg animate-spin" />
              <div className="absolute inset-1 bg-white rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-blue-600">SD</span>
              </div>
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading SmartDustbin...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col">
      <Navbar />
      <OfflineIndicator />

      <div className="flex flex-1 overflow-hidden pt-16">
        <Sidebar />

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
