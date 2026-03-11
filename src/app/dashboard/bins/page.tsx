'use client'

// Bins management page
// List view of all bins with filtering and bulk actions

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/shared/DashboardLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/shared/Button'
import { motion } from 'framer-motion'
import {
  Trash2,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  MapPin,
  Gauge,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Bin } from '@/lib/types'
import {
  getBinStatusColor,
  getBinStatusLabel,
  getRelativeTime,
  formatPercentage,
} from '@/utils/helpers'

export default function BinsPage() {
  const { bins } = useAppStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [filteredBins, setFilteredBins] = useState<Bin[]>(bins)

  // Filter bins based on search and status
  useEffect(() => {
    let result = bins

    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        (bin) =>
          bin.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bin.location?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (filterStatus) {
      result = result.filter((bin) => bin.status === filterStatus)
    }

    setFilteredBins(result)
  }, [bins, searchTerm, filterStatus])

  return (
    <DashboardLayout>
      <PageHeader
        title="Bins"
        subtitle="Manage and monitor all waste bins"
        icon={Trash2}
      />

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 space-y-4 lg:space-y-0 lg:flex items-center gap-4"
      >
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search bins by ID or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status filter */}
        <select
          value={filterStatus || ''}
          onChange={(e) => setFilterStatus(e.target.value || null)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="nearly_full">Nearly Full</option>
          <option value="full">Full</option>
        </select>

        {/* Reset filter */}
        {(searchTerm || filterStatus) && (
          <Button
            onClick={() => {
              setSearchTerm('')
              setFilterStatus(null)
            }}
            variant="ghost"
          >
            Clear Filters
          </Button>
        )}
      </motion.div>

      {/* Results count */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-gray-600 mb-4"
      >
        Showing {filteredBins.length} of {bins.length} bins
      </motion.p>

      {/* Bins list */}
      <div className="grid grid-cols-1 gap-4">
        {filteredBins.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white rounded-lg border border-gray-200"
          >
            <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No bins found</p>
            <p className="text-gray-400 text-sm">Try adjusting your filters</p>
          </motion.div>
        ) : (
          filteredBins.map((bin, i) => (
            <motion.div
              key={bin.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all group cursor-pointer"
              onClick={() => {
                // In production, would open detail view
              }}
            >
              <div className="flex items-start justify-between">
                {/* Left content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Bin #{bin.id}</h3>
                    <div
                      className={`w-3 h-3 rounded-full ${getBinStatusColor(
                        bin.fillPercentage
                      )} ${bin.fillPercentage >= 95 ? 'animate-pulse' : ''}`}
                    />
                    <span className="text-xs font-semibold text-gray-600 uppercase">
                      {getBinStatusLabel(bin.status as any)}
                    </span>
                  </div>

                  {/* Grid info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Location */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Location</p>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-gray-700">
                          {bin.location || 'Unknown'}
                        </p>
                      </div>
                    </div>

                    {/* Fill percentage */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Fill Level</p>
                      <div className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-gray-400" />
                        <p className="text-sm font-semibold text-gray-900">
                          {formatPercentage(bin.fillPercentage)}
                        </p>
                      </div>
                    </div>

                    {/* Last updated */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Last Update</p>
                      <p className="text-sm text-gray-700">
                        {getRelativeTime(bin.lastUpdated)}
                      </p>
                    </div>

                    {/* Collection status */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Last Collected</p>
                      <div className="flex items-center gap-2">
                        {bin.isCollected ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-700">Today</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-yellow-700">Pending</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fill bar */}
                <div className="ml-6 w-20 flex flex-col items-center gap-2">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${bin.fillPercentage}%` }}
                      className={`h-full ${getBinStatusColor(bin.fillPercentage)}`}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-600">
                    {formatPercentage(bin.fillPercentage)}
                  </span>
                </div>

                {/* Action arrow */}
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400 ml-4 flex-shrink-0 transition-colors" />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </DashboardLayout>
  )
}
