import { WorkoutRepository } from '../repositories/workout.repository'
import type { Workout } from '../types/workout.types'

/**
 * Debug utility for inspecting workout data in the database
 */
export async function debugWorkoutData() {
  console.log('=== WORKOUT DEBUG ===')
  
  // Get all workouts
  const allWorkouts = await WorkoutRepository.getAll()
  console.log(`Total workouts in DB: ${allWorkouts.length}`)
  
  // Get completed workouts
  const completedWorkouts = await WorkoutRepository.getWorkoutHistory()
  console.log(`Completed workouts: ${completedWorkouts.length}`)
  
  // Inspect each completed workout
  completedWorkouts.forEach((workout, index) => {
    console.log(`\n--- Workout ${index + 1}: ${workout.name} ---`)
    console.log(`ID: ${workout.id}`)
    console.log(`Completed: ${workout.completed}`)
    console.log(`EndTime: ${workout.endTime}`)
    console.log(`Exercises: ${workout.exercises.length}`)
    
    workout.exercises.forEach((exercise, exIndex) => {
      console.log(`  Exercise ${exIndex + 1}: ${exercise.exerciseName} (ID: ${exercise.exerciseId})`)
      console.log(`    Sets: ${exercise.sets.length}`)
      
      exercise.sets.forEach((set, setIndex) => {
        const hasData = set.weight !== undefined || set.reps !== undefined
        const hasCompleted = set.completed
        console.log(`      Set ${setIndex + 1}: completed=${hasCompleted}, weight=${set.weight ?? 'N/A'}, reps=${set.reps ?? 'N/A'}, hasData=${hasData}`)
        
        // Show full set object for debugging
        if (hasData || hasCompleted) {
          console.log(`        Full set:`, JSON.stringify(set, null, 2))
        }
      })
    })
  })
  
  // Find a specific exercise across all workouts
  const benchPressId = 'EIeI8Vf' // Barbell bench press
  console.log(`\n=== Searching for exercise ID: ${benchPressId} ===`)
  
  let foundCount = 0
  completedWorkouts.forEach((workout) => {
    const exercise = workout.exercises.find(ex => ex.exerciseId === benchPressId)
    if (exercise) {
      foundCount++
      console.log(`\nFound in workout: ${workout.name}`)
      console.log(`  Exercise sets: ${exercise.sets.length}`)
      exercise.sets.forEach((set, idx) => {
        console.log(`    Set ${idx + 1}:`, {
          completed: set.completed,
          weight: set.weight,
          reps: set.reps,
          id: set.id
        })
      })
    }
  })
  
  console.log(`\nTotal workouts with this exercise: ${foundCount}`)
  console.log('=== END DEBUG ===')
}

// Expose globally for debugging
if (typeof window !== 'undefined') {
  (window as any).debugWorkouts = debugWorkoutData
}

