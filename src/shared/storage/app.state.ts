import { getDb, schema } from "./database";
import { eq } from "drizzle-orm";

const INITIALIZED_KEY = "initialized";

/**
 * App state management for tracking initialization status
 */
export class AppState {
  /**
   * Check if the app has been initialized (exercises loaded)
   */
  static async isInitialized(): Promise<boolean> {
    const db = getDb();
    const results = await db
      .select()
      .from(schema.appSettings)
      .where(eq(schema.appSettings.key, INITIALIZED_KEY))
      .limit(1);

    if (results.length === 0) {
      return false;
    }

    const value = JSON.parse(results[0].value);
    return value === true;
  }

  /**
   * Mark the app as initialized (exercises have been loaded)
   */
  static async markAsInitialized(): Promise<void> {
    const db = getDb();
    await db
      .insert(schema.appSettings)
      .values({ key: INITIALIZED_KEY, value: JSON.stringify(true) })
      .onConflictDoUpdate({
        target: schema.appSettings.key,
        set: { value: JSON.stringify(true) },
      });
  }

  /**
   * Reset initialization status (useful for testing or re-initialization)
   */
  static async resetInitialization(): Promise<void> {
    const db = getDb();
    await db
      .delete(schema.appSettings)
      .where(eq(schema.appSettings.key, INITIALIZED_KEY));
  }
}
