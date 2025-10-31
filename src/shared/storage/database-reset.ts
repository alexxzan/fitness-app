import { db } from "./database";
import { AppState } from "./app.state";
import { ExerciseInitialization } from "@/features/exercises/services/exercise.initialization";

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
      // Clear exercise-related tables
      await db.exercises.clear();
      await db.bodyParts.clear();
      await db.equipment.clear();
      await db.muscles.clear();

      // Reset initialization flag
      await AppState.resetInitialization();

      // Optionally clear user data (workouts, routines)
      if (clearUserData) {
        await db.workouts.clear();
        await db.routines.clear();
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
      db.close();
      await db.delete();
      await db.open();
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
    const [
      exercises,
      bodyParts,
      equipment,
      muscles,
      workouts,
      routines,
      initialized,
    ] = await Promise.all([
      db.exercises.count(),
      db.bodyParts.count(),
      db.equipment.count(),
      db.muscles.count(),
      db.workouts.count(),
      db.routines.count(),
      AppState.isInitialized(),
    ]);

    return {
      initialized,
      exerciseCount: exercises,
      bodyPartCount: bodyParts,
      equipmentCount: equipment,
      muscleCount: muscles,
      workoutCount: workouts,
      routineCount: routines,
    };
  }
}
