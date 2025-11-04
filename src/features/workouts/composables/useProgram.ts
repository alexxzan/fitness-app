import { ref, computed } from "vue";
import { WorkoutRepository } from "../repositories/workout.repository";
import type {
  WorkoutProgram,
  WorkoutTemplate,
  WorkoutRoutine,
} from "../types/workout.types";
import { generateId } from "@/shared/utils/id";
import { useRoutine } from "./useRoutine";

/**
 * Composable for managing workout programs
 */
export function useProgram() {
  const programs = ref<WorkoutProgram[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const { createRoutineFromTemplate, calculateEstimatedDuration } =
    useRoutine();

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
   * Get enabled programs only (for "My Workout Programs" section)
   */
  const enabledPrograms = computed(() => {
    return programs.value.filter((p) => p.isEnabled === true);
  });

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
   * If a program with the same templateId already exists, enables it instead of creating a new one
   */
  async function createProgramFromTemplate(
    template: WorkoutTemplate
  ): Promise<WorkoutProgram> {
    // Check if a program with this templateId already exists
    // Query all programs to find matching templateId
    const allPrograms = await WorkoutRepository.getAllPrograms();
    const existingProgram = allPrograms.find(
      (p) => p.templateId === template.id
    );

    if (existingProgram) {
      // If program exists, just enable it
      existingProgram.isEnabled = true;
      existingProgram.updatedAt = new Date().toISOString();
      try {
        await WorkoutRepository.saveProgram(existingProgram);
        await loadPrograms(); // Refresh list
        return existingProgram;
      } catch (err) {
        error.value =
          err instanceof Error ? err.message : "Failed to enable program";
        throw err;
      }
    }

    // Convert each workout in the template to a routine
    const routines: WorkoutRoutine[] = template.workouts.map(
      (workout, index) => {
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
      }
    );

    const program: WorkoutProgram = {
      id: generateId(),
      name: template.name,
      description: template.description,
      templateId: template.id,
      workouts: routines,
      isEnabled: true, // Set to enabled when user adds it
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
   * Delete a program (actually just disables it by setting isEnabled to false)
   * This keeps the program in the database but removes it from "My Workout Programs"
   */
  async function deleteProgram(id: string): Promise<void> {
    try {
      const program = await WorkoutRepository.getProgramById(id);
      if (!program) {
        throw new Error("Program not found");
      }
      // Instead of deleting, just disable it
      program.isEnabled = false;
      program.updatedAt = new Date().toISOString();
      await WorkoutRepository.saveProgram(program);
      await loadPrograms(); // Refresh list
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to remove program";
      throw err;
    }
  }

  /**
   * Rename a program
   */
  async function renameProgram(id: string, newName: string): Promise<void> {
    try {
      const program = await WorkoutRepository.getProgramById(id);
      if (!program) {
        throw new Error("Program not found");
      }

      program.name = newName.trim();
      program.updatedAt = new Date().toISOString();

      await WorkoutRepository.saveProgram(program);
      await loadPrograms(); // Refresh list
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to rename program";
      throw err;
    }
  }

  /**
   * Copy a program
   * Creates a duplicate with " (Copy)" appended to the name
   */
  async function copyProgram(program: WorkoutProgram): Promise<WorkoutProgram> {
    try {
      // Generate new IDs for all routines in the program
      const copiedRoutines: WorkoutRoutine[] = program.workouts.map(
        (routine) => {
          // Generate new IDs for all exercises in the routine
          const copiedExercises = routine.exercises.map((exercise) => ({
            ...exercise,
            id: generateId(),
          }));

          return {
            ...routine,
            id: generateId(),
            exercises: copiedExercises,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
      );

      const copiedProgram: WorkoutProgram = {
        ...program,
        id: generateId(),
        name: `${program.name} (Copy)`,
        workouts: copiedRoutines,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await WorkoutRepository.saveProgram(copiedProgram);
      await loadPrograms(); // Refresh list
      return copiedProgram;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to copy program";
      throw err;
    }
  }

  return {
    programs,
    enabledPrograms,
    isLoading,
    error,
    loadPrograms,
    getProgramById,
    createProgramFromTemplate,
    deleteProgram,
    renameProgram,
    copyProgram,
  };
}
