import { ref } from "vue";
import { WorkoutRepository } from "../repositories/workout.repository";
import type {
  WorkoutRoutine,
  RoutineExercise,
  WorkoutTemplate,
} from "../types/workout.types";
import { generateId } from "@/shared/utils/id";
import workoutTemplates from "../data/workout-templates.json";

/**
 * Composable for managing workout routines
 */
export function useRoutine() {
  const routines = ref<WorkoutRoutine[]>([]);
  const templates = ref<WorkoutTemplate[]>(
    workoutTemplates.templates as WorkoutTemplate[]
  );
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Load all routines from database
   */
  async function loadRoutines() {
    isLoading.value = true;
    error.value = null;
    try {
      routines.value = await WorkoutRepository.getAllRoutines();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load routines";
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get a routine by ID
   */
  async function getRoutineById(id: string): Promise<WorkoutRoutine | null> {
    try {
      return await WorkoutRepository.getRoutineById(id);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to get routine";
      return null;
    }
  }

  /**
   * Create a custom routine
   */
  async function createCustomRoutine(
    name: string,
    description: string,
    exercises: RoutineExercise[]
  ): Promise<WorkoutRoutine> {
    const routine: WorkoutRoutine = {
      id: generateId(),
      name,
      description,
      exercises,
      type: "custom",
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await WorkoutRepository.saveRoutine(routine);
      await loadRoutines(); // Refresh list
      return routine;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to create routine";
      throw err;
    }
  }

  /**
   * Create a routine from a template
   * Note: If template has multiple workouts, this creates a routine from the first workout only.
   * For templates with multiple workouts, use createProgramFromTemplate instead.
   */
  async function createRoutineFromTemplate(
    template: WorkoutTemplate,
    workoutIndex: number = 0
  ): Promise<WorkoutRoutine> {
    const selectedWorkout = template.workouts[workoutIndex];
    if (!selectedWorkout) {
      throw new Error("Workout index out of range");
    }

    const exercises: RoutineExercise[] = selectedWorkout.exercises.map(
      (ex, index) => ({
        id: generateId(),
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        targetSets: ex.targetSets,
        targetReps: ex.targetReps,
        order: index,
      })
    );

    const routine: WorkoutRoutine = {
      id: generateId(),
      name: `${template.name} - ${selectedWorkout.name}`,
      description: template.description,
      exercises,
      type: "template",
      templateId: template.id,
      difficulty: template.difficulty,
      estimatedDuration: calculateEstimatedDuration(exercises),
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await WorkoutRepository.saveRoutine(routine);
      await loadRoutines(); // Refresh list
      return routine;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to create routine from template";
      throw err;
    }
  }

  /**
   * Update an existing routine
   */
  async function updateRoutine(
    id: string,
    updates: Partial<WorkoutRoutine>
  ): Promise<void> {
    try {
      const existing = await WorkoutRepository.getRoutineById(id);
      if (!existing) {
        throw new Error("Routine not found");
      }

      const updated: WorkoutRoutine = {
        ...existing,
        ...updates,
        id: existing.id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString(),
      };

      await WorkoutRepository.saveRoutine(updated);
      await loadRoutines(); // Refresh list
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update routine";
      throw err;
    }
  }

  /**
   * Delete a routine
   */
  async function deleteRoutine(id: string): Promise<void> {
    try {
      await WorkoutRepository.deleteRoutine(id);
      await loadRoutines(); // Refresh list
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete routine";
      throw err;
    }
  }

  /**
   * Toggle favorite status of a routine
   */
  async function toggleFavorite(id: string): Promise<void> {
    try {
      const routine = await WorkoutRepository.getRoutineById(id);
      if (!routine) {
        throw new Error("Routine not found");
      }

      await updateRoutine(id, { isFavorite: !routine.isFavorite });
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to toggle favorite";
      throw err;
    }
  }

  /**
   * Get all templates
   */
  function getTemplates(): WorkoutTemplate[] {
    return templates.value;
  }

  /**
   * Get template by ID
   */
  function getTemplateById(id: string): WorkoutTemplate | undefined {
    return templates.value.find((t) => t.id === id);
  }

  /**
   * Filter templates by difficulty
   */
  function getTemplatesByDifficulty(
    difficulty: "beginner" | "intermediate" | "advanced"
  ): WorkoutTemplate[] {
    return templates.value.filter((t) => t.difficulty === difficulty);
  }

  /**
   * Calculate estimated duration for routine exercises
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
   * Search routines by name
   */
  function searchRoutines(query: string): WorkoutRoutine[] {
    if (!query) return routines.value;

    const lowerQuery = query.toLowerCase();
    return routines.value.filter(
      (r) =>
        r.name.toLowerCase().includes(lowerQuery) ||
        r.description?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get favorite routines
   */
  function getFavoriteRoutines(): WorkoutRoutine[] {
    return routines.value.filter((r) => r.isFavorite);
  }

  /**
   * Get routines by type
   */
  function getRoutinesByType(type: "custom" | "template"): WorkoutRoutine[] {
    return routines.value.filter((r) => r.type === type);
  }

  return {
    routines,
    templates,
    isLoading,
    error,
    loadRoutines,
    getRoutineById,
    createCustomRoutine,
    createRoutineFromTemplate,
    updateRoutine,
    deleteRoutine,
    toggleFavorite,
    getTemplates,
    getTemplateById,
    getTemplatesByDifficulty,
    calculateEstimatedDuration,
    searchRoutines,
    getFavoriteRoutines,
    getRoutinesByType,
  };
}
