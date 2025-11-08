import { ref, computed } from "vue";
import { getDatabase } from "@/shared/storage/database-adapter";
import type { CardioSettings } from "../types/cardio.types";

const SETTINGS_KEY = "cardio_settings";

/**
 * Default cardio settings
 */
const defaultSettings: CardioSettings = {
  units: "metric",
  gpsAccuracy: "medium",
  workoutGoals: undefined,
  milestoneNotifications: {
    enabled: true,
    distanceMilestones: [1000, 5000, 10000], // meters
    paceThresholds: undefined,
  },
};

/**
 * Composable for managing cardio settings
 */
export function useCardioSettings() {
  const settings = ref<CardioSettings>({ ...defaultSettings });
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Load settings from storage
   */
  async function loadSettings(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const db = getDatabase();
      const saved = await db.settings.get(SETTINGS_KEY);

      if (saved) {
        settings.value = { ...defaultSettings, ...saved };
      } else {
        settings.value = { ...defaultSettings };
        await saveSettings();
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load settings";
      // Use defaults on error
      settings.value = { ...defaultSettings };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Save settings to storage
   */
  async function saveSettings(): Promise<void> {
    error.value = null;

    try {
      const db = getDatabase();
      await db.settings.set(SETTINGS_KEY, settings.value);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to save settings";
      throw err;
    }
  }

  /**
   * Update a specific setting
   */
  async function updateSetting<K extends keyof CardioSettings>(
    key: K,
    value: CardioSettings[K]
  ): Promise<void> {
    settings.value[key] = value;
    await saveSettings();
  }

  /**
   * Reset settings to defaults
   */
  async function resetSettings(): Promise<void> {
    settings.value = { ...defaultSettings };
    await saveSettings();
  }

  // Computed properties
  const isMetric = computed(() => settings.value.units === "metric");
  const isImperial = computed(() => settings.value.units === "imperial");

  return {
    settings,
    isLoading,
    error,
    loadSettings,
    saveSettings,
    updateSetting,
    resetSettings,
    isMetric,
    isImperial,
  };
}

