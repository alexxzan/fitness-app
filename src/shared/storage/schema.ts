import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

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
  // Routine tracking fields
  programId: text("program_id"), // Reference to workout_programs table
  routineId: text("routine_id"), // Reference to routines table or routine ID within program
  routineTemplateId: text("routine_template_id"), // Direct reference to template
  // Analytics fields
  completed: integer("completed").default(0), // 0 or 1 for boolean
  completionPercentage: real("completion_percentage"), // 0-100
  createdAt: text("created_at").notNull(), // ISO date string
  updatedAt: text("updated_at").notNull(), // ISO date string
});

/**
 * Workout routines table
 * Stores reusable workout templates (both custom and template-based)
 */
export const routines = sqliteTable("routines", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  exercises: text("exercises").notNull(), // JSON string of RoutineExercise[]
  type: text("type").notNull(), // 'custom' | 'template'
  templateId: text("template_id"), // Reference to workout-templates.json
  isFavorite: integer("is_favorite").default(0), // 0 or 1 for boolean
  tags: text("tags"), // JSON string array
  estimatedDuration: integer("estimated_duration"), // in minutes
  difficulty: text("difficulty"), // 'beginner' | 'intermediate' | 'advanced'
  createdAt: text("created_at").notNull(), // ISO date string
  updatedAt: text("updated_at").notNull(), // ISO date string
});

/**
 * Routine analytics table
 * Stores aggregated metrics for workout routines
 */
export const routineAnalytics = sqliteTable("routine_analytics", {
  id: text("id").primaryKey(),
  routineId: text("routine_id").notNull(), // Reference to routines table
  // Aggregated metrics
  totalCompletions: integer("total_completions").default(0),
  averageCompletionRate: real("average_completion_rate"), // 0-100
  totalWorkoutsStarted: integer("total_workouts_started").default(0),
  averageDuration: real("average_duration"), // in minutes
  averageVolume: real("average_volume"), // total weight lifted
  lastCompletedAt: text("last_completed_at"), // ISO date string
  lastStartedAt: text("last_started_at"), // ISO date string
  // Performance tracking
  bestVolume: real("best_volume"),
  bestDuration: real("best_duration"), // fastest completion in minutes
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
 * Workout programs table
 * Stores workout programs that contain multiple routines (e.g., PPL contains Push, Pull, Legs)
 */
export const workoutPrograms = sqliteTable("workout_programs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  templateId: text("template_id"), // Reference to workout-templates.json
  workouts: text("workouts").notNull(), // JSON string of WorkoutRoutine[]
  createdAt: text("created_at").notNull(), // ISO date string
  updatedAt: text("updated_at").notNull(), // ISO date string
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
export type RoutineAnalytics = typeof routineAnalytics.$inferSelect;
export type RoutineAnalyticsInsert = typeof routineAnalytics.$inferInsert;
export type Exercise = typeof exercises.$inferSelect;
export type ExerciseInsert = typeof exercises.$inferInsert;
export type BodyPart = typeof bodyParts.$inferSelect;
export type BodyPartInsert = typeof bodyParts.$inferInsert;
export type Equipment = typeof equipment.$inferSelect;
export type EquipmentInsert = typeof equipment.$inferInsert;
export type Muscle = typeof muscles.$inferSelect;
export type MuscleInsert = typeof muscles.$inferInsert;
export type WorkoutProgram = typeof workoutPrograms.$inferSelect;
export type WorkoutProgramInsert = typeof workoutPrograms.$inferInsert;
export type AppSetting = typeof appSettings.$inferSelect;
export type AppSettingInsert = typeof appSettings.$inferInsert;
