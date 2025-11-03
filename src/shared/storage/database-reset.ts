import { dbAdapter, getDatabase } from "./database-adapter";
import { AppState } from "./app.state";
import { ExerciseInitialization } from "@/features/exercises/services/exercise.initialization";
import { WorkoutRepository } from "@/features/workouts/repositories/workout.repository";
import type { Workout } from "@/features/workouts/types/workout.types";

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

  /**
   * Complete all unfinished workouts
   * Marks all workouts without endTime or with completed=false as completed
   */
  static async completeAllUnfinishedWorkouts(): Promise<{
    completed: number;
    skipped: number;
    errors: number;
  }> {
    console.log("🏋️  Completing all unfinished workouts...");

    await dbAdapter.initialize();
    const db = getDatabase();

    try {
      // Get all workouts
      const allWorkouts = await db.workouts.getAll();
      console.log(`📊 Found ${allWorkouts.length} total workouts`);

      let completed = 0;
      let skipped = 0;
      let errors = 0;

      const now = new Date().toISOString();

      for (const workout of allWorkouts) {
        try {
          // Check if workout is incomplete
          const isIncomplete =
            !workout.endTime ||
            workout.endTime === "" ||
            workout.completed === false ||
            workout.completed === undefined;

          if (!isIncomplete) {
            skipped++;
            continue;
          }

          // Calculate completion percentage if it's a regular workout
          let completionPercentage = 100; // Default to 100% if we can't calculate

          if (workout.type === "regular" && workout.exercises) {
            let totalSets = 0;
            let completedSets = 0;

            workout.exercises.forEach((exercise: any) => {
              if (exercise.sets && Array.isArray(exercise.sets)) {
                exercise.sets.forEach((set: any) => {
                  totalSets++;
                  if (set.completed) {
                    completedSets++;
                  }
                });
              }
            });

            if (totalSets > 0) {
              completionPercentage = Math.round(
                (completedSets / totalSets) * 100
              );
            }
          }

          // Update workout to mark as completed
          workout.endTime = workout.endTime || now;
          workout.completed = true;
          workout.completionPercentage = completionPercentage;
          workout.updatedAt = now;

          // Save the workout
          await WorkoutRepository.save(workout);
          completed++;

          console.log(
            `✅ Completed workout: "${workout.name}" (${completionPercentage}% completion)`
          );
        } catch (error) {
          errors++;
          console.error(`❌ Error completing workout "${workout.name}":`, error);
        }
      }

      const result = {
        completed,
        skipped,
        errors,
      };

      console.log("\n📊 Summary:");
      console.log(`   ✅ Completed: ${completed}`);
      console.log(`   ⏭️  Skipped (already complete): ${skipped}`);
      console.log(`   ❌ Errors: ${errors}`);
      console.log("✅ Done!");

      return result;
    } catch (error) {
      console.error("❌ Failed to complete unfinished workouts:", error);
      throw error;
    }
  }
}
