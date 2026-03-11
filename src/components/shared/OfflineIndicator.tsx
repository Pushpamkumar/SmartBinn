'use client'

// Offline mode indicator banner
// Shows when device loses network connectivity

import React, { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { AlertCircle, Wifi, WifiOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export const OfflineIndicator: React.FC = () => {
  const { isOnline, setIsOnline } = useAppStore()

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      console.log('✅ Back online!')
    }

    const handleOffline = () => {
      setIsOnline(false)
      console.log('📡 Offline mode activated')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setIsOnline])

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 bg-yellow-50 border-b-2 border-yellow-400 z-50"
        >
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-center gap-3">
            <WifiOff className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              You're offline. Changed data will sync once you're back online.
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
