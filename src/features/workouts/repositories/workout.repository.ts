import { LocalStorage } from '@/shared/storage/local-storage'
import type { Workout, WorkoutRoutine } from '../types/workout.types'

const STORAGE_KEYS = {
  WORKOUTS: 'workouts',
  WORKOUT_ROUTINES: 'workout_routines',
  ACTIVE_WORKOUT: 'active_workout'
}

/**
 * Repository for workout data access
 * Handles CRUD operations for workouts and routines
 */
export class WorkoutRepository {
  /**
   * Get all saved workouts
   */
  static async getAll(): Promise<Workout[]> {
    const workouts = await LocalStorage.get<Workout[]>(STORAGE_KEYS.WORKOUTS)
    return workouts || []
  }

  /**
   * Get a workout by ID
   */
  static async getById(id: string): Promise<Workout | null> {
    const workouts = await this.getAll()
    return workouts.find(w => w.id === id) || null
  }

  /**
   * Save a workout
   */
  static async save(workout: Workout): Promise<void> {
    const workouts = await this.getAll()
    const index = workouts.findIndex(w => w.id === workout.id)
    
    if (index >= 0) {
      workouts[index] = workout
    } else {
      workouts.push(workout)
    }

    await LocalStorage.set(STORAGE_KEYS.WORKOUTS, workouts)
  }

  /**
   * Delete a workout
   */
  static async delete(id: string): Promise<void> {
    const workouts = await this.getAll()
    const filtered = workouts.filter(w => w.id !== id)
    await LocalStorage.set(STORAGE_KEYS.WORKOUTS, filtered)
  }

  /**
   * Get the currently active workout (if any)
   */
  static async getActiveWorkout(): Promise<Workout | null> {
    return await LocalStorage.get<Workout>(STORAGE_KEYS.ACTIVE_WORKOUT)
  }

  /**
   * Set the active workout
   */
  static async setActiveWorkout(workout: Workout | null): Promise<void> {
    if (workout) {
      await LocalStorage.set(STORAGE_KEYS.ACTIVE_WORKOUT, workout)
    } else {
      await LocalStorage.remove(STORAGE_KEYS.ACTIVE_WORKOUT)
    }
  }

  /**
   * Get all workout routines
   */
  static async getAllRoutines(): Promise<WorkoutRoutine[]> {
    const routines = await LocalStorage.get<WorkoutRoutine[]>(STORAGE_KEYS.WORKOUT_ROUTINES)
    return routines || []
  }

  /**
   * Get a routine by ID
   */
  static async getRoutineById(id: string): Promise<WorkoutRoutine | null> {
    const routines = await this.getAllRoutines()
    return routines.find(r => r.id === id) || null
  }

  /**
   * Save a workout routine
   */
  static async saveRoutine(routine: WorkoutRoutine): Promise<void> {
    const routines = await this.getAllRoutines()
    const index = routines.findIndex(r => r.id === routine.id)
    
    if (index >= 0) {
      routines[index] = routine
    } else {
      routines.push(routine)
    }

    await LocalStorage.set(STORAGE_KEYS.WORKOUT_ROUTINES, routines)
  }

  /**
   * Delete a workout routine
   */
  static async deleteRoutine(id: string): Promise<void> {
    const routines = await this.getAllRoutines()
    const filtered = routines.filter(r => r.id !== id)
    await LocalStorage.set(STORAGE_KEYS.WORKOUT_ROUTINES, filtered)
  }
}

