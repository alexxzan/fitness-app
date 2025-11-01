import type { Exercise } from '@/features/exercises/types/exercise.types'
import type { WorkoutTemplate } from '../types/workout.types'

/**
 * Normalize exercise name for matching
 * Removes extra spaces, converts to lowercase, and handles common variations
 */
function normalizeExerciseName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/barbell|bb/gi, 'barbell')
    .replace(/dumbbell|db|dumbell/gi, 'dumbbell')
    .replace(/cable|machine/gi, '')
}

/**
 * Check if two exercise names match (with fuzzy matching)
 */
function exerciseNamesMatch(templateName: string, exerciseName: string): boolean {
  const normalizedTemplate = normalizeExerciseName(templateName)
  const normalizedExercise = normalizeExerciseName(exerciseName)

  // Exact match after normalization
  if (normalizedTemplate === normalizedExercise) {
    return true
  }

  // Check if template name is contained in exercise name
  if (normalizedExercise.includes(normalizedTemplate)) {
    return true
  }

  // Check if exercise name is contained in template name
  if (normalizedTemplate.includes(normalizedExercise)) {
    return true
  }

  // Check for common variations
  const templateWords = normalizedTemplate.split(' ')
  const exerciseWords = normalizedExercise.split(' ')

  // If most words match, consider it a match
  const matchingWords = templateWords.filter(word =>
    exerciseWords.some(exWord => exWord.includes(word) || word.includes(exWord))
  )

  return matchingWords.length >= Math.max(2, templateWords.length * 0.7)
}

/**
 * Match exercise names from a template to exercises in the library
 * Returns an array of matched exercises with their exerciseIds
 */
export function matchTemplateExercises(
  template: WorkoutTemplate,
  exercises: Exercise[],
  workoutIndex?: number
): Array<{ exerciseId: string; exerciseName: string; targetSets?: number; targetReps?: string }> {
  const matchedExercises: Array<{
    exerciseId: string
    exerciseName: string
    targetSets?: number
    targetReps?: string
  }> = []

  // If workoutIndex is specified, only match exercises from that workout
  // Otherwise, match all exercises from all workouts
  const workoutsToProcess = workoutIndex !== undefined 
    ? [template.workouts[workoutIndex]].filter(Boolean)
    : template.workouts

  for (const workout of workoutsToProcess) {
    for (const templateExercise of workout.exercises) {
      // Try to find exact or fuzzy match
      const matched = exercises.find(ex =>
        exerciseNamesMatch(templateExercise.exerciseName, ex.name)
      )

      if (matched) {
        matchedExercises.push({
          exerciseId: matched.exerciseId,
          exerciseName: matched.name,
          targetSets: templateExercise.targetSets,
          targetReps: templateExercise.targetReps,
        })
      } else {
        // Log warning for unmatched exercises
        console.warn(
          `Could not find exercise "${templateExercise.exerciseName}" in exercise library for template "${template.name}"`
        )
      }
    }
  }

  return matchedExercises
}

