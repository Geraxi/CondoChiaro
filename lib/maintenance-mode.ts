/**
 * Maintenance Mode Utilities
 * Checks if system is in maintenance mode and handles restrictions
 */

import { supabase } from './supabase'

export interface MaintenanceStatus {
  enabled: boolean
  message?: string
}

/**
 * Check if maintenance mode is enabled
 */
export async function checkMaintenanceMode(): Promise<MaintenanceStatus> {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value, message')
      .eq('key', 'maintenance_mode')
      .single()

    if (error || !data) {
      return { enabled: false }
    }

    const isEnabled = data.value === true || data.value === 'true'
    const message = data.message || 'System is temporarily unavailable for maintenance'

    return {
      enabled: isEnabled,
      message,
    }
  } catch (error) {
    console.error('Error checking maintenance mode:', error)
    return { enabled: false }
  }
}

/**
 * Check if user can bypass maintenance (admin users)
 */
export async function canBypassMaintenance(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('id')
      .eq('id', userId)
      .single()

    return !error && !!data
  } catch (error) {
    return false
  }
}






