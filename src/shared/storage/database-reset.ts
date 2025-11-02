import { dbAdapter, getDatabase } from "./database-adapter";
import { AppState } from "./app.state";
import { ExerciseInitialization } from "@/features/exercises/services/exercise.initialization";

/**
 * Development utility to reset exercise data
 */
export class DatabaseReset {
  /**
   * Reset exercise data and reload from JSON files
   * Preserves user data (workouts, routines)
   */
  static async resetExerciseData(
    onProgress?: (progress: number) => void
  ): Promise<void> {
    console.log("🔄 Resetting exercise data...");

    await dbAdapter.initialize();
    const db = getDatabase();

    // Clear only exercise-related tables
    await db.exercises.clear();
    await db.bodyParts.clear();
    await db.equipment.clear();
    await db.muscles.clear();

    // Reset initialization flag
    await AppState.resetInitialization();

    console.log("✅ Exercise data cleared, reinitializing...");

    // Reload exercises from JSON
    await ExerciseInitialization.initialize(onProgress);

    console.log("✅ Exercise data reset complete");
  }
}
