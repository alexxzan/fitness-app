import { ref, computed } from "vue";
import { NutritionTargetsRepository } from "../repositories/nutrition-targets.repository";
import { CoachingService } from "../services/coaching.service";
import type { NutritionTarget, MacroTargets } from "../types/nutrition.types";
import type { CoachingSetting } from "../types/coaching.types";

/**
 * Composable for managing nutrition targets
 */
export function useNutritionTargets() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const activeTarget = ref<NutritionTarget | null>(null);

  /**
   * Load the active nutrition target
   */
  async function loadActiveTarget(): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      activeTarget.value = await NutritionTargetsRepository.getActive();
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load nutrition target";
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Create a new nutrition target from coaching settings
   */
  async function createTargetFromSettings(settings: CoachingSetting): Promise<NutritionTarget> {
    isLoading.value = true;
    error.value = null;
    try {
      const macroTargets = CoachingService.calculateMacroTargetsFromSettings(settings);
      if (!macroTargets) {
        throw new Error("Unable to calculate macro targets from settings");
      }

      const target = await NutritionTargetsRepository.replaceActive({
        calories: macroTargets.calories,
        protein: macroTargets.protein,
        carbs: macroTargets.carbs,
        fats: macroTargets.fats,
        startDate: new Date().toISOString(),
        goalType: settings.activityLevel as "cutting" | "bulking" | "maintenance",
      });

      await loadActiveTarget(); // Refresh active target
      return target;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to create nutrition target";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Create a custom nutrition target
   */
  async function createCustomTarget(targetData: Omit<NutritionTarget, "id" | "userId" | "createdAt" | "updatedAt" | "endDate">): Promise<NutritionTarget> {
    isLoading.value = true;
    error.value = null;
    try {
      const target = await NutritionTargetsRepository.replaceActive(targetData);
      await loadActiveTarget(); // Refresh active target
      return target;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to create nutrition target";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update the active nutrition target
   */
  async function updateActiveTarget(updates: Partial<Omit<NutritionTarget, "id" | "userId" | "createdAt">>): Promise<void> {
    if (!activeTarget.value) {
      throw new Error("No active target to update");
    }
    isLoading.value = true;
    error.value = null;
    try {
      await NutritionTargetsRepository.update(activeTarget.value.id, updates);
      await loadActiveTarget(); // Refresh active target
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to update nutrition target";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get macro targets as a simple object
   */
  const macroTargets = computed((): MacroTargets | null => {
    if (!activeTarget.value) {
      return null;
    }
    return {
      calories: activeTarget.value.calories,
      protein: activeTarget.value.protein,
      carbs: activeTarget.value.carbs,
      fats: activeTarget.value.fats,
    };
  });

  return {
    isLoading,
    error,
    activeTarget,
    macroTargets,
    loadActiveTarget,
    createTargetFromSettings,
    createCustomTarget,
    updateActiveTarget,
  };
}

