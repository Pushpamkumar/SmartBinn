// Authentication service layer
// Handles Supabase Auth operations and role-based access control

import supabase, { getSupabase } from '@/lib/supabase'
import { usersService } from './firestore'
import { UserRole } from '@/lib/types'

/**
 * Create new user account with role
 */
export const authService = {
  register: async (
    email: string,
    password: string,
    displayName: string,
    role: UserRole
  ): Promise<any> => {
    if (!supabase) throw new Error('Supabase not configured')

    let user: any = null
    try {
      const client = getSupabase()
      const res = await client.auth.signUp({ email, password })
      user = res.data?.user
      if ((res as any).error) throw new Error((res as any).error.message || 'Signup failed')
      if (!user) throw new Error('Signup failed: no user returned')
      // proceed
    } catch (err: any) {
      console.error('Supabase signup/network error:', err)
      throw new Error(err?.message || 'Network or Supabase error during signup')
    }

    // Create user profile in DB with role; failures should not block registration
    try {
      if (user) {
        await usersService.upsertProfile(user.id, {
          uid: user.id,
          email: user.email || '',
          displayName,
          role,
          createdAt: Date.now(),
          lastLogin: Date.now(),
          isActive: true,
        })
      }
    } catch (err) {
      console.warn('Unable to create user profile, proceeding in offline mode:', err)
    }

    return user
  },

  /**
   * Sign in with email and password
   */
  login: async (email: string, password: string): Promise<any> => {
    if (!supabase) throw new Error('Supabase not configured')
    try {
      const client = getSupabase()
      const res = await client.auth.signInWithPassword({ email, password })
      if ((res as any).error) throw new Error((res as any).error.message || 'Login failed')
      const user = res.data?.user
      if (!user) throw new Error('Login failed: no user returned')
      return user
    } catch (err: any) {
      console.error('Supabase login/network error:', err)
      throw new Error(err?.message || 'Network or Supabase error during login')
    }
  },

  /**
   * Sign out current user
   */
  logout: async (): Promise<void> => {
    if (!supabase) return
    const client = getSupabase()
    await client.auth.signOut()
  },

  /**
   * Get current user with error handling
   */
  getCurrentUser: async (): Promise<any | null> => {
    if (!supabase) return null
    try {
      const client = getSupabase()
      const result = await client.auth.getUser()
      const user = (result as any).data?.user
      if (!user) return null
      return { uid: user.id, email: user.email, displayName: (user.user_metadata as any)?.displayName }
    } catch (err) {
      return null
    }
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange: (callback: (user: any | null) => void) => {
    if (!supabase) return () => {}
    const client = getSupabase()
    const { data: listener } = client.auth.onAuthStateChange((event, session) => {
      const user = session?.user ? { uid: session.user.id, email: session.user.email } : null
      callback(user)
    })
    return () => {
      try {
        // supabase v2 returns a subscription object with unsubscribe
        ;(listener as any)?.subscription?.unsubscribe?.()
      } catch {}
    }
  },
}
