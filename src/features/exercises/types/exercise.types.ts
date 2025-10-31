/**
 * Exercise-related TypeScript types and interfaces
 */

export type ExerciseCategory = 
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'legs'
  | 'core'
  | 'cardio'
  | 'full-body'
  | 'other'

export interface Exercise {
  id: string
  name: string
  category: ExerciseCategory
  description?: string
  muscleGroups?: string[]
  equipment?: string[]
  instructions?: string[]
  createdAt: Date | string
  updatedAt: Date | string
}

export interface ExerciseFilters {
  category?: ExerciseCategory
  searchQuery?: string
  muscleGroup?: string
  equipment?: string
}

