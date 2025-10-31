import { db } from "@/shared/storage/database";
import type { Workout, WorkoutRoutine } from "../types/workout.types";

/**
 * Repository for workout data access using Dexie.js
 * Handles CRUD operations for workouts and routines
 */
export class WorkoutRepository {
  /**
   * Get all saved workouts
   */
  static async getAll(): Promise<Workout[]> {
    return await db.workouts.orderBy("createdAt").reverse().toArray();
  }

  /**
   * Get a workout by ID
   */
  static async getById(id: string): Promise<Workout | null> {
    return (await db.workouts.get(id)) ?? null;
  }

  /**
   * Save a workout (create or update)
   */
  static async save(workout: Workout): Promise<string> {
    return await db.workouts.put(workout);
  }

  /**
   * Delete a workout
   */
  static async delete(id: string): Promise<void> {
    await db.workouts.delete(id);
  }

  /**
   * Get the currently active workout (if any)
   * Active workout is identified by having no endTime
   */
  static async getActiveWorkout(): Promise<Workout | null> {
    // Check for workouts without endTime (active workouts)
    const allWorkouts = await db.workouts.toArray();
    const active = allWorkouts.find(
      (w) => !w.endTime || w.endTime === "" || w.endTime === null
    );
    return active ?? null;
  }

  /**
   * Set the active workout by marking it as incomplete
   * Note: In Dexie, we just ensure the workout exists with no endTime
   */
  static async setActiveWorkout(workout: Workout | null): Promise<void> {
    if (workout) {
      // Ensure endTime is cleared
      workout.endTime = undefined;
      await db.workouts.put(workout);
    }
    // To "unset" active workout, we don't delete it, we just ensure all have endTime
    // This is handled when finishing a workout
  }

  /**
   * Get all workout routines
   */
  static async getAllRoutines(): Promise<WorkoutRoutine[]> {
    return await db.routines.orderBy("createdAt").reverse().toArray();
  }

  /**
   * Get a routine by ID
   */
  static async getRoutineById(id: string): Promise<WorkoutRoutine | null> {
    return (await db.routines.get(id)) ?? null;
  }

  /**
   * Save a workout routine
   */
  static async saveRoutine(routine: WorkoutRoutine): Promise<string> {
    return await db.routines.put(routine);
  }

  /**
   * Delete a workout routine
   */
  static async deleteRoutine(id: string): Promise<void> {
    await db.routines.delete(id);
  }

  /**
   * Search workouts by name
   */
  static async searchByName(query: string): Promise<Workout[]> {
    const lowerQuery = query.toLowerCase();
    return await db.workouts
      .filter((workout) =>
        workout.name.toLowerCase().includes(lowerQuery)
      )
      .toArray();
  }
}
