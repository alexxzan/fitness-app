import { ref, computed, onMounted } from 'vue'
import { LocalStorage } from '@/shared/storage/local-storage'

const FAVORITES_STORAGE_KEY = 'exercise_favorites'

/**
 * Composable for managing exercise favorites
 */
export function useExerciseFavorites() {
  const favoriteIds = ref<string[]>([])
  const isLoading = ref(false)

  /**
   * Load favorites from storage
   */
  async function loadFavorites() {
    isLoading.value = true
    try {
      const stored = await LocalStorage.get<string[]>(FAVORITES_STORAGE_KEY)
      favoriteIds.value = stored || []
    } catch (error) {
      console.error('Failed to load favorites:', error)
      favoriteIds.value = []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Toggle favorite status for an exercise
   */
  async function toggleFavorite(exerciseId: string) {
    try {
      const index = favoriteIds.value.indexOf(exerciseId)
      if (index > -1) {
        favoriteIds.value.splice(index, 1)
      } else {
        favoriteIds.value.push(exerciseId)
      }
      await LocalStorage.set(FAVORITES_STORAGE_KEY, favoriteIds.value)
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      // Revert on error
      await loadFavorites()
    }
  }

  /**
   * Check if an exercise is favorited
   */
  function isFavorite(exerciseId: string): boolean {
    return favoriteIds.value.includes(exerciseId)
  }

  /**
   * Get count of favorites
   */
  const favoritesCount = computed(() => favoriteIds.value.length)

  // Load favorites on mount
  onMounted(() => {
    loadFavorites()
  })

  return {
    favoriteIds,
    isLoading,
    isFavorite,
    favoritesCount,
    loadFavorites,
    toggleFavorite
  }
}

