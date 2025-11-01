import { ref } from "vue";
import { WorkoutRepository } from "../repositories/workout.repository";
import type { WorkoutProgram, WorkoutTemplate, WorkoutRoutine } from "../types/workout.types";
import { generateId } from "@/shared/utils/id";
import { useRoutine } from "./useRoutine";

/**
 * Composable for managing workout programs
 */
export function useProgram() {
  const programs = ref<WorkoutProgram[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const { createRoutineFromTemplate, calculateEstimatedDuration } = useRoutine();

  /**
   * Load all programs from database
   */
  async function loadPrograms() {
    isLoading.value = true;
    error.value = null;
    try {
      programs.value = await WorkoutRepository.getAllPrograms();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load programs";
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get a program by ID
   */
  async function getProgramById(id: string): Promise<WorkoutProgram | null> {
    try {
      return await WorkoutRepository.getProgramById(id);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to get program";
      return null;
    }
  }

  /**
   * Create a program from a template
   * Converts each workout in the template to a routine
   */
  async function createProgramFromTemplate(
    template: WorkoutTemplate
  ): Promise<WorkoutProgram> {
    // Convert each workout in the template to a routine
    const routines: WorkoutRoutine[] = template.workouts.map((workout, index) => {
      const exercises = workout.exercises.map((ex, exIndex) => ({
        id: generateId(),
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        targetSets: ex.targetSets,
        targetReps: ex.targetReps,
        order: exIndex,
      }));

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
    });

    const program: WorkoutProgram = {
      id: generateId(),
      name: template.name,
      description: template.description,
      templateId: template.id,
      workouts: routines,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await WorkoutRepository.saveProgram(program);
      await loadPrograms(); // Refresh list
      return program;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to create program from template";
      throw err;
    }
  }

  /**
   * Delete a program
   */
  async function deleteProgram(id: string): Promise<void> {
    try {
      await WorkoutRepository.deleteProgram(id);
      await loadPrograms(); // Refresh list
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete program";
      throw err;
    }
  }

  return {
    programs,
    isLoading,
    error,
    loadPrograms,
    getProgramById,
    createProgramFromTemplate,
    deleteProgram,
  };
}

