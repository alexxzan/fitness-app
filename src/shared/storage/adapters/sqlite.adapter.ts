/**
 * SQLite Database Adapter (for Native iOS/Android)
 * Uses Capacitor SQLite plugin with raw SQL queries
 */

import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from "@capacitor-community/sqlite";
import type { IDatabaseAdapter } from "./types";
import type {
  Workout,
  WorkoutRoutine,
  WorkoutProgram,
} from "@/features/workouts/types/workout.types";
import type {
  Exercise,
  BodyPart,
  Equipment,
  Muscle,
} from "@/features/exercises/types/exercise.types";

export class SQLiteAdapter implements IDatabaseAdapter {
  private static readonly DB_NAME = "fitness-db";
  private static readonly DB_ENCRYPTED = false;
  private static readonly DB_MODE = "no-encryption";
  private static readonly DB_VERSION = 1;
  private static readonly DB_READONLY = false;

  private sqliteConnection: SQLiteConnection;
  private dbConnection: SQLiteDBConnection | null = null;
  private isInitialized = false;

  constructor() {
    this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized && this.dbConnection) return;

    try {
      console.log("🗄️ Initializing SQLite database...");

      // Check if connection exists in the pool
      const isConnection = await this.sqliteConnection.isConnection(
        SQLiteAdapter.DB_NAME,
        SQLiteAdapter.DB_ENCRYPTED
      );

      if (isConnection.result) {
        console.log("📌 Retrieving existing connection...");
        this.dbConnection = await this.sqliteConnection.retrieveConnection(
          SQLiteAdapter.DB_NAME,
          SQLiteAdapter.DB_ENCRYPTED
        );
      } else {
        try {
          console.log("📌 Creating new connection...");
          this.dbConnection = await this.sqliteConnection.createConnection(
            SQLiteAdapter.DB_NAME,
            SQLiteAdapter.DB_ENCRYPTED,
            SQLiteAdapter.DB_MODE,
            SQLiteAdapter.DB_VERSION,
            SQLiteAdapter.DB_READONLY
          );
        } catch (createError: any) {
          // If creation fails because connection exists, try to retrieve it
          if (createError?.message?.includes("already exists")) {
            console.log("⚠️ Connection already exists, retrieving...");
            this.dbConnection = await this.sqliteConnection.retrieveConnection(
              SQLiteAdapter.DB_NAME,
              SQLiteAdapter.DB_ENCRYPTED
            );
          } else {
            throw createError;
          }
        }
      }

      // Check if connection is already open
      const isOpen = await this.dbConnection.isDBOpen();
      if (!isOpen.result) {
        await this.dbConnection.open();
      }

      await this.createTables();
      this.isInitialized = true;
      console.log("✅ SQLite database initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize SQLite database:", error);
      console.error(
        "Error details:",
        error instanceof Error ? error.stack : error
      );
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
        program_id TEXT,
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
      CREATE TABLE IF NOT EXISTS workout_programs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        template_id TEXT,
        workouts TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
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
      try {
        // Check if connection is open before closing
        const isOpen = await this.dbConnection.isDBOpen();
        if (isOpen.result) {
          await this.dbConnection.close();
        }

        // Close the connection in the pool
        const isConnection = await this.sqliteConnection.isConnection(
          SQLiteAdapter.DB_NAME,
          SQLiteAdapter.DB_ENCRYPTED
        );
        if (isConnection.result) {
          await this.sqliteConnection.closeConnection(
            SQLiteAdapter.DB_NAME,
            SQLiteAdapter.DB_ENCRYPTED
          );
        }
      } catch (error) {
        console.warn("⚠️ Error closing SQLite connection:", error);
      } finally {
        this.dbConnection = null;
        this.isInitialized = false;
      }
    }
  }

  async deleteDatabase(): Promise<void> {
    try {
      // Clear our references first
      this.dbConnection = null;
      this.isInitialized = false;

      // Check if connection exists in the pool and close it
      const isConnection = await this.sqliteConnection.isConnection(
        SQLiteAdapter.DB_NAME,
        SQLiteAdapter.DB_ENCRYPTED
      );
      if (isConnection.result) {
        await this.sqliteConnection.closeConnection(
          SQLiteAdapter.DB_NAME,
          SQLiteAdapter.DB_ENCRYPTED
        );
      }

      // Delete the database
      await CapacitorSQLite.deleteDatabase({ database: SQLiteAdapter.DB_NAME });

      // Reinitialize
      await this.initialize();
    } catch (error) {
      console.error("Failed to delete database:", error);
      throw error;
    }
  }

  private getDb(): SQLiteDBConnection {
    if (!this.dbConnection || !this.isInitialized) {
      throw new Error("Database not initialized");
    }
    return this.dbConnection;
  }

  // Helper to convert snake_case to camelCase
  private mapSnakeToCamel(row: any): any {
    if (!row || typeof row !== "object") return row;
    const mapped: any = {};
    for (const key in row) {
      if (row.hasOwnProperty(key)) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
          letter.toUpperCase()
        );
        mapped[camelKey] = row[key];
      }
    }
    return mapped;
  }

  // Helper to escape SQL strings
  private escapeString(str: string): string {
    return str.replace(/'/g, "''");
  }

  // Workouts
  workouts = {
    getAll: async (): Promise<Workout[]> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM workouts ORDER BY created_at DESC",
        []
      );
      return (result.values || []).map((r: any) =>
        this.parseWorkout(this.mapSnakeToCamel(r))
      );
    },

    getById: async (id: string): Promise<Workout | null> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM workouts WHERE id = ? LIMIT 1",
        [id]
      );
      if (result.values && result.values.length > 0) {
        return this.parseWorkout(this.mapSnakeToCamel(result.values[0]));
      }
      return null;
    },

    save: async (workout: Workout): Promise<string> => {
      const db = this.getDb();
      const serialized = this.serializeWorkout(workout);

      try {
        console.log("SQLiteAdapter: Saving workout", {
          id: serialized.id,
          name: serialized.name,
          completed: serialized.completed,
          exercisesLength: serialized.exercises?.length || 0,
        });

        await db.query(
          `INSERT INTO workouts (
            id, name, type, exercises, interval_config, interval_progress,
            start_time, end_time, notes, program_id, routine_id, routine_template_id,
            completed, completion_percentage, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            type = excluded.type,
            exercises = excluded.exercises,
            interval_config = excluded.interval_config,
            interval_progress = excluded.interval_progress,
            start_time = excluded.start_time,
            end_time = excluded.end_time,
            notes = excluded.notes,
            program_id = excluded.program_id,
            routine_id = excluded.routine_id,
            routine_template_id = excluded.routine_template_id,
            completed = excluded.completed,
            completion_percentage = excluded.completion_percentage,
            updated_at = excluded.updated_at`,
          [
            serialized.id,
            serialized.name,
            serialized.type,
            serialized.exercises,
            serialized.intervalConfig || null,
            serialized.intervalProgress || null,
            serialized.startTime || null,
            serialized.endTime || null,
            serialized.notes || null,
            serialized.programId || null,
            serialized.routineId || null,
            serialized.routineTemplateId || null,
            serialized.completed,
            serialized.completionPercentage || null,
            serialized.createdAt,
            serialized.updatedAt,
          ]
        );

        console.log("SQLiteAdapter: Workout saved successfully", serialized.id);
        return workout.id;
      } catch (error) {
        console.error("SQLiteAdapter: Error saving workout", {
          error,
          workoutId: serialized.id,
          exercisesJsonLength: serialized.exercises?.length,
          completed: serialized.completed,
        });
        throw error;
      }
    },

    delete: async (id: string): Promise<void> => {
      const db = this.getDb();
      await db.query("DELETE FROM workouts WHERE id = ?", [id]);
    },

    getActive: async (): Promise<Workout | null> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM workouts WHERE (end_time IS NULL OR end_time = '') AND (completed = 0 OR completed IS NULL) LIMIT 1",
        []
      );
      if (result.values && result.values.length > 0) {
        return this.parseWorkout(this.mapSnakeToCamel(result.values[0]));
      }
      return null;
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
      const result = await db.query(
        "SELECT * FROM routines ORDER BY created_at DESC",
        []
      );
      return (result.values || []).map((r: any) =>
        this.parseRoutine(this.mapSnakeToCamel(r))
      );
    },

    getById: async (id: string): Promise<WorkoutRoutine | null> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM routines WHERE id = ? LIMIT 1",
        [id]
      );
      if (result.values && result.values.length > 0) {
        return this.parseRoutine(this.mapSnakeToCamel(result.values[0]));
      }
      return null;
    },

    save: async (routine: WorkoutRoutine): Promise<string> => {
      const db = this.getDb();
      const serialized = this.serializeRoutine(routine);
      await db.query(
        `INSERT INTO routines (
          id, name, description, exercises, type, template_id,
          is_favorite, tags, estimated_duration, difficulty,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          description = excluded.description,
          exercises = excluded.exercises,
          type = excluded.type,
          template_id = excluded.template_id,
          is_favorite = excluded.is_favorite,
          tags = excluded.tags,
          estimated_duration = excluded.estimated_duration,
          difficulty = excluded.difficulty,
          updated_at = excluded.updated_at`,
        [
          serialized.id,
          serialized.name,
          serialized.description || null,
          serialized.exercises,
          serialized.type,
          serialized.templateId || null,
          serialized.isFavorite,
          serialized.tags || null,
          serialized.estimatedDuration || null,
          serialized.difficulty || null,
          serialized.createdAt,
          serialized.updatedAt,
        ]
      );
      return routine.id;
    },

    delete: async (id: string): Promise<void> => {
      const db = this.getDb();
      await db.query("DELETE FROM routines WHERE id = ?", [id]);
    },
  };

  // Workout Programs
  workoutPrograms = {
    getAll: async (): Promise<WorkoutProgram[]> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM workout_programs ORDER BY created_at DESC",
        []
      );
      return (result.values || []).map((r: any) =>
        this.parseProgram(this.mapSnakeToCamel(r))
      );
    },

    getById: async (id: string): Promise<WorkoutProgram | null> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM workout_programs WHERE id = ? LIMIT 1",
        [id]
      );
      if (result.values && result.values.length > 0) {
        return this.parseProgram(this.mapSnakeToCamel(result.values[0]));
      }
      return null;
    },

    save: async (program: WorkoutProgram): Promise<string> => {
      const db = this.getDb();
      const serialized = this.serializeProgram(program);
      await db.query(
        `INSERT INTO workout_programs (
          id, name, description, template_id, workouts, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          description = excluded.description,
          template_id = excluded.template_id,
          workouts = excluded.workouts,
          updated_at = excluded.updated_at`,
        [
          serialized.id,
          serialized.name,
          serialized.description || null,
          serialized.templateId || null,
          serialized.workouts,
          serialized.createdAt,
          serialized.updatedAt,
        ]
      );
      return program.id;
    },

    delete: async (id: string): Promise<void> => {
      const db = this.getDb();
      await db.query("DELETE FROM workout_programs WHERE id = ?", [id]);
    },
  };

  // Exercises
  exercises = {
    getAll: async (): Promise<Exercise[]> => {
      const db = this.getDb();
      const result = await db.query("SELECT * FROM exercises", []);
      return (result.values || []).map((r: any) =>
        this.parseExercise(this.mapSnakeToCamel(r))
      );
    },

    getById: async (id: string): Promise<Exercise | null> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM exercises WHERE exercise_id = ? LIMIT 1",
        [id]
      );
      if (result.values && result.values.length > 0) {
        return this.parseExercise(this.mapSnakeToCamel(result.values[0]));
      }
      return null;
    },

    save: async (exercise: Exercise): Promise<string> => {
      const db = this.getDb();
      const serialized = this.serializeExercise(exercise);
      await db.query(
        `INSERT INTO exercises (
          exercise_id, name, gif_url, equipments, body_parts, 
          target_muscles, secondary_muscles, instructions
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(exercise_id) DO UPDATE SET
          name = excluded.name,
          gif_url = excluded.gif_url,
          equipments = excluded.equipments,
          body_parts = excluded.body_parts,
          target_muscles = excluded.target_muscles,
          secondary_muscles = excluded.secondary_muscles,
          instructions = excluded.instructions`,
        [
          serialized.exerciseId,
          serialized.name,
          serialized.gifUrl,
          serialized.equipments,
          serialized.bodyParts,
          serialized.targetMuscles,
          serialized.secondaryMuscles,
          serialized.instructions,
        ]
      );
      return exercise.exerciseId;
    },

    delete: async (id: string): Promise<void> => {
      const db = this.getDb();
      await db.query("DELETE FROM exercises WHERE exercise_id = ?", [id]);
    },

    bulkInsert: async (exercises: Exercise[]): Promise<void> => {
      const db = this.getDb();
      if (exercises.length === 0) return;

      // Batch insert in chunks of 100 for better performance
      const BATCH_SIZE = 100;
      for (let i = 0; i < exercises.length; i += BATCH_SIZE) {
        const batch = exercises.slice(i, i + BATCH_SIZE);
        const serialized = batch.map((ex) => this.serializeExercise(ex));

        // Build batch INSERT with VALUES
        const values = serialized
          .map(() => "(?, ?, ?, ?, ?, ?, ?, ?)")
          .join(", ");
        const params: any[] = [];
        serialized.forEach((s) => {
          params.push(
            s.exerciseId,
            s.name,
            s.gifUrl,
            s.equipments,
            s.bodyParts,
            s.targetMuscles,
            s.secondaryMuscles,
            s.instructions
          );
        });

        try {
          await db.query(
            `INSERT OR IGNORE INTO exercises (
              exercise_id, name, gif_url, equipments, body_parts, 
              target_muscles, secondary_muscles, instructions
            ) VALUES ${values}`,
            params
          );
        } catch (error) {
          console.error(
            `Failed to insert exercise batch ${i}-${i + batch.length}:`,
            error
          );
          throw error;
        }
      }
    },

    clear: async (): Promise<void> => {
      const db = this.getDb();
      await db.query("DELETE FROM exercises", []);
    },
  };

  // Body Parts
  bodyParts = {
    getAll: async (): Promise<BodyPart[]> => {
      const db = this.getDb();
      const result = await db.query("SELECT * FROM body_parts", []);
      return (result.values || []).map((r: any) => ({ name: r.name }));
    },

    getByName: async (name: string): Promise<BodyPart | null> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM body_parts WHERE name = ? LIMIT 1",
        [name]
      );
      if (result.values && result.values.length > 0) {
        return { name: result.values[0].name };
      }
      return null;
    },

    save: async (bodyPart: BodyPart): Promise<string> => {
      const db = this.getDb();
      await db.query(
        "INSERT INTO body_parts (name) VALUES (?) ON CONFLICT(name) DO UPDATE SET name = excluded.name",
        [bodyPart.name]
      );
      return bodyPart.name;
    },

    delete: async (name: string): Promise<void> => {
      const db = this.getDb();
      await db.query("DELETE FROM body_parts WHERE name = ?", [name]);
    },

    bulkInsert: async (bodyParts: BodyPart[]): Promise<void> => {
      const db = this.getDb();
      if (bodyParts.length === 0) return;

      const values = bodyParts.map(() => "(?)").join(", ");
      const params = bodyParts.map((bp) => bp.name);

      try {
        await db.query(
          `INSERT OR IGNORE INTO body_parts (name) VALUES ${values}`,
          params
        );
      } catch (error) {
        console.error("Failed to bulk insert body parts:", error);
        throw error;
      }
    },

    clear: async (): Promise<void> => {
      const db = this.getDb();
      await db.query("DELETE FROM body_parts", []);
    },
  };

  // Equipment
  equipment = {
    getAll: async (): Promise<Equipment[]> => {
      const db = this.getDb();
      const result = await db.query("SELECT * FROM equipment", []);
      return (result.values || []).map((r: any) => ({ name: r.name }));
    },

    getByName: async (name: string): Promise<Equipment | null> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM equipment WHERE name = ? LIMIT 1",
        [name]
      );
      if (result.values && result.values.length > 0) {
        return { name: result.values[0].name };
      }
      return null;
    },

    save: async (equipment: Equipment): Promise<string> => {
      const db = this.getDb();
      await db.query(
        "INSERT INTO equipment (name) VALUES (?) ON CONFLICT(name) DO UPDATE SET name = excluded.name",
        [equipment.name]
      );
      return equipment.name;
    },

    delete: async (name: string): Promise<void> => {
      const db = this.getDb();
      await db.query("DELETE FROM equipment WHERE name = ?", [name]);
    },

    bulkInsert: async (equipment: Equipment[]): Promise<void> => {
      const db = this.getDb();
      if (equipment.length === 0) return;

      const values = equipment.map(() => "(?)").join(", ");
      const params = equipment.map((eq) => eq.name);

      try {
        await db.query(
          `INSERT OR IGNORE INTO equipment (name) VALUES ${values}`,
          params
        );
      } catch (error) {
        console.error("Failed to bulk insert equipment:", error);
        throw error;
      }
    },

    clear: async (): Promise<void> => {
      const db = this.getDb();
      await db.query("DELETE FROM equipment", []);
    },
  };

  // Muscles
  muscles = {
    getAll: async (): Promise<Muscle[]> => {
      const db = this.getDb();
      const result = await db.query("SELECT * FROM muscles", []);
      return (result.values || []).map((r: any) => ({ name: r.name }));
    },

    getByName: async (name: string): Promise<Muscle | null> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM muscles WHERE name = ? LIMIT 1",
        [name]
      );
      if (result.values && result.values.length > 0) {
        return { name: result.values[0].name };
      }
      return null;
    },

    save: async (muscle: Muscle): Promise<string> => {
      const db = this.getDb();
      await db.query(
        "INSERT INTO muscles (name) VALUES (?) ON CONFLICT(name) DO UPDATE SET name = excluded.name",
        [muscle.name]
      );
      return muscle.name;
    },

    delete: async (name: string): Promise<void> => {
      const db = this.getDb();
      await db.query("DELETE FROM muscles WHERE name = ?", [name]);
    },

    bulkInsert: async (muscles: Muscle[]): Promise<void> => {
      const db = this.getDb();
      if (muscles.length === 0) return;

      const values = muscles.map(() => "(?)").join(", ");
      const params = muscles.map((m) => m.name);

      try {
        await db.query(
          `INSERT OR IGNORE INTO muscles (name) VALUES ${values}`,
          params
        );
      } catch (error) {
        console.error("Failed to bulk insert muscles:", error);
        throw error;
      }
    },

    clear: async (): Promise<void> => {
      const db = this.getDb();
      await db.query("DELETE FROM muscles", []);
    },
  };

  // App Settings
  settings = {
    get: async (key: string): Promise<any | null> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM app_settings WHERE key = ? LIMIT 1",
        [key]
      );

      if (
        !result.values ||
        result.values.length === 0 ||
        !result.values[0].value
      ) {
        return null;
      }

      try {
        const value = result.values[0].value;
        // Handle string "undefined" or "null" cases
        if (
          typeof value === "string" &&
          (value === "undefined" || value === "null")
        ) {
          return null;
        }
        return JSON.parse(value);
      } catch (error) {
        console.error(
          `Failed to parse settings value for key "${key}":`,
          error
        );
        console.error("Raw value:", result.values[0].value);
        return null;
      }
    },

    set: async (key: string, value: any): Promise<void> => {
      const db = this.getDb();
      await db.query(
        "INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        [key, JSON.stringify(value)]
      );
    },

    delete: async (key: string): Promise<void> => {
      const db = this.getDb();
      await db.query("DELETE FROM app_settings WHERE key = ?", [key]);
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
      programId: row.programId || undefined,
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
      programId: workout.programId || undefined,
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

  private parseProgram(row: any): WorkoutProgram {
    return {
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      templateId: row.templateId || undefined,
      workouts: JSON.parse(row.workouts),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private serializeProgram(program: WorkoutProgram): any {
    return {
      id: program.id,
      name: program.name,
      description: program.description || undefined,
      templateId: program.templateId || undefined,
      workouts: JSON.stringify(program.workouts),
      createdAt:
        typeof program.createdAt === "string"
          ? program.createdAt
          : program.createdAt.toISOString(),
      updatedAt:
        typeof program.updatedAt === "string"
          ? program.updatedAt
          : program.updatedAt.toISOString(),
    };
  }

  private parseExercise(row: any): Exercise {
    // Helper to safely parse JSON fields
    const safeJsonParse = (value: any, fallback: any[] = []): any[] => {
      if (!value || value === null || value === undefined) {
        return fallback;
      }

      // Handle string cases
      if (typeof value === "string") {
        // Handle literal string "undefined" or "null"
        if (value === "undefined" || value === "null" || value.trim() === "") {
          return fallback;
        }

        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : fallback;
        } catch (error) {
          console.warn(`⚠️ Failed to parse JSON field:`, value, error);
          return fallback;
        }
      }

      // Already an array
      if (Array.isArray(value)) {
        return value;
      }

      return fallback;
    };

    // Row should already be mapped from snake_case to camelCase via mapSnakeToCamel
    return {
      exerciseId: row.exerciseId || "",
      name: row.name || "",
      gifUrl: row.gifUrl || "",
      equipments: safeJsonParse(row.equipments, []),
      bodyParts: safeJsonParse(row.bodyParts, []),
      targetMuscles: safeJsonParse(row.targetMuscles, []),
      secondaryMuscles: safeJsonParse(row.secondaryMuscles, []),
      instructions: safeJsonParse(row.instructions, []),
    };
  }

  private serializeExercise(exercise: Exercise): any {
    // Helper to safely stringify array fields
    const safeStringify = (value: any): string => {
      if (value === null || value === undefined) {
        return JSON.stringify([]);
      }
      if (Array.isArray(value)) {
        return JSON.stringify(value);
      }
      // Fallback: try to stringify whatever it is
      return JSON.stringify([]);
    };

    // Return with snake_case column names for SQL
    return {
      exerciseId: exercise.exerciseId,
      name: exercise.name || "",
      gifUrl: exercise.gifUrl || "",
      equipments: safeStringify(exercise.equipments),
      bodyParts: safeStringify(exercise.bodyParts),
      targetMuscles: safeStringify(exercise.targetMuscles),
      secondaryMuscles: safeStringify(exercise.secondaryMuscles),
      instructions: safeStringify(exercise.instructions),
    };
  }
}
