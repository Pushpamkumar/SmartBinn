'use client'

// Login page
// Email/password authentication with role-based access

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/shared/Button'
import { authService } from '@/services/auth'
import { usersService } from '@/services/firestore'
import { useAppStore } from '@/lib/store'
import { UserRole } from '@/lib/types'

export default function LoginPage() {
  const router = useRouter()
  const { setCurrentUser, setIsAuthenticated } = useAppStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Sign in with Supabase
      const user = await authService.login(email, password)

      // Attempt to load user profile from Supabase. If Supabase is unreachable
      // (invalid config, offline, etc.) we fall back to a basic in‑memory profile so
      // the app can continue running in demo/offline mode.
      let profile = null
      try {
        profile = await usersService.getProfile(user.uid)
      } catch (fserr: any) {
        console.warn('Could not fetch profile, running offline/demo mode:', fserr)
      }

      if (!profile) {
        // create a temporary profile object to allow access
        profile = {
          uid: user.uid,
          email: user.email || email,
          displayName: user.displayName || email,
          role: UserRole.FIELD_WORKER,
          createdAt: Date.now(),
          lastLogin: Date.now(),
          isActive: true,
        }
      }

      // Update store
      setCurrentUser(profile)
      setIsAuthenticated(true)

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Demo login button for testing
  const handleDemoLogin = async () => {
    setError('')
    setIsLoading(true)

    try {
      const user = await authService.login('admin@smartdustbin.com', 'demo@123456')
      let profile = null
      try {
        profile = await usersService.getProfile(user.uid)
      } catch {
        // ignore - offline/demo
      }
      if (!profile) {
        profile = {
          uid: user.uid,
          email: user.email || 'admin@smartdustbin.com',
          displayName: 'Demo User',
          role: UserRole.ADMIN,
          createdAt: Date.now(),
          lastLogin: Date.now(),
          isActive: true,
        }
      }
      setCurrentUser(profile)
      setIsAuthenticated(true)
      router.push('/dashboard')
    } catch (err: any) {
      setError('Demo account login failed. Please use credentials below or create an account.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold">SD</span>
              </div>
              <span className="text-white font-bold text-xl">SmartDustbin</span>
            </Link>
            <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
            <p className="text-blue-100 text-sm mt-1">Sign in to your dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@smartdustbin.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
                <input type="checkbox" className="rounded" />
                Remember me
              </label>
              <Link href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Forgot password?
              </Link>
            </div>

            {/* Login button */}
            <Button
              type="submit"
              isLoading={isLoading}
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Sign In
            </Button>

            {/* Demo button */}
            <Button
              type="button"
              onClick={handleDemoLogin}
              variant="secondary"
              isLoading={isLoading}
              size="lg"
              className="w-full"
            >
              Try Demo Account
            </Button>
          </form>

          {/* Demo credentials info */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-2 font-semibold">Demo Credentials:</p>
            <p className="text-xs text-gray-600">
              <strong>Admin:</strong> admin@smartdustbin.com / demo@123456
            </p>
            <p className="text-xs text-gray-600">
              <strong>Worker:</strong> worker@smartdustbin.com / demo@123456
            </p>
          </div>

          {/* Sign up link */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
