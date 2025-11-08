import { ref, computed } from "vue";
import { MicronutrientCalculatorService } from "../services/micronutrient-calculator.service";
import { FoodLogRepository } from "../repositories/food-log.repository";
import type { MicronutrientValues, MicronutrientSummary } from "../types/micronutrients.types";

/**
 * Composable for micronutrient tracking
 */
export function useMicronutrients() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const dailyValues = ref<MicronutrientValues>({});
  const dailyPercentages = ref<Record<string, number>>({});

  /**
   * Calculate micronutrients for a specific date
   */
  async function calculateForDate(date: string): Promise<MicronutrientSummary> {
    isLoading.value = true;
    error.value = null;
    try {
      const foodLogs = await FoodLogRepository.getByDate(date);
      const values = await MicronutrientCalculatorService.calculateTotals(foodLogs);
      const percentages = MicronutrientCalculatorService.calculateDailyValuePercentages(values);

      dailyValues.value = values;
      dailyPercentages.value = percentages;

      return {
        date,
        values,
        percentages,
      };
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to calculate micronutrients";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Calculate micronutrients for today
   */
  async function calculateToday(): Promise<MicronutrientSummary> {
    const today = new Date().toISOString().split("T")[0];
    return await calculateForDate(today);
  }

  /**
   * Get micronutrient value by name
   */
  const getValue = computed(() => (name: keyof MicronutrientValues): number | undefined => {
    return dailyValues.value[name];
  });

  /**
   * Get micronutrient percentage by name
   */
  const getPercentage = computed(() => (name: string): number => {
    return dailyPercentages.value[name] || 0;
  });

  return {
    isLoading,
    error,
    dailyValues,
    dailyPercentages,
    calculateForDate,
    calculateToday,
    getValue,
    getPercentage,
  };
}

