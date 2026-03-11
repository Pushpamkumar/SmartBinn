// IoT Sensor Simulation Service
// Simulates real bin sensors by incrementally increasing fill percentages
// and triggering alerts when thresholds are reached

import { Bin, BinStatus, AlertSeverity } from '@/lib/types'
import { binsService, alertsService } from '@/services/firestore'

// Sensor simulation configuration
const SIMULATION_CONFIG = {
  // Update interval in milliseconds
  UPDATE_INTERVAL: 10000, // 10 seconds

  // Fill percentage increase per update (random between min and max)
  MIN_FILL_INCREASE: 0.5,
  MAX_FILL_INCREASE: 2.5,

  // Thresholds for status changes
  NEARLY_FULL_THRESHOLD: 80,
  FULL_THRESHOLD: 95,

  // Simulate occasional fluctuations (bins can decrease slightly if door opened)
  FLUCTUATION_PROBABILITY: 0.1, // 10% chance
  MAX_FLUCTUATION: 5, // Max decrease percentage
}

// Track active simulations to avoid duplicates
const activeSimulations = new Map<string, NodeJS.Timeout>()

// Track alert sounds and notifications
const alertCallback = new Map<string, (bin: Bin) => void>()

/**
 * Start sensor simulation for a specific bin
 * Gradually increases fill percentage and triggers alerts
 */
export const startSensorSimulation = (
  binId: string,
  onBinUpdate?: (bin: Bin) => void,
  onAlertTriggered?: (bin: Bin) => void
): void => {
  // Prevent duplicate simulations
  if (activeSimulations.has(binId)) {
    console.warn(`Simulation already active for bin ${binId}`)
    return
  }

  // Store callbacks
  if (onAlertTriggered) {
    alertCallback.set(binId, onAlertTriggered)
  }

  /**
   * Simulation update logic
   */
  const simulationUpdate = async () => {
    try {
      const bin = await binsService.getById(binId)
      if (!bin) return

      // Skip simulation if already full
      if (bin.fillPercentage >= 100) {
        return
      }

      // Calculate new fill percentage
      let newFill = bin.fillPercentage

      // Apply fluctuation (occasional decrease)
      if (Math.random() < SIMULATION_CONFIG.FLUCTUATION_PROBABILITY) {
        const fluctuation = Math.random() * SIMULATION_CONFIG.MAX_FLUCTUATION
        newFill = Math.max(0, newFill - fluctuation)
      } else {
        // Normal increment
        const increase =
          Math.random() *
            (SIMULATION_CONFIG.MAX_FILL_INCREASE - SIMULATION_CONFIG.MIN_FILL_INCREASE) +
          SIMULATION_CONFIG.MIN_FILL_INCREASE
        newFill = Math.min(100, newFill + increase)
      }

      // Determine new status
      let newStatus = BinStatus.AVAILABLE
      if (newFill >= SIMULATION_CONFIG.FULL_THRESHOLD) {
        newStatus = BinStatus.FULL
      } else if (newFill >= SIMULATION_CONFIG.NEARLY_FULL_THRESHOLD) {
        newStatus = BinStatus.NEARLY_FULL
      }

      // Update bin in Supabase
      const updatedBin = {
        ...bin,
        fillPercentage: Math.round(newFill * 10) / 10, // Round to 1 decimal
        status: newStatus,
      }

      await binsService.update(binId, {
        fillPercentage: updatedBin.fillPercentage,
        status: updatedBin.status,
      })

      // Call update callback
      if (onBinUpdate) {
        onBinUpdate(updatedBin)
      }

      // Check if bin became full and trigger alert
      if (newStatus === BinStatus.FULL && bin.status !== BinStatus.FULL) {
        await handleBinFull(updatedBin, onAlertTriggered)
      }
    } catch (error) {
      console.error(`Error in sensor simulation for bin ${binId}:`, error)
    }
  }

  // Run simulation immediately, then periodically
  simulationUpdate()
  const timeoutId = setInterval(simulationUpdate, SIMULATION_CONFIG.UPDATE_INTERVAL)
  activeSimulations.set(binId, timeoutId)
}

/**
 * Stop sensor simulation for a specific bin
 */
export const stopSensorSimulation = (binId: string): void => {
  const timeoutId = activeSimulations.get(binId)
  if (timeoutId) {
    clearInterval(timeoutId)
    activeSimulations.delete(binId)
  }
  alertCallback.delete(binId)
}

/**
 * Stop all active simulations
 */
export const stopAllSimulations = (): void => {
  activeSimulations.forEach((timeoutId) => {
    clearInterval(timeoutId)
  })
  activeSimulations.clear()
  alertCallback.clear()
}

/**
 * Handle bin full status - Create alert and trigger notification
 */
const handleBinFull = async (
  bin: Bin,
  onAlertTriggered?: (bin: Bin) => void
): Promise<void> => {
  try {
    // Check if alert already exists
    const existingAlert = await alertsService.getByBinId(bin.id)
    if (existingAlert) {
      return // Alert already exists
    }

    // Create new alert
    await alertsService.create({
      binId: bin.id,
      severity: AlertSeverity.CRITICAL,
      message: `Bin at ${bin.location || 'Location'} is now full (${bin.fillPercentage}%)`,
      createdAt: Date.now(),
      resolved: false,
    })

    // Play alert sound
    playAlertSound()

    // Show browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('SmartDustbin Alert', {
        body: `Bin full at ${bin.location || 'Location'}`,
        icon: '/dustbin-icon.png',
        tag: `bin-${bin.id}`,
      })
    }

    // Trigger callback
    if (onAlertTriggered) {
      onAlertTriggered(bin)
    }

    console.log(`🔴 ALERT: Bin ${bin.id} is now FULL`)
  } catch (error) {
    console.error('Error handling bin full alert:', error)
  }
}

/**
 * Play alert sound
 */
const playAlertSound = (): void => {
  // Create a simple beep using Web Audio API
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Alert tone: 800Hz for 200ms
    oscillator.frequency.value = 800
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.2)
  } catch (error) {
    console.warn('Could not play alert sound:', error)
  }
}

/**
 * Request notification permission
 */
export const requestNotificationPermission = async (): Promise<void> => {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported')
    return
  }

  if (Notification.permission === 'granted') {
    return
  }

  if (Notification.permission !== 'denied') {
    await Notification.requestPermission()
  }
}

/**
 * Get simulation status
 */
export const getSimulationStatus = (): {
  active: boolean
  activeBins: string[]
  count: number
} => {
  const activeBins = Array.from(activeSimulations.keys())
  return {
    active: activeBins.length > 0,
    activeBins,
    count: activeBins.length,
  }
}

/**
 * Reset bin to initial state (useful for testing)
 */
export const resetBinForTesting = async (bin: Bin): Promise<void> => {
  await binsService.update(bin.id, {
    fillPercentage: Math.random() * 30, // Random between 0-30%
    status: BinStatus.AVAILABLE,
    isCollected: false,
  })

  // Clear any existing alerts
  const alert = await alertsService.getByBinId(bin.id)
  if (alert) {
    await alertsService.resolve(alert.id)
  }
}
