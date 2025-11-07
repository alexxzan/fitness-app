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
  isEnabled: integer("is_enabled").default(0), // 0 or 1 for boolean - indicates if user has selected/enabled this program
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

/**
 * User profile table
 * Stores user physical data and preferences for macro calculations
 */
export const userProfile = sqliteTable("user_profile", {
  id: text("id").primaryKey(),
  height: real("height").notNull(), // in cm
  weight: real("weight").notNull(), // in kg
  age: integer("age").notNull(),
  gender: text("gender").notNull(), // 'male' | 'female' | 'other'
  activityLevel: text("activity_level").notNull(), // ActivityLevel enum
  goal: text("goal").notNull(), // Goal enum
  proteinPreference: text("protein_preference"), // MacroPreference enum
  carbPreference: text("carb_preference"), // MacroPreference enum
  dietaryRestrictions: text("dietary_restrictions"), // JSON string array
  bodyFatPercentage: real("body_fat_percentage"), // Optional
  createdAt: text("created_at").notNull(), // ISO date string
  updatedAt: text("updated_at").notNull(), // ISO date string
});

/**
 * Macro plan table
 * Stores calculated macro targets for the user
 */
export const macroPlan = sqliteTable("macro_plan", {
  id: text("id").primaryKey(),
  userId: text("user_id"), // For future multi-user support
  dailyCalories: real("daily_calories").notNull(),
  protein: real("protein").notNull(), // in grams
  carbs: real("carbs").notNull(), // in grams
  fats: real("fats").notNull(), // in grams
  waterGoal: real("water_goal").notNull(), // in ml
  calculationMethod: text("calculation_method").notNull(), // MacroCalculationMethod enum
  createdAt: text("created_at").notNull(), // ISO date string
  updatedAt: text("updated_at").notNull(), // ISO date string
});

/**
 * Food logs table
 * Stores individual food entries logged by the user
 */
export const foodLogs = sqliteTable("food_logs", {
  id: text("id").primaryKey(),
  date: text("date").notNull(), // ISO date string (YYYY-MM-DD)
  mealType: text("meal_type").notNull(), // MealType enum
  foodName: text("food_name").notNull(),
  calories: real("calories").notNull(),
  protein: real("protein").notNull(), // in grams
  carbs: real("carbs").notNull(), // in grams
  fats: real("fats").notNull(), // in grams
  notes: text("notes"),
  createdAt: text("created_at").notNull(), // ISO date string
});

/**
 * Meal templates table
 * Stores saved meal combinations for quick entry
 */
export const mealTemplates = sqliteTable("meal_templates", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  foods: text("foods").notNull(), // JSON string of FoodItem[]
  totalCalories: real("total_calories").notNull(),
  totalProtein: real("total_protein").notNull(),
  totalCarbs: real("total_carbs").notNull(),
  totalFats: real("total_fats").notNull(),
  createdAt: text("created_at").notNull(), // ISO date string
  updatedAt: text("updated_at").notNull(), // ISO date string
});

/**
 * Meal plans table
 * Stores planned meals for future dates
 */
export const mealPlans = sqliteTable("meal_plans", {
  id: text("id").primaryKey(),
  date: text("date").notNull(), // ISO date string (YYYY-MM-DD)
  meals: text("meals").notNull(), // JSON string of PlannedMeal[]
  isCompleted: integer("is_completed").default(0), // 0 or 1 for boolean
  createdAt: text("created_at").notNull(), // ISO date string
  updatedAt: text("updated_at").notNull(), // ISO date string
});

/**
 * Water logs table
 * Stores water intake entries
 */
export const waterLogs = sqliteTable("water_logs", {
  id: text("id").primaryKey(),
  date: text("date").notNull(), // ISO date string (YYYY-MM-DD)
  amount: real("amount").notNull(), // in ml
  timestamp: text("timestamp").notNull(), // ISO date string
  createdAt: text("created_at").notNull(), // ISO date string
});

/**
 * Macro history table
 * Stores daily aggregated macro data for analytics
 */
export const macroHistory = sqliteTable("macro_history", {
  id: text("id").primaryKey(),
  date: text("date").notNull(), // ISO date string (YYYY-MM-DD)
  totalCalories: real("total_calories").notNull(),
  totalProtein: real("total_protein").notNull(),
  totalCarbs: real("total_carbs").notNull(),
  totalFats: real("total_fats").notNull(),
  waterIntake: real("water_intake").notNull(), // in ml
  createdAt: text("created_at").notNull(), // ISO date string
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
export type UserProfile = typeof userProfile.$inferSelect;
export type UserProfileInsert = typeof userProfile.$inferInsert;
export type MacroPlan = typeof macroPlan.$inferSelect;
export type MacroPlanInsert = typeof macroPlan.$inferInsert;
export type FoodLog = typeof foodLogs.$inferSelect;
export type FoodLogInsert = typeof foodLogs.$inferInsert;
export type MealTemplate = typeof mealTemplates.$inferSelect;
export type MealTemplateInsert = typeof mealTemplates.$inferInsert;
export type MealPlan = typeof mealPlans.$inferSelect;
export type MealPlanInsert = typeof mealPlans.$inferInsert;
export type WaterLog = typeof waterLogs.$inferSelect;
export type WaterLogInsert = typeof waterLogs.$inferInsert;
export type MacroHistory = typeof macroHistory.$inferSelect;
export type MacroHistoryInsert = typeof macroHistory.$inferInsert;
