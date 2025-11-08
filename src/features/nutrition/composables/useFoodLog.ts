import { ref, computed } from "vue";
import { FoodLogRepository } from "../repositories/food-log.repository";
import { FoodRepository } from "../repositories/food.repository";
import type { FoodLog, Food, NutritionData } from "../types/food.types";

/**
 * Composable for managing food logging operations
 */
export function useFoodLog() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const todayLogs = ref<FoodLog[]>([]);

  /**
   * Load today's food logs
   */
  async function loadTodayLogs(): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      todayLogs.value = await FoodLogRepository.getToday();
      await calculateTodayNutrition();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load food logs";
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Log a food entry
   */
  async function logFood(
    foodId: string,
    quantity: number,
    mealType?: "breakfast" | "lunch" | "dinner" | "snack"
  ): Promise<FoodLog> {
    isLoading.value = true;
    error.value = null;
    try {
      const date = new Date().toISOString().split("T")[0];
      const foodLog = await FoodLogRepository.create({
        foodId,
        date,
        quantity,
        mealType,
      });
      await loadTodayLogs(); // Refresh today's logs (includes nutrition calculation)
      return foodLog;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to log food";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update a food log entry
   */
  async function updateFoodLog(
    id: string,
    updates: Partial<Pick<FoodLog, "quantity" | "mealType">>
  ): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      await FoodLogRepository.update(id, updates);
      await loadTodayLogs(); // Refresh today's logs
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update food log";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Delete a food log entry
   */
  async function deleteFoodLog(id: string): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      await FoodLogRepository.delete(id);
      await loadTodayLogs(); // Refresh today's logs
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete food log";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get today's nutrition summary (reactive)
   */
  const todayNutrition = ref<NutritionData>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });

  async function calculateTodayNutrition() {
    const logs = todayLogs.value;
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fats = 0;

    for (const log of logs) {
      const food = await FoodRepository.getById(log.foodId);
      if (food) {
        const multiplier = log.quantity;
        calories += food.calories * multiplier;
        protein += food.protein * multiplier;
        carbs += food.carbs * multiplier;
        fats += food.fats * multiplier;
      }
    }

    todayNutrition.value = { calories, protein, carbs, fats };
  }

  /**
   * Get food logs with food details
   */
  const todayLogsWithFoods = computed(
    async (): Promise<Array<FoodLog & { food: Food | null }>> => {
      const logs = todayLogs.value;
      const logsWithFoods = await Promise.all(
        logs.map(async (log) => {
          const food = await FoodRepository.getById(log.foodId);
          return { ...log, food };
        })
      );
      return logsWithFoods;
    }
  );

  return {
    isLoading,
    error,
    todayLogs,
    todayNutrition,
    todayLogsWithFoods,
    loadTodayLogs,
    logFood,
    updateFoodLog,
    deleteFoodLog,
    calculateTodayNutrition,
  };
}
