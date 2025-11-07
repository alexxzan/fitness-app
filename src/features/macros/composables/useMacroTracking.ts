/**
 * Composable for macro tracking functionality
 * Manages user profile, macro plan, and daily tracking
 */

import { ref, computed, onMounted } from "vue";
import { MacroRepository } from "../repositories/macro.repository";
import { calculateMacros } from "../services/macro.calculator";
import type {
  UserProfile,
  MacroPlan,
  FoodLog,
  DailyMacroSummary,
  MealType,
  WaterLog,
} from "../types/macro.types";

export function useMacroTracking() {
  const userProfile = ref<UserProfile | null>(null);
  const macroPlan = ref<MacroPlan | null>(null);
  const foodLogs = ref<FoodLog[]>([]);
  const waterLogs = ref<WaterLog[]>([]);
  const selectedDate = ref<string>(new Date().toISOString().split("T")[0]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Check if user has completed questionnaire
   */
  const hasProfile = computed(() => userProfile.value !== null);

  /**
   * Check if macro plan exists
   */
  const hasMacroPlan = computed(() => macroPlan.value !== null);

  /**
   * Load user profile
   */
  async function loadProfile() {
    try {
      isLoading.value = true;
      error.value = null;
      userProfile.value = await MacroRepository.getUserProfile();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load profile";
      console.error("Error loading profile:", err);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Save user profile and calculate macro plan
   */
  async function saveProfile(profile: UserProfile) {
    try {
      isLoading.value = true;
      error.value = null;
      await MacroRepository.saveUserProfile(profile);
      userProfile.value = profile;

      // Calculate and save macro plan
      const plan = calculateMacros(profile);
      await MacroRepository.saveMacroPlan(plan);
      macroPlan.value = plan;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to save profile";
      console.error("Error saving profile:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Load macro plan
   */
  async function loadMacroPlan() {
    try {
      isLoading.value = true;
      error.value = null;
      macroPlan.value = await MacroRepository.getMacroPlan();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load macro plan";
      console.error("Error loading macro plan:", err);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update macro plan manually
   */
  async function updateMacroPlan(plan: MacroPlan) {
    try {
      isLoading.value = true;
      error.value = null;
      await MacroRepository.saveMacroPlan(plan);
      macroPlan.value = plan;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update macro plan";
      console.error("Error updating macro plan:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Load food logs for selected date
   */
  async function loadFoodLogs(date?: string) {
    try {
      isLoading.value = true;
      error.value = null;
      const targetDate = date || selectedDate.value;
      foodLogs.value = await MacroRepository.getFoodLogs(targetDate);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load food logs";
      console.error("Error loading food logs:", err);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Add food log
   */
  async function addFoodLog(log: Omit<FoodLog, "id" | "createdAt">) {
    try {
      isLoading.value = true;
      error.value = null;
      await MacroRepository.addFoodLog(log);
      await loadFoodLogs();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to add food log";
      console.error("Error adding food log:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update food log
   */
  async function updateFoodLog(id: string, updates: Partial<FoodLog>) {
    try {
      isLoading.value = true;
      error.value = null;
      await MacroRepository.updateFoodLog(id, updates);
      await loadFoodLogs();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update food log";
      console.error("Error updating food log:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Delete food log
   */
  async function deleteFoodLog(id: string) {
    try {
      isLoading.value = true;
      error.value = null;
      await MacroRepository.deleteFoodLog(id);
      await loadFoodLogs();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete food log";
      console.error("Error deleting food log:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Load water logs for selected date
   */
  async function loadWaterLogs(date?: string) {
    try {
      isLoading.value = true;
      error.value = null;
      const targetDate = date || selectedDate.value;
      waterLogs.value = await MacroRepository.getWaterLogs(targetDate);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load water logs";
      console.error("Error loading water logs:", err);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Add water log
   */
  async function addWaterLog(amount: number) {
    try {
      isLoading.value = true;
      error.value = null;
      const date = selectedDate.value;
      await MacroRepository.addWaterLog({
        date,
        amount,
        timestamp: new Date().toISOString(),
      });
      await loadWaterLogs();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to add water log";
      console.error("Error adding water log:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Delete water log
   */
  async function deleteWaterLog(id: string) {
    try {
      isLoading.value = true;
      error.value = null;
      await MacroRepository.deleteWaterLog(id);
      await loadWaterLogs();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete water log";
      console.error("Error deleting water log:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Calculate daily macro summary
   */
  const dailySummary = computed<DailyMacroSummary | null>(() => {
    if (!macroPlan.value) return null;

    const consumed = foodLogs.value.reduce(
      (acc, log) => ({
        calories: acc.calories + log.calories,
        protein: acc.protein + log.protein,
        carbs: acc.carbs + log.carbs,
        fats: acc.fats + log.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    const waterConsumed = waterLogs.value.reduce(
      (sum, log) => sum + log.amount,
      0
    );

    const target = {
      calories: macroPlan.value.dailyCalories,
      protein: macroPlan.value.protein,
      carbs: macroPlan.value.carbs,
      fats: macroPlan.value.fats,
    };

    const remaining = {
      calories: Math.max(0, target.calories - consumed.calories),
      protein: Math.max(0, target.protein - consumed.protein),
      carbs: Math.max(0, target.carbs - consumed.carbs),
      fats: Math.max(0, target.fats - consumed.fats),
    };

    return {
      date: selectedDate.value,
      consumed,
      target,
      remaining,
      waterConsumed,
      waterGoal: macroPlan.value.waterGoal,
    };
  });

  /**
   * Get food logs grouped by meal type
   */
  const foodLogsByMeal = computed(() => {
    const grouped: Record<MealType, FoodLog[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };

    foodLogs.value.forEach((log) => {
      grouped[log.mealType].push(log);
    });

    return grouped;
  });

  /**
   * Set selected date and reload data
   */
  async function setSelectedDate(date: string) {
    selectedDate.value = date;
    await Promise.all([loadFoodLogs(date), loadWaterLogs(date)]);
  }

  /**
   * Initialize - load all data
   */
  async function initialize() {
    await Promise.all([
      loadProfile(),
      loadMacroPlan(),
      loadFoodLogs(),
      loadWaterLogs(),
    ]);
  }

  // Initialize on mount - use nextTick to ensure DOM is ready
  onMounted(async () => {
    await initialize();
  });

  return {
    // State
    userProfile,
    macroPlan,
    foodLogs,
    waterLogs,
    selectedDate,
    isLoading,
    error,
    hasProfile,
    hasMacroPlan,
    dailySummary,
    foodLogsByMeal,

    // Methods
    loadProfile,
    saveProfile,
    loadMacroPlan,
    updateMacroPlan,
    loadFoodLogs,
    addFoodLog,
    updateFoodLog,
    deleteFoodLog,
    loadWaterLogs,
    addWaterLog,
    deleteWaterLog,
    setSelectedDate,
    initialize,
  };
}
