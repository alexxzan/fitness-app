import { ref, computed } from 'vue'
import { WorkoutRepository } from '../repositories/workout.repository'
import type { Workout } from '../types/workout.types'
import type { PreviousExercisePerformance } from '../types/workout.types'

/**
 * Composable for fetching previous exercise performance from workout history
 */
export function usePreviousExercisePerformance() {
  const workoutHistory = ref<Workout[]>([])
  const isLoading = ref(false)
  const performanceCache = ref<Record<string, PreviousExercisePerformance>>({})

  /**
   * Load workout history (completed workouts only)
   */
  async function loadWorkoutHistory() {
    if (workoutHistory.value.length > 0) return // Already loaded
    
    isLoading.value = true
    try {
      workoutHistory.value = await WorkoutRepository.getWorkoutHistory()
    } catch (error) {
      console.error('Failed to load workout history:', error)
      workoutHistory.value = []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get the most recent performance for an exercise
   * Returns the last completed set's data for the exercise
   */
  function getPreviousPerformance(exerciseId: string): PreviousExercisePerformance | null {
    // Check cache first
    if (performanceCache.value[exerciseId]) {
      return performanceCache.value[exerciseId]
    }

    // Find most recent workout containing this exercise
    for (const workout of workoutHistory.value) {
      const exercise = workout.exercises.find(
        (ex) => ex.exerciseId === exerciseId
      )

      if (!exercise) continue

      // Find the last completed set
      const completedSets = exercise.sets.filter((set) => set.completed)
      
      if (completedSets.length === 0) continue

      // Get the last completed set (assuming sets are in order)
      const lastSet = completedSets[completedSets.length - 1]

      const performance: PreviousExercisePerformance = {
        weight: lastSet.weight,
        reps: lastSet.reps,
        setType: lastSet.setType || 'working',
        performedAt: workout.startTime,
      }

      // Cache the result
      performanceCache.value[exerciseId] = performance
      return performance
    }

    return null
  }

  /**
   * Get previous performance for multiple exercises (batch)
   */
  function getPreviousPerformances(exerciseIds: string[]): Record<string, PreviousExercisePerformance | null> {
    const result: Record<string, PreviousExercisePerformance | null> = {}
    
    for (const exerciseId of exerciseIds) {
      result[exerciseId] = getPreviousPerformance(exerciseId)
    }

    return result
  }

  /**
   * Clear the performance cache
   */
  function clearCache() {
    performanceCache.value = {}
  }

  return {
    workoutHistory,
    isLoading,
    loadWorkoutHistory,
    getPreviousPerformance,
    getPreviousPerformances,
    clearCache,
  }
}
