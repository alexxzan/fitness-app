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

    console.log("🗑️  Clearing exercise tables...");
    // Clear only exercise-related tables
    await db.exercises.clear();
    await db.bodyParts.clear();
    await db.equipment.clear();
    await db.muscles.clear();

    // Reset initialization flag - this will cause exercises to reload on next startup
    console.log("🔄 Resetting initialization flag...");
    await AppState.resetInitialization();

    console.log("✅ Exercise data cleared successfully");
    console.log("📄 Closing database connection...");
    
    // Close connection to ensure clean state before reload
    await dbAdapter.close();
    
    // Give the database a moment to fully close
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log("✅ Connection closed, ready for reload");
    console.log("💡 On next load, exercises will be reinitialized from JSON files");
  }
}
