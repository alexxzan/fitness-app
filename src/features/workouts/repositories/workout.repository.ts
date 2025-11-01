import { getDatabase } from "@/shared/storage/database-adapter";
import type {
  Workout,
  WorkoutRoutine,
  WorkoutProgram,
} from "../types/workout.types";
import type { RoutineAnalytics } from "../types/analytics.types";

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

  /**
   * Get all workouts for a specific routine
   */
  static async getWorkoutsByRoutineId(routineId: string): Promise<Workout[]> {
    const allWorkouts = await this.getAll();
    return allWorkouts.filter((w) => w.routineId === routineId);
  }

  /**
   * Get completed workouts for a routine
   */
  static async getCompletedWorkoutsByRoutineId(
    routineId: string
  ): Promise<Workout[]> {
    const workouts = await this.getWorkoutsByRoutineId(routineId);
    return workouts.filter((w) => w.completed);
  }

  /**
   * Get routine analytics
   */
  static async getRoutineAnalytics(
    routineId: string
  ): Promise<RoutineAnalytics | null> {
    // Note: This will need to be implemented in the database adapters
    // For now, return null and calculate on-the-fly
    // In a future enhancement, add routineAnalytics to IDatabaseAdapter
    return null;
  }

  /**
   * Save routine analytics
   */
  static async saveRoutineAnalytics(
    analytics: RoutineAnalytics
  ): Promise<string> {
    // Note: This will need to be implemented in the database adapters
    // For now, just return the ID
    // In a future enhancement, add routineAnalytics to IDatabaseAdapter
    return analytics.id;
  }

  /**
   * Get workout history (completed workouts) sorted by date
   */
  static async getWorkoutHistory(): Promise<Workout[]> {
    const allWorkouts = await this.getAll();
    return allWorkouts
      .filter((w) => w.completed && w.endTime)
      .sort(
        (a, b) =>
          new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime()
      );
  }

  /**
   * Get recent workouts (last N workouts)
   */
  static async getRecentWorkouts(limit: number = 10): Promise<Workout[]> {
    const history = await this.getWorkoutHistory();
    return history.slice(0, limit);
  }

  /**
   * Get workout statistics for a date range
   */
  static async getWorkoutStatsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Workout[]> {
    const allWorkouts = await this.getAll();
    return allWorkouts.filter((w) => {
      if (!w.startTime) return false;
      const workoutDate = new Date(w.startTime);
      return workoutDate >= startDate && workoutDate <= endDate;
    });
  }

  /**
   * Get all workout programs
   */
  static async getAllPrograms(): Promise<WorkoutProgram[]> {
    const db = getDatabase();
    return await db.workoutPrograms.getAll();
  }

  /**
   * Get a workout program by ID
   */
  static async getProgramById(id: string): Promise<WorkoutProgram | null> {
    const db = getDatabase();
    return await db.workoutPrograms.getById(id);
  }

  /**
   * Save a workout program (create or update)
   */
  static async saveProgram(program: WorkoutProgram): Promise<string> {
    const db = getDatabase();
    return await db.workoutPrograms.save(program);
  }

  /**
   * Delete a workout program
   */
  static async deleteProgram(id: string): Promise<void> {
    const db = getDatabase();
    await db.workoutPrograms.delete(id);
  }
}

