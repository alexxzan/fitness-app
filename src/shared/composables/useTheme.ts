import { ref, onMounted, watch } from "vue";
import { LocalStorage } from "@/shared/storage/local-storage";

const THEME_KEY = "app_theme";
type Theme = "light" | "dark" | "system";

/**
 * Composable for managing app theme (light/dark mode)
 */
export function useTheme() {
  const theme = ref<Theme>("system");
  const isDark = ref(false);

  /**
   * Get system preference for dark mode
   */
  function getSystemPreference(): boolean {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  /**
   * Apply theme to document
   * Note: Ionic's dark.class.css requires the .ion-palette-dark class on the html element
   */
  function applyTheme(newTheme: Theme) {
    if (typeof document === "undefined") return;
    
    const html = document.documentElement;
    
    // Remove existing theme class (Ionic uses .ion-palette-dark, not .dark)
    html.classList.remove("ion-palette-dark");

    if (newTheme === "system") {
      // Use system preference
      isDark.value = getSystemPreference();
      if (isDark.value) {
        html.classList.add("ion-palette-dark");
      }
      // When light, no class is needed (defaults to light)
    } else if (newTheme === "dark") {
      isDark.value = true;
      html.classList.add("ion-palette-dark");
    } else {
      isDark.value = false;
      // When light, no class is needed (defaults to light)
    }

    theme.value = newTheme;
  }

  /**
   * Set theme
   */
  async function setTheme(newTheme: Theme) {
    applyTheme(newTheme);
    try {
      await LocalStorage.set(THEME_KEY, newTheme);
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  }

  /**
   * Toggle between light and dark (skipping system)
   */
  async function toggleTheme() {
    const currentIsDark = isDark.value;
    await setTheme(currentIsDark ? "light" : "dark");
  }

  /**
   * Load theme from storage
   */
  async function loadTheme() {
    try {
      const stored = await LocalStorage.get<Theme>(THEME_KEY);
      if (stored && (stored === "light" || stored === "dark" || stored === "system")) {
        applyTheme(stored);
      } else {
        // Default to system preference
        applyTheme("system");
      }
    } catch (error) {
      console.error("Failed to load theme preference:", error);
      applyTheme("system");
    }
  }

  // Watch for system preference changes when theme is set to "system"
  if (typeof window !== "undefined") {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme.value === "system") {
        applyTheme("system");
      }
    };
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }
  }

  // Initialize theme on mount (can also be called manually)
  onMounted(() => {
    loadTheme();
  });

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
    loadTheme,
  };
}

