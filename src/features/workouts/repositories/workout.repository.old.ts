import { getDb, schema } from "@/shared/storage/database";
import { eq, desc, and, isNull, or } from "drizzle-orm";
import type { Workout, WorkoutRoutine } from "../types/workout.types";
import type { WorkoutInsert, RoutineInsert } from "@/shared/storage/schema";

/**
 * Repository for workout data access using Drizzle ORM with SQLite
 * Handles CRUD operations for workouts and routines
 */
export class WorkoutRepository {
  /**
   * Get all saved workouts
   */
  static async getAll(): Promise<Workout[]> {
    const db = getDb();
    const results = await db
      .select()
      .from(schema.workouts)
      .orderBy(desc(schema.workouts.createdAt));

    // Parse JSON fields back to objects
    return results.map((row) => this.parseWorkoutFromDb(row));
  }

  /**
   * Get a workout by ID
   */
  static async getById(id: string): Promise<Workout | null> {
    const db = getDb();
    const results = await db
      .select()
      .from(schema.workouts)
      .where(eq(schema.workouts.id, id))
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    return this.parseWorkoutFromDb(results[0]);
  }

  /**
   * Save a workout (create or update)
   */
  static async save(workout: Workout): Promise<string> {
    const db = getDb();
    const serialized = this.serializeWorkoutForDb(workout);

    await db
      .insert(schema.workouts)
      .values(serialized)
      .onConflictDoUpdate({
        target: schema.workouts.id,
        set: serialized,
      });

    return workout.id;
  }

  /**
   * Delete a workout
   */
  static async delete(id: string): Promise<void> {
    const db = getDb();
    await db.delete(schema.workouts).where(eq(schema.workouts.id, id));
  }

  /**
   * Get the currently active workout (if any)
   * Active workout is identified by having no endTime
   */
  static async getActiveWorkout(): Promise<Workout | null> {
    const db = getDb();
    const results = await db
      .select()
      .from(schema.workouts)
      .where(
        or(
          isNull(schema.workouts.endTime),
          eq(schema.workouts.endTime, "")
        )
      )
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    return this.parseWorkoutFromDb(results[0]);
  }

  /**
   * Set the active workout by marking it as incomplete
   */
  static async setActiveWorkout(workout: Workout | null): Promise<void> {
    if (workout) {
      // Ensure endTime is cleared
      workout.endTime = undefined;
      await this.save(workout);
    }
  }

  /**
   * Get all workout routines
   */
  static async getAllRoutines(): Promise<WorkoutRoutine[]> {
    const db = getDb();
    const results = await db
      .select()
      .from(schema.routines)
      .orderBy(desc(schema.routines.createdAt));

    return results.map((row) => this.parseRoutineFromDb(row));
  }

  /**
   * Get a routine by ID
   */
  static async getRoutineById(id: string): Promise<WorkoutRoutine | null> {
    const db = getDb();
    const results = await db
      .select()
      .from(schema.routines)
      .where(eq(schema.routines.id, id))
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    return this.parseRoutineFromDb(results[0]);
  }

  /**
   * Save a workout routine
   */
  static async saveRoutine(routine: WorkoutRoutine): Promise<string> {
    const db = getDb();
    const serialized = this.serializeRoutineForDb(routine);

    await db
      .insert(schema.routines)
      .values(serialized)
      .onConflictDoUpdate({
        target: schema.routines.id,
        set: serialized,
      });

    return routine.id;
  }

  /**
   * Delete a workout routine
   */
  static async deleteRoutine(id: string): Promise<void> {
    const db = getDb();
    await db.delete(schema.routines).where(eq(schema.routines.id, id));
  }

  /**
   * Search workouts by name
   */
  static async searchByName(query: string): Promise<Workout[]> {
    const db = getDb();
    const lowerQuery = query.toLowerCase();
    
    // Get all workouts and filter in memory (SQLite LIKE would require sql operator)
    const allWorkouts = await this.getAll();
    return allWorkouts.filter((workout) =>
      workout.name.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Parse workout from database row
   */
  private static parseWorkoutFromDb(row: Record<string, any>): Workout {
    return {
      id: row.id,
      name: row.name,
      type: row.type as "regular" | "interval",
      exercises: JSON.parse(row.exercises),
      intervalConfig: row.intervalConfig
        ? JSON.parse(row.intervalConfig)
        : undefined,
      intervalProgress: row.intervalProgress
        ? JSON.parse(row.intervalProgress)
        : undefined,
      startTime: row.startTime || undefined,
      endTime: row.endTime || undefined,
      notes: row.notes || undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  /**
   * Serialize workout for database storage
   */
  private static serializeWorkoutForDb(workout: Workout): WorkoutInsert {
    return {
      id: workout.id,
      name: workout.name,
      type: workout.type,
      exercises: JSON.stringify(workout.exercises),
      intervalConfig: workout.intervalConfig
        ? JSON.stringify(workout.intervalConfig)
        : undefined,
      intervalProgress: workout.intervalProgress
        ? JSON.stringify(workout.intervalProgress)
        : undefined,
      startTime: workout.startTime
        ? typeof workout.startTime === "string"
          ? workout.startTime
          : workout.startTime.toISOString()
        : undefined,
      endTime: workout.endTime
        ? typeof workout.endTime === "string"
          ? workout.endTime
          : workout.endTime.toISOString()
        : undefined,
      notes: workout.notes || undefined,
      createdAt:
        typeof workout.createdAt === "string"
          ? workout.createdAt
          : workout.createdAt.toISOString(),
      updatedAt:
        typeof workout.updatedAt === "string"
          ? workout.updatedAt
          : workout.updatedAt.toISOString(),
    };
  }

  /**
   * Parse routine from database row
   */
  private static parseRoutineFromDb(row: Record<string, any>): WorkoutRoutine {
    return {
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      exercises: JSON.parse(row.exercises),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  /**
   * Serialize routine for database storage
   */
  private static serializeRoutineForDb(routine: WorkoutRoutine): RoutineInsert {
    return {
      id: routine.id,
      name: routine.name,
      description: routine.description || undefined,
      exercises: JSON.stringify(routine.exercises),
      createdAt:
        typeof routine.createdAt === "string"
          ? routine.createdAt
          : routine.createdAt.toISOString(),
      updatedAt:
        typeof routine.updatedAt === "string"
          ? routine.updatedAt
          : routine.updatedAt.toISOString(),
    };
  }
}
