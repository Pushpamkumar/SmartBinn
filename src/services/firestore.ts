// Database service layer
// Handles all Supabase database operations with real-time listeners and caching

import supabase from '@/lib/supabase'
import { Bin, Alert, UserProfile, FleetVehicle, CollectionEvent } from '@/lib/types'

/**
 * Bins Service - CRUD operations for bins
 */
export const binsService = {
  /**
   * Get all bins with real-time listener
   * Returns unsubscribe function to clean up listener
   */
  subscribeToAll: (callback: (bins: Bin[]) => void) => {
    if (!supabase) {
      console.warn('Supabase not configured — subscribeToAll will do a one-time fetch only')
      ;(async () => {
        return
      })()
      return () => {}
    }

    // initial fetch
    supabase
      .from('bins')
      .select('*')
      .then((res) => {
        const { data } = res
        if (data) {
          const bins = data.map((r: any) => ({ id: r.id, ...r } as Bin))
          callback(bins)
        }
      })

    // realtime subscription
    const channel = supabase
      .channel('public:bins')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bins' },
        async () => {
          const { data } = await supabase.from('bins').select('*')
          const bins = (data || []).map((r: any) => ({ id: r.id, ...r } as Bin))
          callback(bins)
        }
      )
      .subscribe()

    return () => {
      try {
        channel.unsubscribe()
      } catch {}
    }
  },

  /**
   * Get bins by status with real-time updates
   */
  subscribeByStatus: (status: string, callback: (bins: Bin[]) => void) => {
    if (!supabase) return () => {}
    ;(async () => {
      const { data } = await supabase.from('bins').select('*').eq('status', status)
      const bins = (data || []).map((r: any) => ({ id: r.id, ...r } as Bin))
      callback(bins)
    })()

    const channel = supabase
      .channel(`public:bins:status=${status}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bins' },
        async (payload) => {
          // simple approach: re-fetch filtered results
          const { data } = await supabase.from('bins').select('*').eq('status', status)
          const bins = (data || []).map((r: any) => ({ id: r.id, ...r } as Bin))
          callback(bins)
        }
      )
      .subscribe()

    return () => {
      try {
        channel.unsubscribe()
      } catch {}
    }
  },

  /**
   * Get single bin by ID
   */
  getById: async (binId: string): Promise<Bin | null> => {
    if (!supabase) return null
    const { data, error } = await supabase.from('bins').select('*').eq('id', binId).single()
    if (error || !data) return null
    return { id: data.id, ...data } as Bin
  },

  /**
   * Create new bin
   */
  create: async (binData: Omit<Bin, 'id'>): Promise<string> => {
    if (!supabase) throw new Error('Supabase not configured')
    const payload = { ...binData, lastUpdated: new Date().toISOString(), createdAt: new Date().toISOString() }
    const { data, error } = await supabase.from('bins').insert(payload).select().single()
    if (error || !data) throw error || new Error('Insert failed')
    return data.id
  },

  /**
   * Update bin data
   */
  update: async (binId: string, updates: Partial<Bin>): Promise<void> => {
    if (!supabase) throw new Error('Supabase not configured')
    const dataWithTimestamp = { ...updates, lastUpdated: new Date().toISOString() }
    await supabase.from('bins').update(dataWithTimestamp).eq('id', binId)
  },

  /**
   * Collect bin (reset fill percentage and update status)
   */
  collect: async (binId: string, collectorId: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase not configured')
    await supabase.from('bins').update({ fillPercentage: 0, status: 'available', isCollected: true, lastUpdated: new Date().toISOString() }).eq('id', binId)
    await collectionEventsService.create({ binId, collectedByUserId: collectorId, previousFillLevel: 100, collectedAt: Date.now() })
  },

  /**
   * Delete bin
   */
  delete: async (binId: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase not configured')
    await supabase.from('bins').delete().eq('id', binId)
  },
}

/**
 * Alerts Service - Manage alerts
 */
export const alertsService = {
  /**
   * Subscribe to all unresolved alerts
   */
  subscribeUnresolved: (callback: (alerts: Alert[]) => void) => {
    if (!supabase) return () => {}
    ;(async () => {
      const { data } = await supabase.from('alerts').select('*').eq('resolved', false)
      const alerts = (data || []).map((r: any) => ({ id: r.id, ...r } as Alert))
      callback(alerts)
    })()

    const channel = supabase
      .channel('public:alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, async () => {
        const { data } = await supabase.from('alerts').select('*').eq('resolved', false)
        const alerts = (data || []).map((r: any) => ({ id: r.id, ...r } as Alert))
        callback(alerts)
      })
      .subscribe()

    return () => {
      try {
        channel.unsubscribe()
      } catch {}
    }
  },

  /**
   * Create new alert
   */
  create: async (alertData: Omit<Alert, 'id'>): Promise<string> => {
    if (!supabase) throw new Error('Supabase not configured')
    const payload = { ...alertData, createdAt: new Date().toISOString() }
    const { data, error } = await supabase.from('alerts').insert(payload).select().single()
    if (error || !data) throw error || new Error('Insert failed')
    return data.id
  },

  /**
   * Resolve alert
   */
  resolve: async (alertId: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase not configured')
    await supabase.from('alerts').update({ resolved: true, resolvedAt: new Date().toISOString() }).eq('id', alertId)
  },

  /**
   * Get alert by bin ID
   */
  getByBinId: async (binId: string): Promise<Alert | null> => {
    if (!supabase) return null
    const { data, error } = await supabase.from('alerts').select('*').eq('binId', binId).eq('resolved', false).limit(1).single()
    if (error || !data) return null
    return { id: data.id, ...data } as Alert
  },
}

/**
 * Users Service - Manage user profiles
 */
export const usersService = {
  /**
   * Get user profile
   */
  getProfile: async (uid: string): Promise<UserProfile | null> => {
    if (!supabase) return null
    const { data, error } = await supabase.from('users').select('*').eq('uid', uid).single()
    if (error || !data) return null
    return { uid: data.uid, ...data } as UserProfile
  },

  /**
   * Create or update user profile
   */
  upsertProfile: async (uid: string, userData: Partial<UserProfile>): Promise<void> => {
    if (!supabase) throw new Error('Supabase not configured')
    const dataWithTimestamp = { ...userData, lastLogin: new Date().toISOString() }
    await supabase.from('users').upsert({ uid, ...dataWithTimestamp }, { onConflict: 'uid' })
  },

  /**
   * Subscribe to user profile changes
   */
  subscribe: (uid: string, callback: (user: UserProfile | null) => void) => {
    if (!supabase) return () => {}
    ;(async () => {
      const { data } = await supabase.from('users').select('*').eq('uid', uid).single()
      callback(data ? ({ uid: data.uid, ...data } as UserProfile) : null)
    })()

    const channel = supabase
      .channel(`public:users:uid=${uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, async (payload) => {
        const { data } = await supabase.from('users').select('*').eq('uid', uid).single()
        callback(data ? ({ uid: data.uid, ...data } as UserProfile) : null)
      })
      .subscribe()

    return () => {
      try {
        channel.unsubscribe()
      } catch {}
    }
  },
}

/**
 * Fleet Service - Manage vehicle locations
 */
export const fleetService = {
  /**
   * Subscribe to all fleet vehicles
   */
  subscribeAll: (callback: (vehicles: FleetVehicle[]) => void) => {
    if (!supabase) return () => {}
    
    ;(async () => {
      const { data } = await supabase.from('fleet').select('*')
      const vehicles = (data || []).map((r: any) => ({ id: r.id, ...r } as FleetVehicle))
      callback(vehicles)
    })()

    const channel = supabase
      .channel('public:fleet')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fleet' }, async () => {
        const { data } = await supabase.from('fleet').select('*')
        const vehicles = (data || []).map((r: any) => ({ id: r.id, ...r } as FleetVehicle))
        callback(vehicles)
      })
      .subscribe()

    return () => {
      try {
        channel.unsubscribe()
      } catch {}
    }
  },

  /**
   * Update vehicle location
   */
  updateLocation: async (vehicleId: string, lat: number, lng: number): Promise<void> => {
    if (!supabase) throw new Error('Supabase not configured')
    await supabase.from('fleet').update({
      latitude: lat,
      longitude: lng,
      lastUpdated: new Date().toISOString(),
    }).eq('id', vehicleId)
  },
}

/**
 * Collection Events Service - Log collection activities
 */
export const collectionEventsService = {
  /**
   * Create collection event
   */
  create: async (eventData: Omit<CollectionEvent, 'id'>): Promise<string> => {
    if (!supabase) throw new Error('Supabase not configured')
    const payload = {
      ...eventData,
      createdAt: new Date().toISOString(),
    }
    const { data, error } = await supabase.from('collectionEvents').insert(payload).select().single()
    if (error || !data) throw error || new Error('Insert failed')
    return data.id
  },

  /**
   * Get events for date range
   */
  getByDateRange: async (startDate: number, endDate: number): Promise<CollectionEvent[]> => {
    if (!supabase) return []
    const startDateStr = new Date(startDate).toISOString()
    const endDateStr = new Date(endDate).toISOString()
    const { data, error } = await supabase
      .from('collectionEvents')
      .select('*')
      .gte('collectedAt', startDateStr)
      .lte('collectedAt', endDateStr)
    if (error || !data) return []
    return (data || []).map((r: any) => ({ id: r.id, ...r } as CollectionEvent))
  },
}
