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
import { useRoutine } from "./useRoutine";
import { useProgram } from "./useProgram";

/**
 * Composable for managing workout state and operations
 */
export function useWorkout() {
  const currentWorkout = ref<Workout | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Track exercise modifications for routine saving
  const exercisesReplaced = ref<string[]>([]); // Exercise IDs that were replaced
  const exercisesDeleted = ref<string[]>([]); // Exercise IDs that were deleted
  const exercisesLinkedAsSuperset = ref<Array<[string, string]>>([]); // Pairs of exercise IDs linked

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
        // Reset change tracking
        exercisesReplaced.value = [];
        exercisesDeleted.value = [];
        exercisesLinkedAsSuperset.value = [];
      } else {
        currentWorkout.value = activeWorkout;
        // Reset change tracking when loading existing workout
        // Changes are only tracked for the current session
        exercisesReplaced.value = [];
        exercisesDeleted.value = [];
        exercisesLinkedAsSuperset.value = [];
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
    // Reset change tracking for new workout
    exercisesReplaced.value = [];
    exercisesDeleted.value = [];
    exercisesLinkedAsSuperset.value = [];

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
   * @param routine - The routine to create a workout from
   * @param programId - Optional program ID if the routine is part of a program
   */
  async function createWorkoutFromRoutine(
    routine: WorkoutRoutine,
    programId?: string
  ): Promise<Workout> {
    // Reset change tracking for new workout
    exercisesReplaced.value = [];
    exercisesDeleted.value = [];
    exercisesLinkedAsSuperset.value = [];

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
      programId, // Track program ID if provided
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
   * Replace an exercise with a new one
   * Preserves incomplete sets, clears completed sets
   */
  function replaceExercise(
    exerciseId: string,
    newExerciseId: string,
    newExerciseName: string
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

    // Preserve incomplete sets, clear completed ones
    const incompleteSets = exercise.sets.filter((set) => !set.completed);

    // Update exercise
    exercise.exerciseId = newExerciseId;
    exercise.exerciseName = newExerciseName;
    exercise.sets = incompleteSets.map((set) => ({
      ...set,
      id: generateId(), // Generate new IDs for preserved sets
    }));

    // Track replacement
    if (!exercisesReplaced.value.includes(exerciseId)) {
      exercisesReplaced.value.push(exerciseId);
    }

    currentWorkout.value.updatedAt = new Date().toISOString();
    saveWorkout();
  }

  /**
   * Link two exercises as a superset
   */
  function linkExercisesAsSuperset(exerciseId1: string, exerciseId2: string) {
    if (!currentWorkout.value) {
      throw new Error("No active workout");
    }

    const exercise1 = currentWorkout.value.exercises.find(
      (e) => e.id === exerciseId1
    );
    const exercise2 = currentWorkout.value.exercises.find(
      (e) => e.id === exerciseId2
    );

    if (!exercise1 || !exercise2) {
      throw new Error("One or both exercises not found");
    }

    // Generate or reuse superset group ID
    const supersetGroupId = exercise1.supersetGroupId || generateId();

    // Link both exercises
    exercise1.supersetGroupId = supersetGroupId;
    exercise2.supersetGroupId = supersetGroupId;

    // Track linking
    const linkPair: [string, string] = [exerciseId1, exerciseId2];
    const existingLink = exercisesLinkedAsSuperset.value.find(
      (pair) =>
        (pair[0] === exerciseId1 && pair[1] === exerciseId2) ||
        (pair[0] === exerciseId2 && pair[1] === exerciseId1)
    );
    if (!existingLink) {
      exercisesLinkedAsSuperset.value.push(linkPair);
    }

    currentWorkout.value.updatedAt = new Date().toISOString();
    saveWorkout();
  }

  /**
   * Remove an exercise from the current workout
   */
  function removeExercise(exerciseId: string) {
    if (!currentWorkout.value) return;

    const exercise = currentWorkout.value.exercises.find(
      (e) => e.id === exerciseId
    );
    if (exercise?.supersetGroupId) {
      // If exercise is in a superset, remove the group ID from other exercises
      const groupId = exercise.supersetGroupId;
      currentWorkout.value.exercises.forEach((ex) => {
        if (ex.id !== exerciseId && ex.supersetGroupId === groupId) {
          delete ex.supersetGroupId;
        }
      });
    }

    currentWorkout.value.exercises = currentWorkout.value.exercises.filter(
      (e) => e.id !== exerciseId
    );
    // Reorder exercises
    currentWorkout.value.exercises.forEach((ex, index) => {
      ex.order = index;
    });

    // Track deletion
    if (!exercisesDeleted.value.includes(exerciseId)) {
      exercisesDeleted.value.push(exerciseId);
    }

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
    // Deep clone to remove Vue reactivity and ensure all properties are included
    const plain = JSON.parse(JSON.stringify(workout));
    // Ensure sets have all properties explicitly included, even if null/undefined
    plain.exercises = plain.exercises.map((ex: WorkoutExercise) => ({
      ...ex,
      sets: ex.sets.map((set: WorkoutSet) => ({
        id: set.id,
        reps: set.reps ?? null,
        weight: set.weight ?? null,
        restTime: set.restTime ?? null,
        completed: set.completed,
        notes: set.notes ?? null,
        setType: set.setType ?? "working",
      })),
    }));
    return plain;
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
   * Check if workout has routine changes that need saving
   */
  const hasRoutineChanges = computed(() => {
    if (!currentWorkout.value?.routineId && !currentWorkout.value?.programId) {
      return false;
    }
    return (
      exercisesReplaced.value.length > 0 ||
      exercisesDeleted.value.length > 0 ||
      exercisesLinkedAsSuperset.value.length > 0
    );
  });

  /**
   * Save workout changes back to the routine or program
   * Returns true if successful, false if routine/program not found (deleted)
   */
  async function saveWorkoutChangesToRoutine(): Promise<boolean> {
    if (!currentWorkout.value?.routineId && !currentWorkout.value?.programId) {
      throw new Error("Workout is not associated with a routine or program");
    }

    // If workout is part of a program, update the program's routine
    if (currentWorkout.value.programId) {
      return await saveWorkoutChangesToProgram();
    }

    // Otherwise, update standalone routine
    const { updateRoutine, getRoutineById } = useRoutine();

    // Verify routine exists before trying to update
    const routine = await getRoutineById(currentWorkout.value.routineId!);
    if (!routine) {
      // Routine not found - may have been deleted
      // Return false to indicate failure, but don't throw
      return false;
    }

    // Convert WorkoutExercise[] to RoutineExercise[]
    const routineExercises = convertWorkoutExercisesToRoutineExercises(
      currentWorkout.value.exercises,
      routine.exercises
    );

    await updateRoutine(currentWorkout.value.routineId!, {
      exercises: routineExercises,
    });

    // Clear change tracking after saving
    clearChangeTracking();

    return true; // Success
  }

  /**
   * Save workout changes back to the program's routine
   */
  async function saveWorkoutChangesToProgram(): Promise<boolean> {
    if (!currentWorkout.value?.programId || !currentWorkout.value?.routineId) {
      throw new Error("Workout is missing program or routine ID");
    }

    const { getProgramById, loadPrograms } = useProgram();

    // Get the program
    const program = await getProgramById(currentWorkout.value.programId);
    if (!program) {
      // Program not found - may have been deleted
      return false;
    }

    // Find the routine within the program
    const routineIndex = program.workouts.findIndex(
      (r) => r.id === currentWorkout.value!.routineId
    );

    if (routineIndex === -1) {
      // Routine not found in program
      return false;
    }

    const routine = program.workouts[routineIndex];

    // Convert WorkoutExercise[] to RoutineExercise[]
    const routineExercises = convertWorkoutExercisesToRoutineExercises(
      currentWorkout.value.exercises,
      routine.exercises
    );

    // Update the routine within the program
    program.workouts[routineIndex] = {
      ...routine,
      exercises: routineExercises,
      updatedAt: new Date().toISOString(),
    };

    // Update the program itself
    program.updatedAt = new Date().toISOString();

    // Save the updated program
    await WorkoutRepository.saveProgram(program);

    // Reload programs to update the cached list
    // This ensures the next workout uses the updated program data
    await loadPrograms();

    // Clear change tracking after saving
    clearChangeTracking();

    return true; // Success
  }

  /**
   * Helper to convert WorkoutExercise[] to RoutineExercise[]
   * Preserves existing routine exercise IDs where possible
   */
  function convertWorkoutExercisesToRoutineExercises(
    workoutExercises: WorkoutExercise[],
    routineExercises: RoutineExercise[]
  ): RoutineExercise[] {
    // Track which routine exercise IDs we've already used to avoid duplicates
    const usedRoutineExerciseIds = new Set<string>();

    return workoutExercises.map((ex, index) => {
      // Try to find matching routine exercise by exerciseId (regardless of position)
      // This handles cases where exercises are reordered
      // Only match if we haven't already used this routine exercise
      let matchingRoutineExercise = routineExercises.find(
        (re) =>
          re.exerciseId === ex.exerciseId && !usedRoutineExerciseIds.has(re.id)
      );

      // If no match found, try matching by position as fallback
      if (!matchingRoutineExercise && index < routineExercises.length) {
        const routineExAtPosition = routineExercises[index];
        if (
          routineExAtPosition &&
          !usedRoutineExerciseIds.has(routineExAtPosition.id)
        ) {
          matchingRoutineExercise = routineExAtPosition;
        }
      }

      // Mark this routine exercise ID as used if we found a match
      if (matchingRoutineExercise) {
        usedRoutineExerciseIds.add(matchingRoutineExercise.id);
      }

      // Calculate targetSets from actual sets (if any exist)
      const targetSets = ex.sets.length > 0 ? ex.sets.length : undefined;

      // Get target reps from first set if available
      const firstSet = ex.sets[0];
      const targetReps = firstSet?.reps ? firstSet.reps.toString() : undefined;

      // Get rest time from first set if available
      const restTime = firstSet?.restTime || undefined;

      return {
        // Preserve ID if we found a match, otherwise generate new one
        id: matchingRoutineExercise?.id || generateId(),
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        // Use workout data if available, otherwise fall back to routine data
        targetSets: targetSets ?? matchingRoutineExercise?.targetSets,
        targetReps: targetReps || matchingRoutineExercise?.targetReps,
        restTime: restTime ?? matchingRoutineExercise?.restTime,
        notes: ex.notes || matchingRoutineExercise?.notes,
        order: index,
      };
    });
  }

  /**
   * Clear change tracking
   */
  function clearChangeTracking() {
    exercisesReplaced.value = [];
    exercisesDeleted.value = [];
    exercisesLinkedAsSuperset.value = [];
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
      // Always mark as completed when finishing workout - user intentionally finished it
      // The completion percentage is still tracked for analytics
      currentWorkout.value.completed = true;

      const workoutToSave = toPlainWorkout(currentWorkout.value);

      console.log('Saving completed workout:', {
        id: workoutToSave.id,
        name: workoutToSave.name,
        completed: workoutToSave.completed,
        completionPercentage: workoutToSave.completionPercentage,
        endTime: workoutToSave.endTime,
        exercisesCount: workoutToSave.exercises.length,
      });

      await WorkoutRepository.save(workoutToSave);
      console.log('Workout saved successfully to database');
      
      await WorkoutRepository.setActiveWorkout(null);
      console.log('Active workout cleared');

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

      // Clear change tracking after workout is cleared
      exercisesReplaced.value = [];
      exercisesDeleted.value = [];
      exercisesLinkedAsSuperset.value = [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to finish workout";
      error.value = errorMessage;
      console.error('Error finishing workout:', err);
      console.error('Error details:', {
        message: errorMessage,
        stack: err instanceof Error ? err.stack : undefined,
      });
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
      // Delete the workout from database instead of just clearing active flag
      if (currentWorkout.value) {
        await WorkoutRepository.delete(currentWorkout.value.id);
      }
      await WorkoutRepository.setActiveWorkout(null);
      currentWorkout.value = null;
      // Clear change tracking
      exercisesReplaced.value = [];
      exercisesDeleted.value = [];
      exercisesLinkedAsSuperset.value = [];
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
    hasRoutineChanges,
    loadActiveWorkout,
    createWorkout,
    createRegularWorkout,
    createIntervalWorkout,
    createWorkoutFromRoutine,
    repeatWorkout,
    updateIntervalProgress,
    addExercise,
    removeExercise,
    replaceExercise,
    linkExercisesAsSuperset,
    addSet,
    updateSet,
    toggleSetCompleted,
    deleteSet,
    saveWorkout,
    saveWorkoutChangesToRoutine,
    finishWorkout,
    discardWorkout,
  };
}
