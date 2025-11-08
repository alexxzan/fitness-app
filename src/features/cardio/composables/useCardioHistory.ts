import { ref, computed } from "vue";
import { CardioRepository } from "../repositories/cardio.repository";
import type { Workout } from "@/features/workouts/types/workout.types";

/**
 * Composable for cardio workout history queries
 */
export function useCardioHistory() {
  const history = ref<Workout[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Load workout history
   */
  async function loadHistory(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      history.value = await CardioRepository.getHistory();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load history";
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get a workout by ID
   */
  async function getWorkoutById(id: string): Promise<Workout | null> {
    try {
      return await CardioRepository.getById(id);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load workout";
      return null;
    }
  }

  /**
   * Delete a workout
   */
  async function deleteWorkout(id: string): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      await CardioRepository.delete(id);
      // Reload history
      await loadHistory();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete workout";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get recent workouts
   */
  async function getRecentWorkouts(limit: number = 10): Promise<Workout[]> {
    try {
      return await CardioRepository.getRecentWorkouts(limit);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load recent workouts";
      return [];
    }
  }

  // Computed properties
  const hasHistory = computed(() => history.value.length > 0);
  const totalWorkouts = computed(() => history.value.length);

  return {
    history,
    isLoading,
    error,
    hasHistory,
    totalWorkouts,
    loadHistory,
    getWorkoutById,
    deleteWorkout,
    getRecentWorkouts,
  };
}

