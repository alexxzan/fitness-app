import { db } from "./database";

const INITIALIZED_KEY = "initialized";

/**
 * App state management for tracking initialization status
 */
export class AppState {
  /**
   * Check if the app has been initialized (exercises loaded)
   */
  static async isInitialized(): Promise<boolean> {
    const setting = await db.appSettings.get(INITIALIZED_KEY);
    return setting?.value === true;
  }

  /**
   * Mark the app as initialized (exercises have been loaded)
   */
  static async markAsInitialized(): Promise<void> {
    await db.appSettings.put({ key: INITIALIZED_KEY, value: true });
  }

  /**
   * Reset initialization status (useful for testing or re-initialization)
   */
  static async resetInitialization(): Promise<void> {
    await db.appSettings.delete(INITIALIZED_KEY);
  }
}

