import { ref, computed } from "vue";
import { CardioRepository } from "../repositories/cardio.repository";
import type {
  CardioWorkoutStats,
  CardioPeriodStats,
} from "../types/cardio.types";

/**
 * Composable for cardio analytics and trends
 */
export function useCardioAnalytics() {
  const overallStats = ref<CardioWorkoutStats | null>(null);
  const weeklyStats = ref<CardioPeriodStats | null>(null);
  const monthlyStats = ref<CardioPeriodStats | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Load overall statistics
   */
  async function loadOverallStats(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      overallStats.value = await CardioRepository.getOverallStats();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load statistics";
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Load weekly statistics
   */
  async function loadWeeklyStats(weekStartDate: Date): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      weeklyStats.value = await CardioRepository.getWeeklyStats(weekStartDate);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load weekly statistics";
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Load monthly statistics
   */
  async function loadMonthlyStats(monthStartDate: Date): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      monthlyStats.value =
        await CardioRepository.getMonthlyStats(monthStartDate);
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to load monthly statistics";
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get total distance
   */
  const totalDistance = computed(() => {
    return overallStats.value?.totalDistance || 0;
  });

  /**
   * Get average pace
   */
  const averagePace = computed(() => {
    return overallStats.value?.averagePace || 0;
  });

  /**
   * Get total workouts
   */
  const totalWorkouts = computed(() => {
    return overallStats.value?.workoutCount || 0;
  });

  /**
   * Get total calories
   */
  const totalCalories = computed(() => {
    return overallStats.value?.totalCalories || 0;
  });

  return {
    overallStats,
    weeklyStats,
    monthlyStats,
    isLoading,
    error,
    totalDistance,
    averagePace,
    totalWorkouts,
    totalCalories,
    loadOverallStats,
    loadWeeklyStats,
    loadMonthlyStats,
  };
}

