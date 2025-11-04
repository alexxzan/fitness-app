import { ref, watch } from "vue";
import { LocalStorage } from "@/shared/storage/local-storage";

const VIEW_PREFERENCES_KEY = "exercise_view_preferences";

type ViewMode = "grid" | "list";
type BrowseTab = "all" | "favorites" | "recent" | "mostUsed" | "bodyParts";

interface ViewPreferences {
  viewMode: ViewMode;
  activeTab: BrowseTab;
  sortBy: "alphabetical" | "recentlyAdded" | "mostUsed" | "recentlyViewed";
}

const defaultPreferences: ViewPreferences = {
  viewMode: "list",
  activeTab: "all",
  sortBy: "alphabetical",
};

/**
 * Composable for managing exercise view state and preferences
 */
export function useExerciseViews() {
  const viewMode = ref<ViewMode>(defaultPreferences.viewMode);
  const activeTab = ref<BrowseTab>(defaultPreferences.activeTab);
  const sortBy = ref<ViewPreferences["sortBy"]>(defaultPreferences.sortBy);

  /**
   * Load view preferences from storage
   */
  async function loadPreferences() {
    try {
      const stored = await LocalStorage.get<ViewPreferences>(
        VIEW_PREFERENCES_KEY
      );
      if (stored) {
        viewMode.value = stored.viewMode || defaultPreferences.viewMode;
        activeTab.value = stored.activeTab || defaultPreferences.activeTab;
        sortBy.value = stored.sortBy || defaultPreferences.sortBy;
      }
    } catch (error) {
      console.error("Failed to load view preferences:", error);
    }
  }

  /**
   * Save view preferences to storage
   */
  async function savePreferences() {
    try {
      await LocalStorage.set(VIEW_PREFERENCES_KEY, {
        viewMode: viewMode.value,
        activeTab: activeTab.value,
        sortBy: sortBy.value,
      });
    } catch (error) {
      console.error("Failed to save view preferences:", error);
    }
  }

  /**
   * Set view mode
   */
  function setViewMode(mode: ViewMode) {
    viewMode.value = mode;
    savePreferences();
  }

  /**
   * Set active tab
   */
  function setActiveTab(tab: BrowseTab) {
    activeTab.value = tab;
    savePreferences();
  }

  /**
   * Set sort order
   */
  function setSortBy(sort: ViewPreferences["sortBy"]) {
    sortBy.value = sort;
    savePreferences();
  }

  // Load preferences on initialization
  loadPreferences();

  return {
    viewMode,
    activeTab,
    sortBy,
    setViewMode,
    setActiveTab,
    setSortBy,
    loadPreferences,
  };
}
