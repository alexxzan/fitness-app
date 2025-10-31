import { ref } from 'vue'
import { ExerciseRepository } from '../repositories/exercise.repository'
import type { Exercise } from '../types/exercise.types'
import { generateId } from '@/shared/utils/id'

/**
 * Composable for managing individual exercise operations
 */
export function useExercise() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Create a new exercise
   */
  async function createExercise(exercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>): Promise<Exercise> {
    isLoading.value = true
    error.value = null
    try {
      const newExercise: Exercise = {
        ...exercise,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      await ExerciseRepository.save(newExercise)
      return newExercise
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create exercise'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an exercise
   */
  async function updateExercise(exercise: Exercise): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const updatedExercise: Exercise = {
        ...exercise,
        updatedAt: new Date().toISOString()
      }
      await ExerciseRepository.save(updatedExercise)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update exercise'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete an exercise
   */
  async function deleteExercise(id: string): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      await ExerciseRepository.delete(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete exercise'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get an exercise by ID
   */
  async function getExerciseById(id: string): Promise<Exercise | null> {
    isLoading.value = true
    error.value = null
    try {
      return await ExerciseRepository.getById(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load exercise'
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    createExercise,
    updateExercise,
    deleteExercise,
    getExerciseById
  }
}

