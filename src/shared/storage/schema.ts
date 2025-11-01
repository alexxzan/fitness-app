import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/**
 * Workouts table
 * Stores workout sessions with exercises and sets
 */
export const workouts = sqliteTable("workouts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'regular' | 'interval'
  exercises: text("exercises").notNull(), // JSON string of WorkoutExercise[]
  intervalConfig: text("interval_config"), // JSON string of IntervalConfig
  intervalProgress: text("interval_progress"), // JSON string of IntervalProgress
  startTime: text("start_time"), // ISO date string
  endTime: text("end_time"), // ISO date string
  notes: text("notes"),
  createdAt: text("created_at").notNull(), // ISO date string
  updatedAt: text("updated_at").notNull(), // ISO date string
});

/**
 * Workout routines table
 * Stores reusable workout templates
 */
export const routines = sqliteTable("routines", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  exercises: text("exercises").notNull(), // JSON string of exercise templates
  createdAt: text("created_at").notNull(), // ISO date string
  updatedAt: text("updated_at").notNull(), // ISO date string
});

/**
 * Exercises table
 * Stores the exercise library with details and instructions
 */
export const exercises = sqliteTable("exercises", {
  exerciseId: text("exercise_id").primaryKey(),
  name: text("name").notNull(),
  gifUrl: text("gif_url").notNull(),
  equipments: text("equipments").notNull(), // JSON string array
  bodyParts: text("body_parts").notNull(), // JSON string array
  targetMuscles: text("target_muscles").notNull(), // JSON string array
  secondaryMuscles: text("secondary_muscles").notNull(), // JSON string array
  instructions: text("instructions").notNull(), // JSON string array
});

/**
 * Body parts lookup table
 */
export const bodyParts = sqliteTable("body_parts", {
  name: text("name").primaryKey(),
});

/**
 * Equipment lookup table
 */
export const equipment = sqliteTable("equipment", {
  name: text("name").primaryKey(),
});

/**
 * Muscles lookup table
 */
export const muscles = sqliteTable("muscles", {
  name: text("name").primaryKey(),
});

/**
 * App settings table
 * Stores key-value pairs for app configuration
 */
export const appSettings = sqliteTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(), // JSON string
});

// Type exports for use in repositories
export type Workout = typeof workouts.$inferSelect;
export type WorkoutInsert = typeof workouts.$inferInsert;
export type Routine = typeof routines.$inferSelect;
export type RoutineInsert = typeof routines.$inferInsert;
export type Exercise = typeof exercises.$inferSelect;
export type ExerciseInsert = typeof exercises.$inferInsert;
export type BodyPart = typeof bodyParts.$inferSelect;
export type BodyPartInsert = typeof bodyParts.$inferInsert;
export type Equipment = typeof equipment.$inferSelect;
export type EquipmentInsert = typeof equipment.$inferInsert;
export type Muscle = typeof muscles.$inferSelect;
export type MuscleInsert = typeof muscles.$inferInsert;
export type AppSetting = typeof appSettings.$inferSelect;
export type AppSettingInsert = typeof appSettings.$inferInsert;

