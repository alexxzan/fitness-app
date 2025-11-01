import { getDatabase } from "@/shared/storage/database-adapter";
import type { Workout, WorkoutRoutine } from "../types/workout.types";

/**
 * Repository for workout data access using database adapter
 * Works with both Dexie (web) and SQLite (native)
 */
export class WorkoutRepository {
  /**
   * Get all saved workouts
   */
  static async getAll(): Promise<Workout[]> {
    const db = getDatabase();
    return await db.workouts.getAll();
  }

  /**
   * Get a workout by ID
   */
  static async getById(id: string): Promise<Workout | null> {
    const db = getDatabase();
    return await db.workouts.getById(id);
  }

  /**
   * Save a workout (create or update)
   */
  static async save(workout: Workout): Promise<string> {
    const db = getDatabase();
    return await db.workouts.save(workout);
  }

  /**
   * Delete a workout
   */
  static async delete(id: string): Promise<void> {
    const db = getDatabase();
    await db.workouts.delete(id);
  }

  /**
   * Get the currently active workout (if any)
   * Active workout is identified by having no endTime
   */
  static async getActiveWorkout(): Promise<Workout | null> {
    const db = getDatabase();
    return await db.workouts.getActive();
  }

  /**
   * Set the active workout by marking it as incomplete
   */
  static async setActiveWorkout(workout: Workout | null): Promise<void> {
    if (workout) {
      workout.endTime = undefined;
      await this.save(workout);
    }
  }

  /**
   * Get all workout routines
   */
  static async getAllRoutines(): Promise<WorkoutRoutine[]> {
    const db = getDatabase();
    return await db.routines.getAll();
  }

  /**
   * Get a routine by ID
   */
  static async getRoutineById(id: string): Promise<WorkoutRoutine | null> {
    const db = getDatabase();
    return await db.routines.getById(id);
  }

  /**
   * Save a workout routine
   */
  static async saveRoutine(routine: WorkoutRoutine): Promise<string> {
    const db = getDatabase();
    return await db.routines.save(routine);
  }

  /**
   * Delete a workout routine
   */
  static async deleteRoutine(id: string): Promise<void> {
    const db = getDatabase();
    await db.routines.delete(id);
  }

  /**
   * Search workouts by name
   */
  static async searchByName(query: string): Promise<Workout[]> {
    const db = getDatabase();
    return await db.workouts.searchByName(query);
  }
}

