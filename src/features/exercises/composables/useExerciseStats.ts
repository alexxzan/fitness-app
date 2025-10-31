import { ref, computed, onMounted } from 'vue'
import { LocalStorage } from '@/shared/storage/local-storage'
import { WorkoutRepository } from '@/features/workouts/repositories/workout.repository'
import type { Exercise } from '../types/exercise.types'

const USAGE_STATS_STORAGE_KEY = 'exercise_usage_stats'
const RECENT_EXERCISES_STORAGE_KEY = 'exercise_recent_viewed'
const MAX_RECENT_EXERCISES = 15

interface ExerciseUsage {
  exerciseId: string
  count: number
  lastUsed?: string
}

interface RecentExercise {
  exerciseId: string
  viewedAt: string
}

/**
 * Composable for tracking exercise usage statistics
 */
export function useExerciseStats() {
  const usageStats = ref<Record<string, ExerciseUsage>>({})
  const recentExercises = ref<RecentExercise[]>([])
  const isLoading = ref(false)

  /**
   * Load usage stats and recent exercises from storage
   */
  async function loadStats() {
    isLoading.value = true
    try {
      const storedStats = await LocalStorage.get<Record<string, ExerciseUsage>>(USAGE_STATS_STORAGE_KEY)
      usageStats.value = storedStats || {}

      const storedRecent = await LocalStorage.get<RecentExercise[]>(RECENT_EXERCISES_STORAGE_KEY)
      recentExercises.value = storedRecent || []
    } catch (error) {
      console.error('Failed to load exercise stats:', error)
      usageStats.value = {}
      recentExercises.value = []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update usage stats from workout history
   */
  async function updateUsageStatsFromWorkouts() {
    try {
      const workouts = await WorkoutRepository.getAll()
      const newStats: Record<string, ExerciseUsage> = {}

      workouts.forEach(workout => {
        workout.exercises.forEach(exercise => {
          if (!newStats[exercise.exerciseId]) {
            newStats[exercise.exerciseId] = {
              exerciseId: exercise.exerciseId,
              count: 0
            }
          }
          newStats[exercise.exerciseId].count++
          if (workout.startTime) {
            const workoutTime = new Date(workout.startTime).toISOString()
            if (!newStats[exercise.exerciseId].lastUsed || workoutTime > newStats[exercise.exerciseId].lastUsed!) {
              newStats[exercise.exerciseId].lastUsed = workoutTime
            }
          }
        })
      })

      usageStats.value = newStats
      await LocalStorage.set(USAGE_STATS_STORAGE_KEY, newStats)
    } catch (error) {
      console.error('Failed to update usage stats:', error)
    }
  }

  /**
   * Track when an exercise is viewed
   */
  async function trackExerciseView(exerciseId: string) {
    try {
      const now = new Date().toISOString()
      
      // Remove existing entry if present
      recentExercises.value = recentExercises.value.filter(
        e => e.exerciseId !== exerciseId
      )

      // Add to beginning
      recentExercises.value.unshift({
        exerciseId,
        viewedAt: now
      })

      // Keep only last MAX_RECENT_EXERCISES
      if (recentExercises.value.length > MAX_RECENT_EXERCISES) {
        recentExercises.value = recentExercises.value.slice(0, MAX_RECENT_EXERCISES)
      }

      await LocalStorage.set(RECENT_EXERCISES_STORAGE_KEY, recentExercises.value)
    } catch (error) {
      console.error('Failed to track exercise view:', error)
    }
  }

  /**
   * Get most used exercises sorted by usage count
   */
  const mostUsedExercises = computed(() => {
    return Object.values(usageStats.value)
      .sort((a, b) => b.count - a.count)
      .slice(0, 20) // Top 20
      .map(stat => stat.exerciseId)
  })

  /**
   * Get recent exercise IDs
   */
  const recentExerciseIds = computed(() => {
    return recentExercises.value.map(e => e.exerciseId)
  })

  /**
   * Get usage count for an exercise
   */
  function getUsageCount(exerciseId: string): number {
    return usageStats.value[exerciseId]?.count || 0
  }

  // Load stats on mount
  onMounted(() => {
    loadStats()
    updateUsageStatsFromWorkouts()
  })

  return {
    usageStats,
    recentExercises,
    isLoading,
    mostUsedExercises,
    recentExerciseIds,
    getUsageCount,
    loadStats,
    updateUsageStatsFromWorkouts,
    trackExerciseView
  }
}

