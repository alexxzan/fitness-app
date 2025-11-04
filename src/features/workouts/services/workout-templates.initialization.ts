import { getDatabase } from "@/shared/storage/database-adapter";
import { WorkoutRepository } from "../repositories/workout.repository";
import type {
  WorkoutTemplate,
  WorkoutProgram,
  WorkoutRoutine,
  RoutineExercise,
} from "../types/workout.types";
import { generateId } from "@/shared/utils/id";
import workoutTemplatesData from "../data/workout-templates.json";

const WORKOUT_TEMPLATES_INITIALIZED_KEY = "workout_templates_initialized";

/**
 * Helper function to calculate estimated duration for routine exercises
 * Rough estimate: 2 min per set + 1 min rest
 */
function calculateEstimatedDuration(exercises: RoutineExercise[]): number {
  let totalSets = 0;
  exercises.forEach((ex) => {
    if (ex.targetSets) {
      totalSets += ex.targetSets;
    }
  });
  // 2 minutes per set + 1 minute rest between sets
  return Math.round((totalSets * 3) / 5) * 5; // Round to nearest 5 minutes
}

/**
 * Initialize workout templates from JSON data file
 * Loads all templates as WorkoutPrograms and all workouts as WorkoutRoutines
 */
export class WorkoutTemplatesInitialization {
  /**
   * Check if workout templates are already loaded in the database
   */
  static async isInitialized(): Promise<boolean> {
    const db = getDatabase();
    const value = await db.settings.get(WORKOUT_TEMPLATES_INITIALIZED_KEY);
    const isInit = value === true;
    console.log(
      `📊 Workout templates initialization status: ${
        isInit ? "initialized" : "not initialized"
      }`
    );
    return isInit;
  }

  /**
   * Load all workout templates and routines into the database
   * @param onProgress Optional callback for progress updates (0-100)
   */
  static async initialize(
    onProgress?: (progress: number) => void
  ): Promise<void> {
    try {
      // Check if already initialized
      if (await this.isInitialized()) {
        return;
      }

      const templates = workoutTemplatesData.templates as WorkoutTemplate[];
      const totalTemplates = templates.length;
      let totalRoutines = 0;

      // Count total routines for progress tracking
      templates.forEach((template) => {
        totalRoutines += template.workouts.length;
      });

      console.log(
        `🏋️ Loading ${totalTemplates} workout templates and ${totalRoutines} routines...`
      );

      onProgress?.(0);

      let processedRoutines = 0;

      // Process each template
      for (let i = 0; i < templates.length; i++) {
        const template = templates[i];

        // Convert each workout in the template to a routine
        const routines: WorkoutRoutine[] = template.workouts.map(
          (workout, workoutIndex) => {
            const exercises: RoutineExercise[] = workout.exercises.map(
              (ex, exIndex) => ({
                id: generateId(),
                exerciseId: ex.exerciseId,
                exerciseName: ex.exerciseName,
                targetSets: ex.targetSets,
                targetReps: ex.targetReps,
                order: exIndex,
              })
            );

            return {
              id: generateId(),
              name: workout.name,
              description: undefined,
              exercises,
              type: "template" as const,
              templateId: template.id,
              difficulty: template.difficulty,
              estimatedDuration: calculateEstimatedDuration(exercises),
              isFavorite: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          }
        );

        // Save each routine individually
        for (const routine of routines) {
          await WorkoutRepository.saveRoutine(routine);
          processedRoutines++;

          // Update progress (50% for routines, 50% for programs)
          const progress = (processedRoutines / totalRoutines) * 50;
          onProgress?.(progress);
        }

        // Create WorkoutProgram from template
        const program: WorkoutProgram = {
          id: template.id, // Use template.id as program ID (deterministic)
          name: template.name,
          description: template.description,
          templateId: template.id,
          workouts: routines, // Store routines in program
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Save program
        await WorkoutRepository.saveProgram(program);

        // Update progress (50-100% for programs)
        const programProgress = 50 + ((i + 1) / totalTemplates) * 50;
        onProgress?.(programProgress);

        console.log(
          `  ✅ Loaded template "${template.name}" (${routines.length} routines)`
        );
      }

      // Mark as initialized
      const db = getDatabase();
      await db.settings.set(WORKOUT_TEMPLATES_INITIALIZED_KEY, true);
      console.log("✅ All workout templates loaded successfully");
      onProgress?.(100);
    } catch (error) {
      console.error("Failed to initialize workout templates:", error);
      throw new Error(
        `Failed to initialize workout templates: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Reset initialization (useful for testing or re-initialization)
   */
  static async reset(): Promise<void> {
    const db = getDatabase();

    // Get all programs with templateId to delete them
    const allPrograms = await WorkoutRepository.getAllPrograms();
    const templatePrograms = allPrograms.filter((p) => p.templateId);

    // Delete template programs
    for (const program of templatePrograms) {
      await WorkoutRepository.deleteProgram(program.id);
    }

    // Get all routines with templateId to delete them
    const allRoutines = await WorkoutRepository.getAllRoutines();
    const templateRoutines = allRoutines.filter(
      (r) => r.type === "template" && r.templateId
    );

    // Delete template routines
    for (const routine of templateRoutines) {
      await WorkoutRepository.deleteRoutine(routine.id);
    }

    // Reset initialization flag
    await db.settings.delete(WORKOUT_TEMPLATES_INITIALIZED_KEY);
    console.log(
      "🔄 Workout templates initialization flag reset (will reinitialize on next load)"
    );
  }
}

