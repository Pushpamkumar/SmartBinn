'use client'

// Dashboard sidebar component
// Navigation menu for dashboard pages

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import {
  Map,
  Trash2,
  AlertCircle,
  Zap,
  BarChart3,
  Settings,
  ChevronRight,
  X,
} from 'lucide-react'
import { motion } from 'framer-motion'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname()
  const { sidebarOpen, toggleSidebar, alerts } = useAppStore()
  const fullAlertsCount = alerts.filter((a) => a.severity === 'critical').length

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: BarChart3,
    },
    {
      name: 'Live Map',
      href: '/dashboard/map',
      icon: Map,
    },
    {
      name: 'Bins',
      href: '/dashboard/bins',
      icon: Trash2,
    },
    {
      name: 'Alerts',
      href: '/dashboard/alerts',
      icon: AlertCircle,
      badge: fullAlertsCount,
    },
    {
      name: 'Fleet',
      href: '/dashboard/fleet',
      icon: Zap,
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto z-40 lg:z-0 lg:static lg:top-0 lg:translate-x-0"
      >
        {/* Mobile close button */}
        <div className="lg:hidden p-4 border-b border-gray-200 flex justify-between items-center">
          <span className="font-semibold text-gray-900">Menu</span>
          <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  // Close sidebar on mobile after navigation
                  if (window.innerWidth < 1024) {
                    toggleSidebar()
                  }
                }}
                className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </div>

                {/* Badge for alerts */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}

                {/* Active indicator */}
                {active && <ChevronRight className="w-5 h-5 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar footer info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-50 to-transparent border-t border-gray-200">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-sm text-gray-900 mb-1">Pro Tip</h4>
            <p className="text-xs text-gray-600">
              Enable notifications to get instant alerts when bins are full.
            </p>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
