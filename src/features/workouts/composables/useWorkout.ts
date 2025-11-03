import { ref, computed } from "vue";
import { WorkoutRepository } from "../repositories/workout.repository";
import type {
  Workout,
  WorkoutExercise,
  WorkoutSet,
  WorkoutStatistics,
  WorkoutRoutine,
  RoutineExercise,
} from "../types/workout.types";
import type { IntervalConfig, IntervalProgress } from "../types/interval.types";
import { generateId } from "@/shared/utils/id";
import { useRoutineAnalytics } from "./useRoutineAnalytics";

/**
 * Composable for managing workout state and operations
 */
export function useWorkout() {
  const currentWorkout = ref<Workout | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Load the active workout from storage
   * Note: Interval workouts are discarded on load since they're time-sensitive
   * and cannot be properly restored after a page refresh.
   */
  async function loadActiveWorkout() {
    isLoading.value = true;
    error.value = null;
    try {
      const activeWorkout = await WorkoutRepository.getActiveWorkout();

      // Discard interval workouts on load - they're time-sensitive and can't be restored
      if (activeWorkout?.type === "interval") {
        await WorkoutRepository.setActiveWorkout(null);
        currentWorkout.value = null;
      } else {
        currentWorkout.value = activeWorkout;
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load workout";
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Create a new workout (deprecated - use createRegularWorkout or createIntervalWorkout)
   */
  async function createWorkout(name: string): Promise<Workout> {
    return createRegularWorkout(name);
  }

  /**
   * Create a new regular (weightlifting) workout
   */
  async function createRegularWorkout(name: string): Promise<Workout> {
    const workout: Workout = {
      id: generateId(),
      name,
      type: "regular",
      exercises: [],
      startTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    currentWorkout.value = workout;
    await WorkoutRepository.setActiveWorkout(toPlainWorkout(workout));
    return workout;
  }

  /**
   * Create a new interval workout
   */
  async function createIntervalWorkout(
    name: string,
    config: IntervalConfig
  ): Promise<Workout> {
    const workout: Workout = {
      id: generateId(),
      name,
      type: "interval",
      exercises: [],
      intervalConfig: config,
      intervalProgress: {
        currentRound: 1,
        currentInterval: 0,
        completedIntervals: 0,
        currentPhase: "work",
        phaseStartTime: new Date().toISOString(),
        isPaused: false,
      },
      startTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    currentWorkout.value = workout;
    await WorkoutRepository.setActiveWorkout(toPlainWorkout(workout));
    return workout;
  }

  /**
   * Repeat a workout by creating a new workout with the same exercises
   * Sets are copied but marked as incomplete so user can log new data
   */
  async function repeatWorkout(workout: Workout): Promise<Workout> {
    if (workout.type === "interval") {
      // For interval workouts, create a new interval workout with the same config
      if (!workout.intervalConfig) {
        throw new Error(
          "Cannot repeat interval workout without interval config"
        );
      }
      return createIntervalWorkout(
        `${workout.name} (Repeat)`,
        workout.intervalConfig
      );
    }

    // For regular workouts, copy exercises with empty sets
    const exercises: WorkoutExercise[] = workout.exercises.map((ex) => ({
      id: generateId(),
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      sets: ex.sets.map((set) => ({
        id: generateId(),
        reps: set.reps, // Keep reps as a suggestion
        weight: set.weight, // Keep weight as a suggestion
        restTime: set.restTime,
        completed: false, // Mark all sets as incomplete
        setType: set.setType || "working",
        notes: set.notes,
      })),
      notes: ex.notes,
      order: ex.order,
    }));

    const newWorkout: Workout = {
      id: generateId(),
      name: `${workout.name} (Repeat)`,
      type: "regular",
      exercises,
      routineId: workout.routineId,
      routineTemplateId: workout.routineTemplateId,
      completed: false,
      completionPercentage: 0,
      startTime: new Date().toISOString(),
      notes: workout.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    currentWorkout.value = newWorkout;
    await WorkoutRepository.setActiveWorkout(toPlainWorkout(newWorkout));
    return newWorkout;
  }

  /**
   * Create a workout from a routine
   */
  async function createWorkoutFromRoutine(
    routine: WorkoutRoutine
  ): Promise<Workout> {
    // Convert routine exercises to workout exercises with empty sets
    const exercises: WorkoutExercise[] = routine.exercises.map(
      (routineEx: RoutineExercise) => {
        const sets: WorkoutSet[] = [];

        // Pre-populate sets based on targetSets if specified
        if (routineEx.targetSets && routineEx.targetSets > 0) {
          for (let i = 0; i < routineEx.targetSets; i++) {
            sets.push({
              id: generateId(),
              reps: undefined,
              weight: undefined,
              restTime: routineEx.restTime,
              completed: false,
              setType: "working",
              notes: routineEx.targetReps
                ? `Target: ${routineEx.targetReps}`
                : undefined,
            });
          }
        }

        return {
          id: generateId(),
          exerciseId: routineEx.exerciseId,
          exerciseName: routineEx.exerciseName,
          sets,
          notes: routineEx.notes,
          order: routineEx.order,
        };
      }
    );

    const workout: Workout = {
      id: generateId(),
      name: routine.name,
      type: "regular",
      exercises,
      routineId: routine.id,
      routineTemplateId: routine.templateId,
      completed: false,
      completionPercentage: 0,
      startTime: new Date().toISOString(),
      notes: routine.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    currentWorkout.value = workout;
    await WorkoutRepository.setActiveWorkout(toPlainWorkout(workout));
    return workout;
  }

  /**
   * Update interval progress
   */
  function updateIntervalProgress(progress: IntervalProgress) {
    if (!currentWorkout.value || currentWorkout.value.type !== "interval") {
      throw new Error("No active interval workout");
    }

    currentWorkout.value.intervalProgress = progress;
    currentWorkout.value.updatedAt = new Date().toISOString();
    saveWorkout();
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
      setType: set.setType || "working", // Default to 'working'
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
   * Calculate workout statistics (type-aware)
   */
  const statistics = computed<WorkoutStatistics | null>(() => {
    if (!currentWorkout.value) return null;

    let duration = 0;
    if (currentWorkout.value.startTime) {
      const start = new Date(currentWorkout.value.startTime);
      const end = currentWorkout.value.endTime
        ? new Date(currentWorkout.value.endTime)
        : new Date();
      duration = Math.round((end.getTime() - start.getTime()) / 1000 / 60); // minutes
    }

    // Regular workout statistics
    if (currentWorkout.value.type === "regular") {
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

      return {
        totalVolume,
        totalSets,
        totalReps,
        duration,
        exercisesCount: currentWorkout.value.exercises.length,
      };
    }

    // Interval workout statistics
    if (
      currentWorkout.value.type === "interval" &&
      currentWorkout.value.intervalProgress
    ) {
      return {
        totalVolume: 0, // Not applicable for interval
        totalSets: 0, // Not applicable for interval
        totalReps: 0, // Not applicable for interval
        duration,
        exercisesCount:
          currentWorkout.value.intervalConfig?.exercises.length || 0,
      };
    }

    return {
      totalVolume: 0,
      totalSets: 0,
      totalReps: 0,
      duration,
      exercisesCount: 0,
    };
  });

  /**
   * Helper to convert reactive workout to plain object for storage
   */
  function toPlainWorkout(workout: Workout): Workout {
    return JSON.parse(JSON.stringify(workout));
  }

  /**
   * Save the current workout
   */
  async function saveWorkout() {
    if (!currentWorkout.value) return;

    isLoading.value = true;
    error.value = null;
    try {
      await WorkoutRepository.setActiveWorkout(
        toPlainWorkout(currentWorkout.value)
      );
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
      const {
        calculateWorkoutCompletionPercentage,
        updateRoutineAnalyticsAfterWorkout,
      } = useRoutineAnalytics();

      currentWorkout.value.endTime = new Date().toISOString();
      currentWorkout.value.updatedAt = new Date().toISOString();

      // Calculate completion percentage
      const completionPercentage = calculateWorkoutCompletionPercentage(
        currentWorkout.value
      );
      currentWorkout.value.completionPercentage = completionPercentage;
      currentWorkout.value.completed = completionPercentage >= 50; // Consider 50%+ as completed

      const workoutToSave = toPlainWorkout(currentWorkout.value);

      await WorkoutRepository.save(workoutToSave);
      await WorkoutRepository.setActiveWorkout(null);

      // Update routine analytics if workout was from a routine
      if (workoutToSave.routineId) {
        try {
          await updateRoutineAnalyticsAfterWorkout(workoutToSave);
        } catch (analyticsErr) {
          console.error("Failed to update routine analytics:", analyticsErr);
          // Don't throw - analytics failure shouldn't prevent workout completion
        }
      }

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
    createRegularWorkout,
    createIntervalWorkout,
    createWorkoutFromRoutine,
    repeatWorkout,
    updateIntervalProgress,
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
