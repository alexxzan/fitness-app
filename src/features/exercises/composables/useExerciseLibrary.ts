import { ref, computed } from 'vue'
import { ExerciseRepository } from '../repositories/exercise.repository'
import type { Exercise, ExerciseCategory, ExerciseFilters } from '../types/exercise.types'

/**
 * Composable for managing exercise library
 */
export function useExerciseLibrary() {
  const exercises = ref<Exercise[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const selectedCategory = ref<ExerciseCategory | undefined>(undefined)

  /**
   * Load all exercises from storage
   */
  async function loadExercises() {
    isLoading.value = true
    error.value = null
    try {
      exercises.value = await ExerciseRepository.getAll()
      // Sort alphabetically by name
      exercises.value.sort((a, b) => a.name.localeCompare(b.name))
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load exercises'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Search exercises with filters
   */
  async function searchExercises(filters: ExerciseFilters) {
    isLoading.value = true
    error.value = null
    try {
      exercises.value = await ExerciseRepository.search(filters)
      exercises.value.sort((a, b) => a.name.localeCompare(b.name))
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to search exercises'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get exercises by category
   */
  async function loadExercisesByCategory(category: ExerciseCategory) {
    isLoading.value = true
    error.value = null
    try {
      exercises.value = await ExerciseRepository.getByCategory(category)
      exercises.value.sort((a, b) => a.name.localeCompare(b.name))
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load exercises'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Filtered exercises based on current search and category
   */
  const filteredExercises = computed(() => {
    let filtered = exercises.value

    if (selectedCategory.value) {
      filtered = filtered.filter(ex => ex.category === selectedCategory.value)
    }

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(query) ||
        ex.description?.toLowerCase().includes(query)
      )
    }

    return filtered
  })

  /**
   * Get all unique categories from exercises
   */
  const categories = computed(() => {
    const cats = new Set<ExerciseCategory>()
    exercises.value.forEach(ex => cats.add(ex.category))
    return Array.from(cats).sort()
  })

  return {
    exercises,
    filteredExercises,
    isLoading,
    error,
    searchQuery,
    selectedCategory,
    categories,
    loadExercises,
    searchExercises,
    loadExercisesByCategory
  }
}

