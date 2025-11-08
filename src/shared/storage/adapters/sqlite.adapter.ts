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
import type { Food, FoodLog } from "@/features/nutrition/types/food.types";
import type { NutritionTarget, NutritionAnalytic } from "@/features/nutrition/types/nutrition.types";
import type { CoachingSetting } from "@/features/nutrition/types/coaching.types";
import type { BodyMetric } from "@/features/nutrition/types/body-metrics.types";
import type { QuestionnaireResponse } from "@/features/nutrition/types/questionnaire.types";

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
      await this.migrateTables();
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
        is_enabled INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);

      CREATE TABLE IF NOT EXISTS foods (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        brand TEXT,
        barcode TEXT,
        serving_size TEXT NOT NULL,
        calories REAL NOT NULL,
        protein REAL NOT NULL,
        carbs REAL NOT NULL,
        fats REAL NOT NULL,
        micronutrients TEXT,
        verified INTEGER DEFAULT 0,
        user_submitted INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS food_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        food_id TEXT NOT NULL,
        quantity REAL NOT NULL,
        meal_type TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS nutrition_targets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        calories REAL NOT NULL,
        protein REAL NOT NULL,
        carbs REAL NOT NULL,
        fats REAL NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT,
        goal_type TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS body_metrics (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        weight REAL,
        body_fat REAL,
        measurements TEXT,
        photo_paths TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS nutrition_analytics (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        total_calories REAL DEFAULT 0,
        total_protein REAL DEFAULT 0,
        total_carbs REAL DEFAULT 0,
        total_fats REAL DEFAULT 0,
        micronutrients TEXT,
        adherence_score REAL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS coaching_settings (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        activity_level TEXT NOT NULL,
        gender TEXT,
        age INTEGER,
        height REAL,
        initial_weight REAL,
        goal_weight REAL,
        preferred_macro_split TEXT,
        recalibration_frequency INTEGER,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS questionnaire_responses (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        age INTEGER NOT NULL,
        sex TEXT NOT NULL,
        height REAL NOT NULL,
        weight REAL NOT NULL,
        activity_level TEXT NOT NULL,
        dietary_restrictions TEXT,
        allergies TEXT,
        intolerances TEXT,
        primary_goal TEXT NOT NULL,
        target_weight REAL,
        target_date TEXT,
        meal_frequency INTEGER NOT NULL,
        fasting_preferences TEXT,
        typical_wake_time TEXT,
        typical_bed_time TEXT,
        medical_conditions TEXT,
        medications TEXT,
        food_dislikes TEXT,
        food_favorites TEXT,
        completed_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_workouts_created_at ON workouts(created_at);
      CREATE INDEX IF NOT EXISTS idx_workouts_name ON workouts(name);
      CREATE INDEX IF NOT EXISTS idx_workouts_routine_id ON workouts(routine_id);
      CREATE INDEX IF NOT EXISTS idx_workouts_completed ON workouts(completed);
      CREATE INDEX IF NOT EXISTS idx_routines_type ON routines(type);
      CREATE INDEX IF NOT EXISTS idx_routines_template_id ON routines(template_id);
      CREATE INDEX IF NOT EXISTS idx_routine_analytics_routine_id ON routine_analytics(routine_id);
      CREATE INDEX IF NOT EXISTS idx_routine_analytics_last_completed ON routine_analytics(last_completed_at);
      CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(name);
      CREATE INDEX IF NOT EXISTS idx_foods_name ON foods(name);
      CREATE INDEX IF NOT EXISTS idx_foods_barcode ON foods(barcode);
      CREATE INDEX IF NOT EXISTS idx_food_logs_date ON food_logs(date);
      CREATE INDEX IF NOT EXISTS idx_food_logs_user_id ON food_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_nutrition_targets_user_id ON nutrition_targets(user_id);
      CREATE INDEX IF NOT EXISTS idx_body_metrics_user_id ON body_metrics(user_id);
      CREATE INDEX IF NOT EXISTS idx_body_metrics_date ON body_metrics(date);
      CREATE INDEX IF NOT EXISTS idx_nutrition_analytics_date ON nutrition_analytics(date);
      CREATE INDEX IF NOT EXISTS idx_nutrition_analytics_user_id ON nutrition_analytics(user_id);
    `;

    await this.dbConnection.execute(createTablesSQL);
  }

  /**
   * Migrate existing tables to add missing columns
   * This handles schema updates for existing databases
   */
  private async migrateTables(): Promise<void> {
    if (!this.dbConnection) throw new Error("DB connection not initialized");

    // Migrate workout_programs table
    await this.migrateWorkoutProgramsTable();
    
    // Migrate workouts table
    await this.migrateWorkoutsTable();
  }

  private async migrateWorkoutProgramsTable(): Promise<void> {
    if (!this.dbConnection) throw new Error("DB connection not initialized");

    try {
      // Check if workout_programs table exists and if is_enabled column is missing
      const tableInfo = await this.dbConnection.query(
        "PRAGMA table_info(workout_programs)",
        []
      );

      if (tableInfo.values && tableInfo.values.length > 0) {
        // Check if is_enabled column exists
        const hasIsEnabled = tableInfo.values.some(
          (col: any) => col.name === "is_enabled"
        );

        if (!hasIsEnabled) {
          console.log("🔄 Migrating workout_programs table: adding is_enabled column");
          await this.dbConnection.execute(
            "ALTER TABLE workout_programs ADD COLUMN is_enabled INTEGER DEFAULT 0"
          );
          console.log("✅ Migration completed: is_enabled column added to workout_programs");
        }
      }
    } catch (error) {
      // If table doesn't exist yet, that's fine - createTables will handle it
      if (error instanceof Error && error.message.includes("no such table")) {
        console.log("📋 workout_programs table doesn't exist yet, will be created");
      } else {
        console.error("⚠️ Error during workout_programs migration:", error);
        // Don't throw - migration failures shouldn't prevent app from starting
      }
    }
  }

  private async migrateWorkoutsTable(): Promise<void> {
    if (!this.dbConnection) throw new Error("DB connection not initialized");

    try {
      // Check if workouts table exists
      const tableInfo = await this.dbConnection.query(
        "PRAGMA table_info(workouts)",
        []
      );

      if (tableInfo.values && tableInfo.values.length > 0) {
        const columnNames = tableInfo.values.map((col: any) => col.name);
        const columnsToAdd: Array<{ name: string; sql: string }> = [];

        // Check for missing columns
        if (!columnNames.includes("program_id")) {
          columnsToAdd.push({
            name: "program_id",
            sql: "ALTER TABLE workouts ADD COLUMN program_id TEXT",
          });
        }

        if (!columnNames.includes("routine_id")) {
          columnsToAdd.push({
            name: "routine_id",
            sql: "ALTER TABLE workouts ADD COLUMN routine_id TEXT",
          });
        }

        if (!columnNames.includes("routine_template_id")) {
          columnsToAdd.push({
            name: "routine_template_id",
            sql: "ALTER TABLE workouts ADD COLUMN routine_template_id TEXT",
          });
        }

        if (!columnNames.includes("completed")) {
          columnsToAdd.push({
            name: "completed",
            sql: "ALTER TABLE workouts ADD COLUMN completed INTEGER DEFAULT 0",
          });
        }

        if (!columnNames.includes("completion_percentage")) {
          columnsToAdd.push({
            name: "completion_percentage",
            sql: "ALTER TABLE workouts ADD COLUMN completion_percentage REAL",
          });
        }

        // Add missing columns
        if (columnsToAdd.length > 0) {
          console.log(
            `🔄 Migrating workouts table: adding ${columnsToAdd.length} missing column(s)`
          );
          for (const column of columnsToAdd) {
            await this.dbConnection.execute(column.sql);
            console.log(`  ✅ Added column: ${column.name}`);
          }
          console.log("✅ Migration completed: workouts table updated");
        }
      }
    } catch (error) {
      // If table doesn't exist yet, that's fine - createTables will handle it
      if (error instanceof Error && error.message.includes("no such table")) {
        console.log("📋 workouts table doesn't exist yet, will be created");
      } else {
        console.error("⚠️ Error during workouts migration:", error);
        // Don't throw - migration failures shouldn't prevent app from starting
      }
    }
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
          id, name, description, template_id, workouts, is_enabled, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          description = excluded.description,
          template_id = excluded.template_id,
          workouts = excluded.workouts,
          is_enabled = excluded.is_enabled,
          updated_at = excluded.updated_at`,
        [
          serialized.id,
          serialized.name,
          serialized.description || null,
          serialized.templateId || null,
          serialized.workouts,
          serialized.isEnabled,
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

  // Foods
  foods = {
    getAll: async (): Promise<Food[]> => {
      const db = this.getDb();
      const result = await db.query("SELECT * FROM foods ORDER BY name", []);
      return (result.values || []).map((r: any) =>
        this.parseFood(this.mapSnakeToCamel(r))
      );
    },

    getById: async (id: string): Promise<Food | null> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM foods WHERE id = ? LIMIT 1",
        [id]
      );
      if (result.values && result.values.length > 0) {
        return this.parseFood(this.mapSnakeToCamel(result.values[0]));
      }
      return null;
    },

    save: async (food: Food): Promise<string> => {
      const db = this.getDb();
      const serialized = this.serializeFood(food);
      await db.query(
        `INSERT INTO foods (
          id, name, brand, barcode, serving_size, calories, protein, carbs, fats,
          micronutrients, verified, user_submitted, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          brand = excluded.brand,
          barcode = excluded.barcode,
          serving_size = excluded.serving_size,
          calories = excluded.calories,
          protein = excluded.protein,
          carbs = excluded.carbs,
          fats = excluded.fats,
          micronutrients = excluded.micronutrients,
          verified = excluded.verified,
          user_submitted = excluded.user_submitted,
          updated_at = excluded.updated_at`,
        [
          serialized.id,
          serialized.name,
          serialized.brand || null,
          serialized.barcode || null,
          serialized.servingSize,
          serialized.calories,
          serialized.protein,
          serialized.carbs,
          serialized.fats,
          serialized.micronutrients || null,
          serialized.verified,
          serialized.userSubmitted,
          serialized.createdAt,
          serialized.updatedAt,
        ]
      );
      return food.id;
    },

    delete: async (id: string): Promise<void> => {
      const db = this.getDb();
      await db.query("DELETE FROM foods WHERE id = ?", [id]);
    },

    searchByName: async (query: string): Promise<Food[]> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM foods WHERE LOWER(name) LIKE ? ORDER BY name",
        [`%${query.toLowerCase()}%`]
      );
      return (result.values || []).map((r: any) =>
        this.parseFood(this.mapSnakeToCamel(r))
      );
    },

    findByBarcode: async (barcode: string): Promise<Food | null> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM foods WHERE barcode = ? LIMIT 1",
        [barcode]
      );
      if (result.values && result.values.length > 0) {
        return this.parseFood(this.mapSnakeToCamel(result.values[0]));
      }
      return null;
    },

    bulkInsert: async (foods: Food[]): Promise<void> => {
      const db = this.getDb();
      if (foods.length === 0) return;

      const BATCH_SIZE = 100;
      for (let i = 0; i < foods.length; i += BATCH_SIZE) {
        const batch = foods.slice(i, i + BATCH_SIZE);
        const serialized = batch.map((f) => this.serializeFood(f));

        const values = serialized.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ");
        const params: any[] = [];
        serialized.forEach((s) => {
          params.push(
            s.id,
            s.name,
            s.brand || null,
            s.barcode || null,
            s.servingSize,
            s.calories,
            s.protein,
            s.carbs,
            s.fats,
            s.micronutrients || null,
            s.verified,
            s.userSubmitted,
            s.createdAt,
            s.updatedAt
          );
        });

        try {
          await db.query(
            `INSERT OR IGNORE INTO foods (
              id, name, brand, barcode, serving_size, calories, protein, carbs, fats,
              micronutrients, verified, user_submitted, created_at, updated_at
            ) VALUES ${values}`,
            params
          );
        } catch (error) {
          console.error(`Failed to insert food batch ${i}-${i + batch.length}:`, error);
          throw error;
        }
      }
    },
  };

  // Food Logs
  foodLogs = {
    getAll: async (): Promise<FoodLog[]> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM food_logs ORDER BY date DESC, created_at DESC",
        []
      );
      return (result.values || []).map((r: any) =>
        this.parseFoodLog(this.mapSnakeToCamel(r))
      );
    },

    getById: async (id: string): Promise<FoodLog | null> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM food_logs WHERE id = ? LIMIT 1",
        [id]
      );
      if (result.values && result.values.length > 0) {
        return this.parseFoodLog(this.mapSnakeToCamel(result.values[0]));
      }
      return null;
    },

    save: async (foodLog: FoodLog): Promise<string> => {
      const db = this.getDb();
      const serialized = this.serializeFoodLog(foodLog);
      await db.query(
        `INSERT INTO food_logs (
          id, user_id, date, food_id, quantity, meal_type, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          user_id = excluded.user_id,
          date = excluded.date,
          food_id = excluded.food_id,
          quantity = excluded.quantity,
          meal_type = excluded.meal_type`,
        [
          serialized.id,
          serialized.userId,
          serialized.date,
          serialized.foodId,
          serialized.quantity,
          serialized.mealType || null,
          serialized.createdAt,
        ]
      );
      return foodLog.id;
    },

    delete: async (id: string): Promise<void> => {
      const db = this.getDb();
      await db.query("DELETE FROM food_logs WHERE id = ?", [id]);
    },

    getByDate: async (date: string): Promise<FoodLog[]> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM food_logs WHERE date = ? ORDER BY created_at",
        [date]
      );
      return (result.values || []).map((r: any) =>
        this.parseFoodLog(this.mapSnakeToCamel(r))
      );
    },

    getByDateRange: async (startDate: string, endDate: string): Promise<FoodLog[]> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM food_logs WHERE date >= ? AND date <= ? ORDER BY date DESC, created_at DESC",
        [startDate, endDate]
      );
      return (result.values || []).map((r: any) =>
        this.parseFoodLog(this.mapSnakeToCamel(r))
      );
    },

    getByUserId: async (userId: string): Promise<FoodLog[]> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM food_logs WHERE user_id = ? ORDER BY date DESC, created_at DESC",
        [userId]
      );
      return (result.values || []).map((r: any) =>
        this.parseFoodLog(this.mapSnakeToCamel(r))
      );
    },
  };

  // Nutrition Targets
  nutritionTargets = {
    getAll: async (): Promise<NutritionTarget[]> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM nutrition_targets ORDER BY start_date DESC",
        []
      );
      return (result.values || []).map((r: any) =>
        this.parseNutritionTarget(this.mapSnakeToCamel(r))
      );
    },

    getById: async (id: string): Promise<NutritionTarget | null> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM nutrition_targets WHERE id = ? LIMIT 1",
        [id]
      );
      if (result.values && result.values.length > 0) {
        return this.parseNutritionTarget(this.mapSnakeToCamel(result.values[0]));
      }
      return null;
    },

    save: async (target: NutritionTarget): Promise<string> => {
      const db = this.getDb();
      const serialized = this.serializeNutritionTarget(target);
      await db.query(
        `INSERT INTO nutrition_targets (
          id, user_id, calories, protein, carbs, fats, start_date, end_date,
          goal_type, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          user_id = excluded.user_id,
          calories = excluded.calories,
          protein = excluded.protein,
          carbs = excluded.carbs,
          fats = excluded.fats,
          start_date = excluded.start_date,
          end_date = excluded.end_date,
          goal_type = excluded.goal_type,
          updated_at = excluded.updated_at`,
        [
          serialized.id,
          serialized.userId,
          serialized.calories,
          serialized.protein,
          serialized.carbs,
          serialized.fats,
          serialized.startDate,
          serialized.endDate || null,
          serialized.goalType,
          serialized.createdAt,
          serialized.updatedAt,
        ]
      );
      return target.id;
    },

    delete: async (id: string): Promise<void> => {
      const db = this.getDb();
      await db.query("DELETE FROM nutrition_targets WHERE id = ?", [id]);
    },

    getActive: async (userId: string): Promise<NutritionTarget | null> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM nutrition_targets WHERE user_id = ? AND (end_date IS NULL OR end_date = '') ORDER BY start_date DESC LIMIT 1",
        [userId]
      );
      if (result.values && result.values.length > 0) {
        return this.parseNutritionTarget(this.mapSnakeToCamel(result.values[0]));
      }
      return null;
    },

    getByUserId: async (userId: string): Promise<NutritionTarget[]> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM nutrition_targets WHERE user_id = ? ORDER BY start_date DESC",
        [userId]
      );
      return (result.values || []).map((r: any) =>
        this.parseNutritionTarget(this.mapSnakeToCamel(r))
      );
    },
  };

  // Body Metrics
  bodyMetrics = {
    getAll: async (): Promise<BodyMetric[]> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM body_metrics ORDER BY date DESC",
        []
      );
      return (result.values || []).map((r: any) =>
        this.parseBodyMetric(this.mapSnakeToCamel(r))
      );
    },

    getById: async (id: string): Promise<BodyMetric | null> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM body_metrics WHERE id = ? LIMIT 1",
        [id]
      );
      if (result.values && result.values.length > 0) {
        return this.parseBodyMetric(this.mapSnakeToCamel(result.values[0]));
      }
      return null;
    },

    save: async (metric: BodyMetric): Promise<string> => {
      const db = this.getDb();
      const serialized = this.serializeBodyMetric(metric);
      await db.query(
        `INSERT INTO body_metrics (
          id, user_id, date, weight, body_fat, measurements, photo_paths, notes,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          user_id = excluded.user_id,
          date = excluded.date,
          weight = excluded.weight,
          body_fat = excluded.body_fat,
          measurements = excluded.measurements,
          photo_paths = excluded.photo_paths,
          notes = excluded.notes,
          updated_at = excluded.updated_at`,
        [
          serialized.id,
          serialized.userId,
          serialized.date,
          serialized.weight || null,
          serialized.bodyFat || null,
          serialized.measurements || null,
          serialized.photoPaths || null,
          serialized.notes || null,
          serialized.createdAt,
          serialized.updatedAt,
        ]
      );
      return metric.id;
    },

    delete: async (id: string): Promise<void> => {
      const db = this.getDb();
      await db.query("DELETE FROM body_metrics WHERE id = ?", [id]);
    },

    getByUserId: async (userId: string): Promise<BodyMetric[]> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM body_metrics WHERE user_id = ? ORDER BY date DESC",
        [userId]
      );
      return (result.values || []).map((r: any) =>
        this.parseBodyMetric(this.mapSnakeToCamel(r))
      );
    },

    getByDateRange: async (userId: string, startDate: string, endDate: string): Promise<BodyMetric[]> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM body_metrics WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY date",
        [userId, startDate, endDate]
      );
      return (result.values || []).map((r: any) =>
        this.parseBodyMetric(this.mapSnakeToCamel(r))
      );
    },
  };

  // Nutrition Analytics
  nutritionAnalytics = {
    getAll: async (): Promise<NutritionAnalytic[]> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM nutrition_analytics ORDER BY date DESC",
        []
      );
      return (result.values || []).map((r: any) =>
        this.parseNutritionAnalytic(this.mapSnakeToCamel(r))
      );
    },

    getById: async (id: string): Promise<NutritionAnalytic | null> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM nutrition_analytics WHERE id = ? LIMIT 1",
        [id]
      );
      if (result.values && result.values.length > 0) {
        return this.parseNutritionAnalytic(this.mapSnakeToCamel(result.values[0]));
      }
      return null;
    },

    save: async (analytic: NutritionAnalytic): Promise<string> => {
      const db = this.getDb();
      const serialized = this.serializeNutritionAnalytic(analytic);
      await db.query(
        `INSERT INTO nutrition_analytics (
          id, user_id, date, total_calories, total_protein, total_carbs, total_fats,
          micronutrients, adherence_score, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          user_id = excluded.user_id,
          date = excluded.date,
          total_calories = excluded.total_calories,
          total_protein = excluded.total_protein,
          total_carbs = excluded.total_carbs,
          total_fats = excluded.total_fats,
          micronutrients = excluded.micronutrients,
          adherence_score = excluded.adherence_score,
          updated_at = excluded.updated_at`,
        [
          serialized.id,
          serialized.userId,
          serialized.date,
          serialized.totalCalories,
          serialized.totalProtein,
          serialized.totalCarbs,
          serialized.totalFats,
          serialized.micronutrients || null,
          serialized.adherenceScore || null,
          serialized.createdAt,
          serialized.updatedAt,
        ]
      );
      return analytic.id;
    },

    delete: async (id: string): Promise<void> => {
      const db = this.getDb();
      await db.query("DELETE FROM nutrition_analytics WHERE id = ?", [id]);
    },

    getByDate: async (date: string): Promise<NutritionAnalytic | null> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM nutrition_analytics WHERE date = ? LIMIT 1",
        [date]
      );
      if (result.values && result.values.length > 0) {
        return this.parseNutritionAnalytic(this.mapSnakeToCamel(result.values[0]));
      }
      return null;
    },

    getByDateRange: async (startDate: string, endDate: string): Promise<NutritionAnalytic[]> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM nutrition_analytics WHERE date >= ? AND date <= ? ORDER BY date",
        [startDate, endDate]
      );
      return (result.values || []).map((r: any) =>
        this.parseNutritionAnalytic(this.mapSnakeToCamel(r))
      );
    },

    getByUserId: async (userId: string): Promise<NutritionAnalytic[]> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM nutrition_analytics WHERE user_id = ? ORDER BY date DESC",
        [userId]
      );
      return (result.values || []).map((r: any) =>
        this.parseNutritionAnalytic(this.mapSnakeToCamel(r))
      );
    },
  };

  // Coaching Settings
  coachingSettings = {
    getAll: async (): Promise<CoachingSetting[]> => {
      const db = this.getDb();
      const result = await db.query("SELECT * FROM coaching_settings", []);
      return (result.values || []).map((r: any) =>
        this.parseCoachingSetting(this.mapSnakeToCamel(r))
      );
    },

    getById: async (id: string): Promise<CoachingSetting | null> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM coaching_settings WHERE id = ? LIMIT 1",
        [id]
      );
      if (result.values && result.values.length > 0) {
        return this.parseCoachingSetting(this.mapSnakeToCamel(result.values[0]));
      }
      return null;
    },

    save: async (setting: CoachingSetting): Promise<string> => {
      const db = this.getDb();
      const serialized = this.serializeCoachingSetting(setting);
      await db.query(
        `INSERT INTO coaching_settings (
          id, user_id, activity_level, gender, age, height, initial_weight, goal_weight,
          preferred_macro_split, recalibration_frequency, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          user_id = excluded.user_id,
          activity_level = excluded.activity_level,
          gender = excluded.gender,
          age = excluded.age,
          height = excluded.height,
          initial_weight = excluded.initial_weight,
          goal_weight = excluded.goal_weight,
          preferred_macro_split = excluded.preferred_macro_split,
          recalibration_frequency = excluded.recalibration_frequency,
          updated_at = excluded.updated_at`,
        [
          serialized.id,
          serialized.userId,
          serialized.activityLevel,
          serialized.gender || null,
          serialized.age || null,
          serialized.height || null,
          serialized.initialWeight || null,
          serialized.goalWeight || null,
          serialized.preferredMacroSplit || null,
          serialized.recalibrationFrequency || null,
          serialized.createdAt,
          serialized.updatedAt,
        ]
      );
      return setting.id;
    },

    delete: async (id: string): Promise<void> => {
      const db = this.getDb();
      await db.query("DELETE FROM coaching_settings WHERE id = ?", [id]);
    },

    getByUserId: async (userId: string): Promise<CoachingSetting | null> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM coaching_settings WHERE user_id = ? LIMIT 1",
        [userId]
      );
      if (result.values && result.values.length > 0) {
        return this.parseCoachingSetting(this.mapSnakeToCamel(result.values[0]));
      }
      return null;
    },
  };

  questionnaireResponses = {
    getAll: async (): Promise<QuestionnaireResponse[]> => {
      const db = this.getDb();
      const result = await db.query("SELECT * FROM questionnaire_responses", []);
      return (result.values || []).map((r: any) =>
        this.parseQuestionnaireResponse(this.mapSnakeToCamel(r))
      );
    },

    getById: async (id: string): Promise<QuestionnaireResponse | null> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM questionnaire_responses WHERE id = ? LIMIT 1",
        [id]
      );
      if (result.values && result.values.length > 0) {
        return this.parseQuestionnaireResponse(this.mapSnakeToCamel(result.values[0]));
      }
      return null;
    },

    save: async (response: QuestionnaireResponse): Promise<string> => {
      const db = this.getDb();
      const serialized = this.serializeQuestionnaireResponse(response);
      await db.query(
        `INSERT INTO questionnaire_responses (
          id, user_id, age, sex, height, weight, activity_level,
          dietary_restrictions, allergies, intolerances, primary_goal,
          target_weight, target_date, meal_frequency, fasting_preferences,
          typical_wake_time, typical_bed_time, medical_conditions,
          medications, food_dislikes, food_favorites, completed_at,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          user_id = excluded.user_id,
          age = excluded.age,
          sex = excluded.sex,
          height = excluded.height,
          weight = excluded.weight,
          activity_level = excluded.activity_level,
          dietary_restrictions = excluded.dietary_restrictions,
          allergies = excluded.allergies,
          intolerances = excluded.intolerances,
          primary_goal = excluded.primary_goal,
          target_weight = excluded.target_weight,
          target_date = excluded.target_date,
          meal_frequency = excluded.meal_frequency,
          fasting_preferences = excluded.fasting_preferences,
          typical_wake_time = excluded.typical_wake_time,
          typical_bed_time = excluded.typical_bed_time,
          medical_conditions = excluded.medical_conditions,
          medications = excluded.medications,
          food_dislikes = excluded.food_dislikes,
          food_favorites = excluded.food_favorites,
          completed_at = excluded.completed_at,
          updated_at = excluded.updated_at`,
        [
          serialized.id,
          serialized.userId,
          serialized.age,
          serialized.sex,
          serialized.height,
          serialized.weight,
          serialized.activityLevel,
          serialized.dietaryRestrictions || null,
          serialized.allergies || null,
          serialized.intolerances || null,
          serialized.primaryGoal,
          serialized.targetWeight || null,
          serialized.targetDate || null,
          serialized.mealFrequency,
          serialized.fastingPreferences || null,
          serialized.typicalWakeTime || null,
          serialized.typicalBedTime || null,
          serialized.medicalConditions || null,
          serialized.medications || null,
          serialized.foodDislikes || null,
          serialized.foodFavorites || null,
          serialized.completedAt,
          serialized.createdAt,
          serialized.updatedAt,
        ]
      );
      return response.id;
    },

    delete: async (id: string): Promise<void> => {
      const db = this.getDb();
      await db.query("DELETE FROM questionnaire_responses WHERE id = ?", [id]);
    },

    getByUserId: async (userId: string): Promise<QuestionnaireResponse[]> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM questionnaire_responses WHERE user_id = ? ORDER BY completed_at DESC",
        [userId]
      );
      return (result.values || []).map((r: any) =>
        this.parseQuestionnaireResponse(this.mapSnakeToCamel(r))
      );
    },

    getLatestByUserId: async (userId: string): Promise<QuestionnaireResponse | null> => {
      const db = this.getDb();
      const result = await db.query(
        "SELECT * FROM questionnaire_responses WHERE user_id = ? ORDER BY completed_at DESC LIMIT 1",
        [userId]
      );
      if (result.values && result.values.length > 0) {
        return this.parseQuestionnaireResponse(this.mapSnakeToCamel(result.values[0]));
      }
      return null;
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
      isEnabled: row.isEnabled === 1 || row.isEnabled === true ? true : false,
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
      isEnabled: program.isEnabled === true ? 1 : 0,
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

  private parseFood(row: any): Food {
    return {
      id: row.id,
      name: row.name,
      brand: row.brand || undefined,
      barcode: row.barcode || undefined,
      servingSize: row.servingSize,
      calories: row.calories,
      protein: row.protein,
      carbs: row.carbs,
      fats: row.fats,
      micronutrients: row.micronutrients || undefined,
      verified: row.verified === 1 ? 1 : 0,
      userSubmitted: row.userSubmitted === 1 ? 1 : 0,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private serializeFood(food: Food): any {
    return {
      id: food.id,
      name: food.name,
      brand: food.brand || undefined,
      barcode: food.barcode || undefined,
      servingSize: food.servingSize,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fats: food.fats,
      micronutrients: food.micronutrients || undefined,
      verified: food.verified,
      userSubmitted: food.userSubmitted,
      createdAt: typeof food.createdAt === "string" ? food.createdAt : food.createdAt.toISOString(),
      updatedAt: typeof food.updatedAt === "string" ? food.updatedAt : food.updatedAt.toISOString(),
    };
  }

  private parseFoodLog(row: any): FoodLog {
    return {
      id: row.id,
      userId: row.userId,
      date: row.date,
      foodId: row.foodId,
      quantity: row.quantity,
      mealType: row.mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack' | undefined,
      createdAt: row.createdAt,
    };
  }

  private serializeFoodLog(foodLog: FoodLog): any {
    return {
      id: foodLog.id,
      userId: foodLog.userId,
      date: foodLog.date,
      foodId: foodLog.foodId,
      quantity: foodLog.quantity,
      mealType: foodLog.mealType || undefined,
      createdAt: typeof foodLog.createdAt === "string" ? foodLog.createdAt : foodLog.createdAt.toISOString(),
    };
  }

  private parseNutritionTarget(row: any): NutritionTarget {
    return {
      id: row.id,
      userId: row.userId,
      calories: row.calories,
      protein: row.protein,
      carbs: row.carbs,
      fats: row.fats,
      startDate: row.startDate,
      endDate: row.endDate || undefined,
      goalType: row.goalType as 'cutting' | 'bulking' | 'maintenance',
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private serializeNutritionTarget(target: NutritionTarget): any {
    return {
      id: target.id,
      userId: target.userId,
      calories: target.calories,
      protein: target.protein,
      carbs: target.carbs,
      fats: target.fats,
      startDate: target.startDate,
      endDate: target.endDate || undefined,
      goalType: target.goalType,
      createdAt: typeof target.createdAt === "string" ? target.createdAt : target.createdAt.toISOString(),
      updatedAt: typeof target.updatedAt === "string" ? target.updatedAt : target.updatedAt.toISOString(),
    };
  }

  private parseBodyMetric(row: any): BodyMetric {
    return {
      id: row.id,
      userId: row.userId,
      date: row.date,
      weight: row.weight || undefined,
      bodyFat: row.bodyFat || undefined,
      measurements: row.measurements || undefined,
      photoPaths: row.photoPaths || undefined,
      notes: row.notes || undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private serializeBodyMetric(metric: BodyMetric): any {
    return {
      id: metric.id,
      userId: metric.userId,
      date: metric.date,
      weight: metric.weight || undefined,
      bodyFat: metric.bodyFat || undefined,
      measurements: metric.measurements || undefined,
      photoPaths: metric.photoPaths || undefined,
      notes: metric.notes || undefined,
      createdAt: typeof metric.createdAt === "string" ? metric.createdAt : metric.createdAt.toISOString(),
      updatedAt: typeof metric.updatedAt === "string" ? metric.updatedAt : metric.updatedAt.toISOString(),
    };
  }

  private parseNutritionAnalytic(row: any): NutritionAnalytic {
    return {
      id: row.id,
      userId: row.userId,
      date: row.date,
      totalCalories: row.totalCalories || 0,
      totalProtein: row.totalProtein || 0,
      totalCarbs: row.totalCarbs || 0,
      totalFats: row.totalFats || 0,
      micronutrients: row.micronutrients || undefined,
      adherenceScore: row.adherenceScore || undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private serializeNutritionAnalytic(analytic: NutritionAnalytic): any {
    return {
      id: analytic.id,
      userId: analytic.userId,
      date: analytic.date,
      totalCalories: analytic.totalCalories,
      totalProtein: analytic.totalProtein,
      totalCarbs: analytic.totalCarbs,
      totalFats: analytic.totalFats,
      micronutrients: analytic.micronutrients || undefined,
      adherenceScore: analytic.adherenceScore || undefined,
      createdAt: typeof analytic.createdAt === "string" ? analytic.createdAt : analytic.createdAt.toISOString(),
      updatedAt: typeof analytic.updatedAt === "string" ? analytic.updatedAt : analytic.updatedAt.toISOString(),
    };
  }

  private parseCoachingSetting(row: any): CoachingSetting {
    return {
      id: row.id,
      userId: row.userId,
      activityLevel: row.activityLevel as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
      gender: row.gender as 'male' | 'female' | 'other' | undefined,
      age: row.age || undefined,
      height: row.height || undefined,
      initialWeight: row.initialWeight || undefined,
      goalWeight: row.goalWeight || undefined,
      preferredMacroSplit: row.preferredMacroSplit || undefined,
      recalibrationFrequency: row.recalibrationFrequency || undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private serializeCoachingSetting(setting: CoachingSetting): any {
    return {
      id: setting.id,
      userId: setting.userId,
      activityLevel: setting.activityLevel,
      gender: setting.gender || undefined,
      age: setting.age || undefined,
      height: setting.height || undefined,
      initialWeight: setting.initialWeight || undefined,
      goalWeight: setting.goalWeight || undefined,
      preferredMacroSplit: setting.preferredMacroSplit || undefined,
      recalibrationFrequency: setting.recalibrationFrequency || undefined,
      createdAt: typeof setting.createdAt === "string" ? setting.createdAt : setting.createdAt.toISOString(),
      updatedAt: typeof setting.updatedAt === "string" ? setting.updatedAt : setting.updatedAt.toISOString(),
    };
  }

  private parseQuestionnaireResponse(row: any): QuestionnaireResponse {
    return {
      id: row.id,
      userId: row.userId,
      age: row.age,
      sex: row.sex as 'male' | 'female' | 'other',
      height: row.height,
      weight: row.weight,
      activityLevel: row.activityLevel as 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active',
      dietaryRestrictions: row.dietaryRestrictions ? JSON.parse(row.dietaryRestrictions) : [],
      allergies: row.allergies ? JSON.parse(row.allergies) : [],
      intolerances: row.intolerances ? JSON.parse(row.intolerances) : [],
      primaryGoal: row.primaryGoal as 'weight_loss' | 'muscle_gain' | 'maintenance' | 'performance',
      targetWeight: row.targetWeight || undefined,
      targetDate: row.targetDate || undefined,
      mealFrequency: row.mealFrequency,
      fastingPreferences: row.fastingPreferences ? JSON.parse(row.fastingPreferences) : [],
      typicalWakeTime: row.typicalWakeTime || undefined,
      typicalBedTime: row.typicalBedTime || undefined,
      medicalConditions: row.medicalConditions ? JSON.parse(row.medicalConditions) : undefined,
      medications: row.medications ? JSON.parse(row.medications) : undefined,
      foodDislikes: row.foodDislikes ? JSON.parse(row.foodDislikes) : undefined,
      foodFavorites: row.foodFavorites ? JSON.parse(row.foodFavorites) : undefined,
      completedAt: row.completedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private serializeQuestionnaireResponse(response: QuestionnaireResponse): any {
    return {
      id: response.id,
      userId: response.userId,
      age: response.age,
      sex: response.sex,
      height: response.height,
      weight: response.weight,
      activityLevel: response.activityLevel,
      dietaryRestrictions: response.dietaryRestrictions.length > 0 ? JSON.stringify(response.dietaryRestrictions) : null,
      allergies: response.allergies.length > 0 ? JSON.stringify(response.allergies) : null,
      intolerances: response.intolerances.length > 0 ? JSON.stringify(response.intolerances) : null,
      primaryGoal: response.primaryGoal,
      targetWeight: response.targetWeight || null,
      targetDate: response.targetDate || null,
      mealFrequency: response.mealFrequency,
      fastingPreferences: response.fastingPreferences.length > 0 ? JSON.stringify(response.fastingPreferences) : null,
      typicalWakeTime: response.typicalWakeTime || null,
      typicalBedTime: response.typicalBedTime || null,
      medicalConditions: response.medicalConditions && response.medicalConditions.length > 0 ? JSON.stringify(response.medicalConditions) : null,
      medications: response.medications && response.medications.length > 0 ? JSON.stringify(response.medications) : null,
      foodDislikes: response.foodDislikes && response.foodDislikes.length > 0 ? JSON.stringify(response.foodDislikes) : null,
      foodFavorites: response.foodFavorites && response.foodFavorites.length > 0 ? JSON.stringify(response.foodFavorites) : null,
      completedAt: typeof response.completedAt === "string" ? response.completedAt : response.completedAt.toISOString(),
      createdAt: typeof response.createdAt === "string" ? response.createdAt : response.createdAt.toISOString(),
      updatedAt: typeof response.updatedAt === "string" ? response.updatedAt : response.updatedAt.toISOString(),
    };
  }

}
