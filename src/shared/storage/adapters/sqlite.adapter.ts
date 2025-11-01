/**
 * SQLite Database Adapter (for Native iOS/Android)
 * Uses Capacitor SQLite plugin with Drizzle ORM
 */

import { drizzle } from "drizzle-orm/sqlite-proxy";
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from "@capacitor-community/sqlite";
import { eq, desc, isNull, or, sql } from "drizzle-orm";
import type { IDatabaseAdapter } from "./types";
import * as schema from "../schema";
import type {
  Workout,
  WorkoutRoutine,
} from "@/features/workouts/types/workout.types";
import type {
  Exercise,
  BodyPart,
  Equipment,
  Muscle,
} from "@/features/exercises/types/exercise.types";

export class SQLiteAdapter implements IDatabaseAdapter {
  private sqliteConnection: SQLiteConnection;
  private dbConnection: SQLiteDBConnection | null = null;
  private drizzleDb: ReturnType<typeof drizzle> | null = null;
  private isInitialized = false;

  constructor() {
    this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized && this.drizzleDb) return;

    try {
      console.log("🗄️ Initializing SQLite database...");

      this.dbConnection = await this.sqliteConnection.createConnection(
        "fitness-db",
        false,
        "no-encryption",
        1,
        false
      );

      await this.dbConnection.open();

      this.drizzleDb = drizzle(
        async (sql, params, method) => {
          try {
            const result = await this.dbConnection!.query(sql, params || []);
            if (method === "get") {
              return {
                rows:
                  result.values && result.values.length > 0
                    ? [result.values[0]]
                    : [],
              };
            }
            return { rows: result.values || [] };
          } catch (error) {
            console.error("SQL Error:", error);
            throw error;
          }
        },
        { schema }
      );

      await this.createTables();
      this.isInitialized = true;
      console.log("✅ SQLite database initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize SQLite database:", error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.dbConnection) throw new Error("DB connection not initialized");

    const createTablesSQL = `
      CREATE TABLE IF NOT EXISTS workouts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        exercises TEXT NOT NULL,
        interval_config TEXT,
        interval_progress TEXT,
        start_time TEXT,
        end_time TEXT,
        notes TEXT,
        routine_id TEXT,
        routine_template_id TEXT,
        completed INTEGER DEFAULT 0,
        completion_percentage REAL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS routines (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        exercises TEXT NOT NULL,
        type TEXT NOT NULL,
        template_id TEXT,
        is_favorite INTEGER DEFAULT 0,
        tags TEXT,
        estimated_duration INTEGER,
        difficulty TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS routine_analytics (
        id TEXT PRIMARY KEY,
        routine_id TEXT NOT NULL,
        total_completions INTEGER DEFAULT 0,
        average_completion_rate REAL,
        total_workouts_started INTEGER DEFAULT 0,
        average_duration REAL,
        average_volume REAL,
        last_completed_at TEXT,
        last_started_at TEXT,
        best_volume REAL,
        best_duration REAL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS exercises (
        exercise_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        gif_url TEXT NOT NULL,
        equipments TEXT NOT NULL,
        body_parts TEXT NOT NULL,
        target_muscles TEXT NOT NULL,
        secondary_muscles TEXT NOT NULL,
        instructions TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS body_parts (name TEXT PRIMARY KEY);
      CREATE TABLE IF NOT EXISTS equipment (name TEXT PRIMARY KEY);
      CREATE TABLE IF NOT EXISTS muscles (name TEXT PRIMARY KEY);
      CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);

      CREATE INDEX IF NOT EXISTS idx_workouts_created_at ON workouts(created_at);
      CREATE INDEX IF NOT EXISTS idx_workouts_name ON workouts(name);
      CREATE INDEX IF NOT EXISTS idx_workouts_routine_id ON workouts(routine_id);
      CREATE INDEX IF NOT EXISTS idx_workouts_completed ON workouts(completed);
      CREATE INDEX IF NOT EXISTS idx_routines_type ON routines(type);
      CREATE INDEX IF NOT EXISTS idx_routines_template_id ON routines(template_id);
      CREATE INDEX IF NOT EXISTS idx_routine_analytics_routine_id ON routine_analytics(routine_id);
      CREATE INDEX IF NOT EXISTS idx_routine_analytics_last_completed ON routine_analytics(last_completed_at);
      CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(name);
    `;

    await this.dbConnection.execute(createTablesSQL);
  }

  async close(): Promise<void> {
    if (this.dbConnection) {
      await this.dbConnection.close();
      this.dbConnection = null;
      this.drizzleDb = null;
      this.isInitialized = false;
    }
  }

  async deleteDatabase(): Promise<void> {
    await this.close();
    await this.sqliteConnection.closeConnection("fitness-db", false);
    await CapacitorSQLite.deleteDatabase({ database: "fitness-db" });
    await this.initialize();
  }

  private getDb() {
    if (!this.drizzleDb || !this.isInitialized) {
      throw new Error("Database not initialized");
    }
    return this.drizzleDb;
  }

  // Workouts
  workouts = {
    getAll: async (): Promise<Workout[]> => {
      const db = this.getDb();
      const results = await db
        .select()
        .from(schema.workouts)
        .orderBy(desc(schema.workouts.createdAt));
      return results.map((r) => this.parseWorkout(r));
    },

    getById: async (id: string): Promise<Workout | null> => {
      const db = this.getDb();
      const results = await db
        .select()
        .from(schema.workouts)
        .where(eq(schema.workouts.id, id))
        .limit(1);
      return results.length > 0 ? this.parseWorkout(results[0]) : null;
    },

    save: async (workout: Workout): Promise<string> => {
      const db = this.getDb();
      const serialized = this.serializeWorkout(workout);
      await db.insert(schema.workouts).values(serialized).onConflictDoUpdate({
        target: schema.workouts.id,
        set: serialized,
      });
      return workout.id;
    },

    delete: async (id: string): Promise<void> => {
      const db = this.getDb();
      await db.delete(schema.workouts).where(eq(schema.workouts.id, id));
    },

    getActive: async (): Promise<Workout | null> => {
      const db = this.getDb();
      const results = await db
        .select()
        .from(schema.workouts)
        .where(
          or(isNull(schema.workouts.endTime), eq(schema.workouts.endTime, ""))
        )
        .limit(1);
      return results.length > 0 ? this.parseWorkout(results[0]) : null;
    },

    searchByName: async (query: string): Promise<Workout[]> => {
      const all = await this.workouts.getAll();
      return all.filter((w) =>
        w.name.toLowerCase().includes(query.toLowerCase())
      );
    },
  };

  // Routines
  routines = {
    getAll: async (): Promise<WorkoutRoutine[]> => {
      const db = this.getDb();
      const results = await db
        .select()
        .from(schema.routines)
        .orderBy(desc(schema.routines.createdAt));
      return results.map((r) => this.parseRoutine(r));
    },

    getById: async (id: string): Promise<WorkoutRoutine | null> => {
      const db = this.getDb();
      const results = await db
        .select()
        .from(schema.routines)
        .where(eq(schema.routines.id, id))
        .limit(1);
      return results.length > 0 ? this.parseRoutine(results[0]) : null;
    },

    save: async (routine: WorkoutRoutine): Promise<string> => {
      const db = this.getDb();
      const serialized = this.serializeRoutine(routine);
      await db.insert(schema.routines).values(serialized).onConflictDoUpdate({
        target: schema.routines.id,
        set: serialized,
      });
      return routine.id;
    },

    delete: async (id: string): Promise<void> => {
      const db = this.getDb();
      await db.delete(schema.routines).where(eq(schema.routines.id, id));
    },
  };

  // Exercises
  exercises = {
    getAll: async (): Promise<Exercise[]> => {
      const db = this.getDb();
      const results = await db.select().from(schema.exercises);
      return results.map((r) => this.parseExercise(r));
    },

    getById: async (id: string): Promise<Exercise | null> => {
      const db = this.getDb();
      const results = await db
        .select()
        .from(schema.exercises)
        .where(eq(schema.exercises.exerciseId, id))
        .limit(1);
      return results.length > 0 ? this.parseExercise(results[0]) : null;
    },

    save: async (exercise: Exercise): Promise<string> => {
      const db = this.getDb();
      const serialized = this.serializeExercise(exercise);
      await db.insert(schema.exercises).values(serialized).onConflictDoUpdate({
        target: schema.exercises.exerciseId,
        set: serialized,
      });
      return exercise.exerciseId;
    },

    delete: async (id: string): Promise<void> => {
      const db = this.getDb();
      await db
        .delete(schema.exercises)
        .where(eq(schema.exercises.exerciseId, id));
    },

    bulkInsert: async (exercises: Exercise[]): Promise<void> => {
      const db = this.getDb();
      for (const exercise of exercises) {
        const serialized = this.serializeExercise(exercise);
        await db
          .insert(schema.exercises)
          .values(serialized)
          .onConflictDoNothing();
      }
    },

    clear: async (): Promise<void> => {
      const db = this.getDb();
      await db.delete(schema.exercises);
    },
  };

  // Body Parts
  bodyParts = {
    getAll: async (): Promise<BodyPart[]> => {
      const db = this.getDb();
      return await db.select().from(schema.bodyParts);
    },

    getByName: async (name: string): Promise<BodyPart | null> => {
      const db = this.getDb();
      const results = await db
        .select()
        .from(schema.bodyParts)
        .where(eq(schema.bodyParts.name, name))
        .limit(1);
      return results.length > 0 ? results[0] : null;
    },

    save: async (bodyPart: BodyPart): Promise<string> => {
      const db = this.getDb();
      await db
        .insert(schema.bodyParts)
        .values(bodyPart)
        .onConflictDoUpdate({ target: schema.bodyParts.name, set: bodyPart });
      return bodyPart.name;
    },

    delete: async (name: string): Promise<void> => {
      const db = this.getDb();
      await db.delete(schema.bodyParts).where(eq(schema.bodyParts.name, name));
    },

    bulkInsert: async (bodyParts: BodyPart[]): Promise<void> => {
      const db = this.getDb();
      for (const bp of bodyParts) {
        await db.insert(schema.bodyParts).values(bp).onConflictDoNothing();
      }
    },

    clear: async (): Promise<void> => {
      const db = this.getDb();
      await db.delete(schema.bodyParts);
    },
  };

  // Equipment
  equipment = {
    getAll: async (): Promise<Equipment[]> => {
      const db = this.getDb();
      return await db.select().from(schema.equipment);
    },

    getByName: async (name: string): Promise<Equipment | null> => {
      const db = this.getDb();
      const results = await db
        .select()
        .from(schema.equipment)
        .where(eq(schema.equipment.name, name))
        .limit(1);
      return results.length > 0 ? results[0] : null;
    },

    save: async (equipment: Equipment): Promise<string> => {
      const db = this.getDb();
      await db
        .insert(schema.equipment)
        .values(equipment)
        .onConflictDoUpdate({ target: schema.equipment.name, set: equipment });
      return equipment.name;
    },

    delete: async (name: string): Promise<void> => {
      const db = this.getDb();
      await db.delete(schema.equipment).where(eq(schema.equipment.name, name));
    },

    bulkInsert: async (equipment: Equipment[]): Promise<void> => {
      const db = this.getDb();
      for (const eq of equipment) {
        await db.insert(schema.equipment).values(eq).onConflictDoNothing();
      }
    },

    clear: async (): Promise<void> => {
      const db = this.getDb();
      await db.delete(schema.equipment);
    },
  };

  // Muscles
  muscles = {
    getAll: async (): Promise<Muscle[]> => {
      const db = this.getDb();
      return await db.select().from(schema.muscles);
    },

    getByName: async (name: string): Promise<Muscle | null> => {
      const db = this.getDb();
      const results = await db
        .select()
        .from(schema.muscles)
        .where(eq(schema.muscles.name, name))
        .limit(1);
      return results.length > 0 ? results[0] : null;
    },

    save: async (muscle: Muscle): Promise<string> => {
      const db = this.getDb();
      await db
        .insert(schema.muscles)
        .values(muscle)
        .onConflictDoUpdate({ target: schema.muscles.name, set: muscle });
      return muscle.name;
    },

    delete: async (name: string): Promise<void> => {
      const db = this.getDb();
      await db.delete(schema.muscles).where(eq(schema.muscles.name, name));
    },

    bulkInsert: async (muscles: Muscle[]): Promise<void> => {
      const db = this.getDb();
      for (const m of muscles) {
        await db.insert(schema.muscles).values(m).onConflictDoNothing();
      }
    },

    clear: async (): Promise<void> => {
      const db = this.getDb();
      await db.delete(schema.muscles);
    },
  };

  // App Settings
  settings = {
    get: async (key: string): Promise<any | null> => {
      const db = this.getDb();
      const results = await db
        .select()
        .from(schema.appSettings)
        .where(eq(schema.appSettings.key, key))
        .limit(1);
      return results.length > 0 ? JSON.parse(results[0].value) : null;
    },

    set: async (key: string, value: any): Promise<void> => {
      const db = this.getDb();
      await db
        .insert(schema.appSettings)
        .values({ key, value: JSON.stringify(value) })
        .onConflictDoUpdate({
          target: schema.appSettings.key,
          set: { value: JSON.stringify(value) },
        });
    },

    delete: async (key: string): Promise<void> => {
      const db = this.getDb();
      await db
        .delete(schema.appSettings)
        .where(eq(schema.appSettings.key, key));
    },
  };

  // Serialization helpers
  private parseWorkout(row: any): Workout {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
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
      routineId: row.routineId || undefined,
      routineTemplateId: row.routineTemplateId || undefined,
      completed: row.completed === 1,
      completionPercentage: row.completionPercentage || undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private serializeWorkout(workout: Workout): any {
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
      routineId: workout.routineId || undefined,
      routineTemplateId: workout.routineTemplateId || undefined,
      completed: workout.completed ? 1 : 0,
      completionPercentage: workout.completionPercentage || undefined,
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

  private parseRoutine(row: any): WorkoutRoutine {
    return {
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      exercises: JSON.parse(row.exercises),
      type: row.type,
      templateId: row.templateId || undefined,
      isFavorite: row.isFavorite === 1,
      tags: row.tags ? JSON.parse(row.tags) : undefined,
      estimatedDuration: row.estimatedDuration || undefined,
      difficulty: row.difficulty || undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private serializeRoutine(routine: WorkoutRoutine): any {
    return {
      id: routine.id,
      name: routine.name,
      description: routine.description || undefined,
      exercises: JSON.stringify(routine.exercises),
      type: routine.type,
      templateId: routine.templateId || undefined,
      isFavorite: routine.isFavorite ? 1 : 0,
      tags: routine.tags ? JSON.stringify(routine.tags) : undefined,
      estimatedDuration: routine.estimatedDuration || undefined,
      difficulty: routine.difficulty || undefined,
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

  private parseExercise(row: any): Exercise {
    return {
      exerciseId: row.exerciseId,
      name: row.name,
      gifUrl: row.gifUrl,
      equipments: JSON.parse(row.equipments),
      bodyParts: JSON.parse(row.bodyParts),
      targetMuscles: JSON.parse(row.targetMuscles),
      secondaryMuscles: JSON.parse(row.secondaryMuscles),
      instructions: JSON.parse(row.instructions),
    };
  }

  private serializeExercise(exercise: Exercise): any {
    return {
      exerciseId: exercise.exerciseId,
      name: exercise.name,
      gifUrl: exercise.gifUrl,
      equipments: JSON.stringify(exercise.equipments),
      bodyParts: JSON.stringify(exercise.bodyParts),
      targetMuscles: JSON.stringify(exercise.targetMuscles),
      secondaryMuscles: JSON.stringify(exercise.secondaryMuscles),
      instructions: JSON.stringify(exercise.instructions),
    };
  }
}
