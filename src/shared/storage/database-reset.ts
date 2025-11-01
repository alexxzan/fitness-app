import { dbManager, getDb, schema } from "./database";
import { AppState } from "./app.state";
import { ExerciseInitialization } from "@/features/exercises/services/exercise.initialization";
import { sql } from "drizzle-orm";

/**
 * Development utility to reset the database to a clean state
 * This is useful for testing the splash screen and initialization flow
 */
export class DatabaseReset {
  /**
   * Reset the database to a clean state (useful for development/testing)
   * This will:
   * - Clear all exercises, body parts, equipment, and muscles
   * - Reset the initialization flag
   * - Optionally clear workouts and routines (set clearUserData to true)
   */
  static async resetToCleanState(
    clearUserData: boolean = false
  ): Promise<void> {
    try {
      const db = getDb();

      // Clear exercise-related tables
      await db.delete(schema.exercises);
      await db.delete(schema.bodyParts);
      await db.delete(schema.equipment);
      await db.delete(schema.muscles);

      // Reset initialization flag
      await AppState.resetInitialization();

      // Optionally clear user data (workouts, routines)
      if (clearUserData) {
        await db.delete(schema.workouts);
        await db.delete(schema.routines);
      }

      console.log("✅ Database reset to clean state");
      if (clearUserData) {
        console.log("✅ User data (workouts, routines) also cleared");
      }
    } catch (error) {
      console.error("Failed to reset database:", error);
      throw error;
    }
  }

  /**
   * Completely delete and recreate the database
   * This is the most thorough reset option
   */
  static async deleteDatabase(): Promise<void> {
    try {
      await dbManager.deleteDatabase();
      await dbManager.initialize();
      console.log("✅ Database completely deleted and recreated");
    } catch (error) {
      console.error("Failed to delete database:", error);
      throw error;
    }
  }

  /**
   * Reset and immediately re-initialize (useful for testing)
   */
  static async resetAndReinitialize(
    clearUserData: boolean = false,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    await this.resetToCleanState(clearUserData);
    await ExerciseInitialization.initialize(onProgress);
    console.log("✅ Database reset and re-initialized");
  }

  /**
   * Get current database state info (for debugging)
   */
  static async getStateInfo(): Promise<{
    initialized: boolean;
    exerciseCount: number;
    bodyPartCount: number;
    equipmentCount: number;
    muscleCount: number;
    workoutCount: number;
    routineCount: number;
  }> {
    const db = getDb();

    const [
      exercises,
      bodyParts,
      equipment,
      muscles,
      workouts,
      routines,
      initialized,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(schema.exercises),
      db.select({ count: sql<number>`count(*)` }).from(schema.bodyParts),
      db.select({ count: sql<number>`count(*)` }).from(schema.equipment),
      db.select({ count: sql<number>`count(*)` }).from(schema.muscles),
      db.select({ count: sql<number>`count(*)` }).from(schema.workouts),
      db.select({ count: sql<number>`count(*)` }).from(schema.routines),
      AppState.isInitialized(),
    ]);

    return {
      initialized,
      exerciseCount: Number(exercises[0].count),
      bodyPartCount: Number(bodyParts[0].count),
      equipmentCount: Number(equipment[0].count),
      muscleCount: Number(muscles[0].count),
      workoutCount: Number(workouts[0].count),
      routineCount: Number(routines[0].count),
    };
  }
}
