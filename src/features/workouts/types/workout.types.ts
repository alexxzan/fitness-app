/**
 * Workout-related TypeScript types and interfaces
 */

export interface WorkoutSet {
  id: string
  reps?: number
  weight?: number // in kg
  restTime?: number // in seconds
  completed: boolean
  notes?: string
}

export interface WorkoutExercise {
  id: string
  exerciseId: string
  exerciseName: string
  sets: WorkoutSet[]
  notes?: string
  order: number
}

export interface Workout {
  id: string
  name: string
  exercises: WorkoutExercise[]
  startTime?: Date | string
  endTime?: Date | string
  notes?: string
  createdAt: Date | string
  updatedAt: Date | string
}

export interface WorkoutRoutine {
  id: string
  name: string
  description?: string
  exercises: Omit<WorkoutExercise, 'sets'>[] // Routine exercises without completed sets
  createdAt: Date | string
  updatedAt: Date | string
}

export interface WorkoutStatistics {
  totalVolume: number // Total weight lifted
  totalSets: number
  totalReps: number
  duration: number // in minutes
  exercisesCount: number
}

