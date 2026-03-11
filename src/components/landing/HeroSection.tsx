'use client'

// Landing page hero section
// Eye-catching intro with CTA buttons

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Zap, TrendingUp, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/shared/Button'

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Text content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/50 mb-6"
          >
            <Zap className="w-4 h-4 text-blue-300" />
            <span className="text-sm font-medium text-blue-200">
              Smart IoT Waste Management
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Revolutionizing Waste Collection with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">
              Smart IoT Technology
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Real-time bin monitoring, automated alerts, and optimized collection routes.
            Reduce costs, improve efficiency, and protect the environment.
          </p>

          {/* Features list */}
          <div className="space-y-3 mb-8">
            {[
              '📊 Real-time monitoring dashboard',
              '🚮 Automated alerts & notifications',
              '🗺️ Optimized collection routes',
              '📈 Advanced analytics & reporting',
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 text-gray-200"
              >
                <div className="w-6 h-6 rounded-full bg-blue-500/30 border border-blue-400 flex items-center justify-center flex-shrink-0">
                  <span className="w-2 h-2 bg-blue-300 rounded-full" />
                </div>
                {feature}
              </motion.div>
            ))}
          </div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/dashboard/analytics" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="primary"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                View Dashboard
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="secondary"
                className="w-full bg-white/10 text-white hover:bg-white/20 border border-white/20"
              >
                Admin Dashboard
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Illustration - Animated dustbin */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative h-96 flex items-center justify-center"
        >
          <div className="relative">
            {/* Outer glow */}
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 40px rgba(59, 130, 246, 0.3)',
                  '0 0 60px rgba(59, 130, 246, 0.5)',
                  '0 0 40px rgba(59, 130, 246, 0.3)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 rounded-2xl"
            />

            {/* Main dustbin illustration */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-48 h-64 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Lid */}
              <div className="absolute -top-8 left-0 right-0 h-12 bg-gradient-to-b from-green-300 to-green-500 rounded-t-3xl shadow-lg" />

              {/* Fill indicator */}
              <motion.div
                animate={{ height: ['20%', '80%', '20%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-yellow-400 to-green-400 opacity-80"
              />

              {/* Status indicator */}
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-6 right-6 w-6 h-6 bg-green-200 rounded-full"
              />

              {/* Icons inside */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                >
                  <AlertCircle className="w-16 h-16 text-white opacity-30" />
                </motion.div>
              </div>
            </motion.div>

            {/* Floating particles */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  x: [0, 20, -20, 0],
                  y: [0, -30, 30, 0],
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
                className="absolute w-3 h-3 bg-blue-400 rounded-full opacity-40"
                style={{
                  left: `${30 + i * 20}%`,
                  top: `${20 + i * 10}%`,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-center"
      >
        <p className="text-sm text-gray-300 mb-2">Scroll to explore</p>
        <div className="flex justify-center gap-1">
          <div className="w-0.5 h-8 bg-gradient-to-b from-white to-transparent rounded-full" />
        </div>
      </motion.div>
    </section>
  )
}
