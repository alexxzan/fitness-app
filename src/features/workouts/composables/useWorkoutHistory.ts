import { ref, computed } from 'vue'
import { WorkoutRepository } from '../repositories/workout.repository'
import type { Workout } from '../types/workout.types'

/**
 * Composable for managing workout history
 */
export function useWorkoutHistory() {
  const workouts = ref<Workout[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')

  /**
   * Load all workouts from storage
   */
  async function loadWorkouts() {
    isLoading.value = true
    error.value = null
    try {
      workouts.value = await WorkoutRepository.getAll()
      // Sort by creation date, newest first
      workouts.value.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return dateB - dateA
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load workouts'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a workout
   */
  async function deleteWorkout(id: string) {
    isLoading.value = true
    error.value = null
    try {
      await WorkoutRepository.delete(id)
      workouts.value = workouts.value.filter(w => w.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete workout'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get a workout by ID
   */
  async function getWorkoutById(id: string): Promise<Workout | null> {
    isLoading.value = true
    error.value = null
    try {
      return await WorkoutRepository.getById(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load workout'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Filtered workouts based on search query
   */
  const filteredWorkouts = computed(() => {
    if (!searchQuery.value) {
      return workouts.value
    }

    const query = searchQuery.value.toLowerCase()
    return workouts.value.filter(workout =>
      workout.name.toLowerCase().includes(query) ||
      workout.exercises.some(ex => ex.exerciseName.toLowerCase().includes(query))
    )
  })

  return {
    workouts,
    filteredWorkouts,
    isLoading,
    error,
    searchQuery,
    loadWorkouts,
    deleteWorkout,
    getWorkoutById
  }
}

