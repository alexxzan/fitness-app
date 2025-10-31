import { Preferences } from '@capacitor/preferences'

/**
 * Local storage abstraction using Capacitor Preferences
 * Provides a simple key-value storage interface
 */
export class LocalStorage {
  /**
   * Get a value from storage
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const { value } = await Preferences.get({ key })
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error(`Error getting key ${key}:`, error)
      return null
    }
  }

  /**
   * Set a value in storage
   */
  static async set<T>(key: string, value: T): Promise<void> {
    try {
      await Preferences.set({
        key,
        value: JSON.stringify(value)
      })
    } catch (error) {
      console.error(`Error setting key ${key}:`, error)
      throw error
    }
  }

  /**
   * Remove a value from storage
   */
  static async remove(key: string): Promise<void> {
    try {
      await Preferences.remove({ key })
    } catch (error) {
      console.error(`Error removing key ${key}:`, error)
      throw error
    }
  }

  /**
   * Clear all storage
   */
  static async clear(): Promise<void> {
    try {
      await Preferences.clear()
    } catch (error) {
      console.error('Error clearing storage:', error)
      throw error
    }
  }

  /**
   * Get all keys from storage
   */
  static async keys(): Promise<string[]> {
    try {
      const { keys } = await Preferences.keys()
      return keys
    } catch (error) {
      console.error('Error getting keys:', error)
      return []
    }
  }
}

