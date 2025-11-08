import { drizzle } from "drizzle-orm/sqlite-proxy";
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from "@capacitor-community/sqlite";
import { Capacitor } from "@capacitor/core";
import * as schema from "./schema";

/**
 * SQLite Database Manager
 * Manages SQLite connection using @capacitor-community/sqlite and Drizzle ORM
 */
class DatabaseManager {
  private sqliteConnection: SQLiteConnection;
  private dbConnection: SQLiteDBConnection | null = null;
  private drizzleDb: ReturnType<typeof drizzle> | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
  }

  /**
   * Initialize the SQLite database
   * This should be called once during app startup
   */
  async initialize(): Promise<void> {
    // If already initialized, return
    if (this.isInitialized && this.drizzleDb) {
      return;
    }

    // If initialization is in progress, wait for it
    if (this.initPromise) {
      return this.initPromise;
    }

    // Start initialization
    this.initPromise = this._initialize();
    await this.initPromise;
    this.initPromise = null;
  }

  private async _initialize(): Promise<void> {
    try {
      console.log("🗄️ Initializing SQLite database...");

      // Create or open the database
      this.dbConnection = await this.sqliteConnection.createConnection(
        "fitness-db",
        false, // not encrypted
        "no-encryption",
        1, // version
        false // readonly
      );

      // Open the database
      await this.dbConnection.open();

      // Initialize Drizzle with the SQLite connection using proxy
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

      // Create tables if they don't exist
      await this.createTables();
      
      // Migrate existing tables to add missing columns
      await this.migrateTables();

      this.isInitialized = true;
      console.log("✅ SQLite database initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize SQLite database:", error);
      throw error;
    }
  }

  /**
   * Create all tables if they don't exist
   */
  private async createTables(): Promise<void> {
    if (!this.dbConnection) {
      throw new Error("Database connection not initialized");
    }

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

      CREATE TABLE IF NOT EXISTS body_parts (
        name TEXT PRIMARY KEY
      );

      CREATE TABLE IF NOT EXISTS equipment (
        name TEXT PRIMARY KEY
      );

      CREATE TABLE IF NOT EXISTS muscles (
        name TEXT PRIMARY KEY
      );

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

      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      -- Create indexes for better query performance
      CREATE INDEX IF NOT EXISTS idx_workouts_created_at ON workouts(created_at);
      CREATE INDEX IF NOT EXISTS idx_workouts_name ON workouts(name);
      CREATE INDEX IF NOT EXISTS idx_workouts_routine_id ON workouts(routine_id);
      CREATE INDEX IF NOT EXISTS idx_workouts_completed ON workouts(completed);
      CREATE INDEX IF NOT EXISTS idx_routines_type ON routines(type);
      CREATE INDEX IF NOT EXISTS idx_routines_template_id ON routines(template_id);
      CREATE INDEX IF NOT EXISTS idx_routine_analytics_routine_id ON routine_analytics(routine_id);
      CREATE INDEX IF NOT EXISTS idx_routine_analytics_last_completed ON routine_analytics(last_completed_at);
      CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(name);
      CREATE INDEX IF NOT EXISTS idx_workout_programs_template_id ON workout_programs(template_id);
      CREATE INDEX IF NOT EXISTS idx_workout_programs_created_at ON workout_programs(created_at);
    `;

    await this.dbConnection.execute(createTablesSQL);
  }

  /**
   * Migrate existing tables to add missing columns
   * This handles schema updates for existing databases
   */
  private async migrateTables(): Promise<void> {
    if (!this.dbConnection) {
      throw new Error("Database connection not initialized");
    }

    // Migrate workout_programs table
    await this.migrateWorkoutProgramsTable();
    
    // Migrate workouts table
    await this.migrateWorkoutsTable();
  }

  private async migrateWorkoutProgramsTable(): Promise<void> {
    if (!this.dbConnection) {
      throw new Error("Database connection not initialized");
    }

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
    if (!this.dbConnection) {
      throw new Error("Database connection not initialized");
    }

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

  /**
   * Get the Drizzle database instance
   */
  getDb() {
    // If running on web (not native), throw a helpful error
    if (!Capacitor.isNativePlatform()) {
      throw new Error(
        "SQLite database is only available on native platforms (iOS/Android). " +
          "This app must be run on a device or simulator."
      );
    }

    if (!this.drizzleDb || !this.isInitialized) {
      throw new Error("Database not initialized. Call initialize() first.");
    }
    return this.drizzleDb;
  }

  /**
   * Get the raw SQLite connection for direct queries
   */
  getConnection(): SQLiteDBConnection {
    if (!this.dbConnection) {
      throw new Error("Database connection not initialized");
    }
    return this.dbConnection;
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    if (this.dbConnection) {
      await this.dbConnection.close();
      this.dbConnection = null;
      this.drizzleDb = null;
      this.isInitialized = false;
    }
  }

  /**
   * Delete the database completely
   */
  async deleteDatabase(): Promise<void> {
    try {
      await this.close();
      // Close and delete the connection
      await this.sqliteConnection.closeConnection("fitness-db", false);
      await CapacitorSQLite.deleteDatabase({ database: "fitness-db" });
      console.log("✅ Database deleted successfully");
    } catch (error) {
      console.error("❌ Failed to delete database:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const dbManager = new DatabaseManager();

// Export convenience function to get the Drizzle DB
export const getDb = () => dbManager.getDb();

// Export the schema for use in repositories
export { schema };
