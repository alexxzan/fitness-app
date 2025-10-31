import { ref, computed } from "vue";
import { WorkoutRepository } from "../repositories/workout.repository";
import type {
  Workout,
  WorkoutExercise,
  WorkoutSet,
  WorkoutStatistics,
} from "../types/workout.types";
import { generateId } from "@/shared/utils/id";

/**
 * Composable for managing workout state and operations
 */
export function useWorkout() {
  const currentWorkout = ref<Workout | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Load the active workout from storage
   */
  async function loadActiveWorkout() {
    isLoading.value = true;
    error.value = null;
    try {
      currentWorkout.value = await WorkoutRepository.getActiveWorkout();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load workout";
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Create a new workout
   */
  async function createWorkout(name: string): Promise<Workout> {
    const workout: Workout = {
      id: generateId(),
      name,
      exercises: [],
      startTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    currentWorkout.value = workout;
    await WorkoutRepository.setActiveWorkout(workout);
    return workout;
  }

  /**
   * Add an exercise to the current workout
   */
  function addExercise(exerciseId: string, exerciseName: string) {
    if (!currentWorkout.value) {
      throw new Error("No active workout");
    }

    const exercise: WorkoutExercise = {
      id: generateId(),
      exerciseId,
      exerciseName,
      sets: [],
      order: currentWorkout.value.exercises.length,
    };

    currentWorkout.value.exercises.push(exercise);
    currentWorkout.value.updatedAt = new Date().toISOString();
    saveWorkout();
  }

  /**
   * Remove an exercise from the current workout
   */
  function removeExercise(exerciseId: string) {
    if (!currentWorkout.value) return;

    currentWorkout.value.exercises = currentWorkout.value.exercises.filter(
      (e) => e.id !== exerciseId
    );
    // Reorder exercises
    currentWorkout.value.exercises.forEach((ex, index) => {
      ex.order = index;
    });
    currentWorkout.value.updatedAt = new Date().toISOString();
    saveWorkout();
  }

  /**
   * Add a set to an exercise
   */
  function addSet(
    exerciseId: string,
    set: Omit<WorkoutSet, "id" | "completed">
  ) {
    if (!currentWorkout.value) {
      throw new Error("No active workout");
    }

    const exercise = currentWorkout.value.exercises.find(
      (e) => e.id === exerciseId
    );
    if (!exercise) {
      throw new Error("Exercise not found");
    }

    const newSet: WorkoutSet = {
      id: generateId(),
      ...set,
      completed: false,
    };

    exercise.sets.push(newSet);
    currentWorkout.value.updatedAt = new Date().toISOString();
    saveWorkout();
  }

  /**
   * Update a set
   */
  function updateSet(
    exerciseId: string,
    setId: string,
    updates: Partial<WorkoutSet>
  ) {
    if (!currentWorkout.value) return;

    const exercise = currentWorkout.value.exercises.find(
      (e) => e.id === exerciseId
    );
    if (!exercise) return;

    const set = exercise.sets.find((s) => s.id === setId);
    if (!set) return;

    Object.assign(set, updates);
    currentWorkout.value.updatedAt = new Date().toISOString();
    saveWorkout();
  }

  /**
   * Toggle set completion
   */
  function toggleSetCompleted(exerciseId: string, setId: string) {
    if (!currentWorkout.value) return;

    const exercise = currentWorkout.value.exercises.find(
      (e) => e.id === exerciseId
    );
    if (!exercise) return;

    const set = exercise.sets.find((s) => s.id === setId);
    if (!set) return;

    set.completed = !set.completed;
    currentWorkout.value.updatedAt = new Date().toISOString();
    saveWorkout();
  }

  /**
   * Delete a set
   */
  function deleteSet(exerciseId: string, setId: string) {
    if (!currentWorkout.value) return;

    const exercise = currentWorkout.value.exercises.find(
      (e) => e.id === exerciseId
    );
    if (!exercise) return;

    exercise.sets = exercise.sets.filter((s) => s.id !== setId);
    currentWorkout.value.updatedAt = new Date().toISOString();
    saveWorkout();
  }

  /**
   * Calculate workout statistics
   */
  const statistics = computed<WorkoutStatistics | null>(() => {
    if (!currentWorkout.value) return null;

    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;

    currentWorkout.value.exercises.forEach((exercise) => {
      exercise.sets.forEach((set) => {
        if (set.completed && set.reps && set.weight) {
          totalVolume += set.reps * set.weight;
          totalSets += 1;
          totalReps += set.reps;
        }
      });
    });

    let duration = 0;
    if (currentWorkout.value.startTime) {
      const start = new Date(currentWorkout.value.startTime);
      const end = currentWorkout.value.endTime
        ? new Date(currentWorkout.value.endTime)
        : new Date();
      duration = Math.round((end.getTime() - start.getTime()) / 1000 / 60); // minutes
    }

    return {
      totalVolume,
      totalSets,
      totalReps,
      duration,
      exercisesCount: currentWorkout.value.exercises.length,
    };
  });

  /**
   * Save the current workout
   */
  async function saveWorkout() {
    if (!currentWorkout.value) return;

    isLoading.value = true;
    error.value = null;
    try {
      await WorkoutRepository.setActiveWorkout(currentWorkout.value);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to save workout";
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Finish and save the workout to history
   */
  async function finishWorkout() {
    if (!currentWorkout.value) {
      throw new Error("No active workout");
    }

    isLoading.value = true;
    error.value = null;
    try {
      currentWorkout.value.endTime = new Date().toISOString();
      currentWorkout.value.updatedAt = new Date().toISOString();

      await WorkoutRepository.save(currentWorkout.value);
      await WorkoutRepository.setActiveWorkout(null);
      currentWorkout.value = null;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to finish workout";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Discard the current workout
   */
  async function discardWorkout() {
    isLoading.value = true;
    error.value = null;
    try {
      await WorkoutRepository.setActiveWorkout(null);
      currentWorkout.value = null;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to discard workout";
    } finally {
      isLoading.value = false;
    }
  }

  return {
    currentWorkout,
    isLoading,
    error,
    statistics,
    loadActiveWorkout,
    createWorkout,
    addExercise,
    removeExercise,
    addSet,
    updateSet,
    toggleSetCompleted,
    deleteSet,
    saveWorkout,
    finishWorkout,
    discardWorkout,
  };
}
