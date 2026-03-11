'use client'

// Loading skeleton placeholder components
// Used to show placeholder content while data is loading

import React from 'react'
import { motion } from 'framer-motion'

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-2/3 animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded animate-pulse" />
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-5/6 animate-pulse" />
      </div>
    </div>
  )
}

export const SkeletonMap: React.FC = () => {
  return (
    <div className="bg-gray-200 rounded-lg border border-gray-300 h-full animate-pulse" />
  )
}

export const SkeletonRow: React.FC = () => {
  return (
    <div className="flex gap-4 p-4 border-b border-gray-200">
      <div className="h-12 w-12 bg-gray-200 rounded animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
      </div>
    </div>
  )
}
