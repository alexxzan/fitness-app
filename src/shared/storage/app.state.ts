import { getDatabase } from "./database-adapter";

const INITIALIZED_KEY = "initialized";

/**
 * App state management for tracking initialization status
 * Works with both Dexie (web) and SQLite (native)
 */
export class AppState {
  /**
   * Check if the app has been initialized (exercises loaded)
   */
  static async isInitialized(): Promise<boolean> {
    const db = getDatabase();
    const value = await db.settings.get(INITIALIZED_KEY);
    const isInit = value === true;
    console.log(`📊 App initialization status: ${isInit ? 'initialized' : 'not initialized'}`);
    return isInit;
  }

  /**
   * Mark the app as initialized (exercises have been loaded)
   */
  static async markAsInitialized(): Promise<void> {
    const db = getDatabase();
    await db.settings.set(INITIALIZED_KEY, true);
    console.log("✅ App marked as initialized");
  }

  /**
   * Reset initialization status (useful for testing or re-initialization)
   */
  static async resetInitialization(): Promise<void> {
    const db = getDatabase();
    await db.settings.delete(INITIALIZED_KEY);
    console.log("🔄 Initialization flag reset (app will reinitialize on next load)");
  }
}
