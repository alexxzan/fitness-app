import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

/**
 * Workouts table
 * Stores workout sessions with exercises and sets
 */
export const workouts = sqliteTable("workouts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'regular' | 'interval' | 'cardio-gps' | 'cardio-manual'
  exercises: text("exercises").notNull(), // JSON string of WorkoutExercise[] (empty [] for cardio)
  intervalConfig: text("interval_config"), // JSON string of IntervalConfig
  intervalProgress: text("interval_progress"), // JSON string of IntervalProgress
  cardioData: text("cardio_data"), // JSON string of CardioData
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
 * Foods table
 * Stores food database (verified + user-submitted)
 */
export const foods = sqliteTable("foods", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand"),
  barcode: text("barcode"), // Barcode for quick lookup
  servingSize: text("serving_size").notNull(), // JSON string: { amount: number, unit: string }
  calories: real("calories").notNull(), // per serving
  protein: real("protein").notNull(), // grams per serving
  carbs: real("carbs").notNull(), // grams per serving
  fats: real("fats").notNull(), // grams per serving
  micronutrients: text("micronutrients"), // JSON string of micronutrient values
  verified: integer("verified").default(0), // 0 or 1 for boolean
  userSubmitted: integer("user_submitted").default(0), // 0 or 1 for boolean
  createdAt: text("created_at").notNull(), // ISO date string
  updatedAt: text("updated_at").notNull(), // ISO date string
});

/**
 * Food logs table
 * Stores daily food entries
 */
export const foodLogs = sqliteTable("food_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(), // For future multi-user support
  date: text("date").notNull(), // ISO date string (date only)
  foodId: text("food_id").notNull(), // Reference to foods table
  quantity: real("quantity").notNull(), // Multiplier for serving size
  mealType: text("meal_type"), // 'breakfast' | 'lunch' | 'dinner' | 'snack' | null
  createdAt: text("created_at").notNull(), // ISO date string
});

/**
 * Nutrition targets table
 * Stores user macro/calorie targets
 */
export const nutritionTargets = sqliteTable("nutrition_targets", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  calories: real("calories").notNull(),
  protein: real("protein").notNull(), // grams
  carbs: real("carbs").notNull(), // grams
  fats: real("fats").notNull(), // grams
  startDate: text("start_date").notNull(), // ISO date string
  endDate: text("end_date"), // ISO date string (null for active target)
  goalType: text("goal_type").notNull(), // 'cutting' | 'bulking' | 'maintenance'
  createdAt: text("created_at").notNull(), // ISO date string
  updatedAt: text("updated_at").notNull(), // ISO date string
});

/**
 * Body metrics table
 * Stores weight, measurements, photos
 */
export const bodyMetrics = sqliteTable("body_metrics", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: text("date").notNull(), // ISO date string
  weight: real("weight"), // kg
  bodyFat: real("body_fat"), // percentage
  measurements: text("measurements"), // JSON string: { chest, waist, hips, etc. }
  photoPaths: text("photo_paths"), // JSON string array of file paths
  notes: text("notes"),
  createdAt: text("created_at").notNull(), // ISO date string
  updatedAt: text("updated_at").notNull(), // ISO date string
});

/**
 * Nutrition analytics table
 * Stores aggregated daily/weekly/monthly stats
 */
export const nutritionAnalytics = sqliteTable("nutrition_analytics", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: text("date").notNull(), // ISO date string (date only)
  totalCalories: real("total_calories").default(0),
  totalProtein: real("total_protein").default(0), // grams
  totalCarbs: real("total_carbs").default(0), // grams
  totalFats: real("total_fats").default(0), // grams
  micronutrients: text("micronutrients"), // JSON string of micronutrient totals
  adherenceScore: real("adherence_score"), // 0-100 percentage
  createdAt: text("created_at").notNull(), // ISO date string
  updatedAt: text("updated_at").notNull(), // ISO date string
});

/**
 * Coaching settings table
 * Stores user preferences for coaching algorithm
 */
export const coachingSettings = sqliteTable("coaching_settings", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  activityLevel: text("activity_level").notNull(), // 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  gender: text("gender"), // 'male' | 'female' | 'other'
  age: integer("age"),
  height: real("height"), // cm
  initialWeight: real("initial_weight"), // kg
  goalWeight: real("goal_weight"), // kg
  preferredMacroSplit: text("preferred_macro_split"), // JSON string: { proteinPercent, carbsPercent, fatsPercent }
  recalibrationFrequency: integer("recalibration_frequency"), // days
  createdAt: text("created_at").notNull(), // ISO date string
  updatedAt: text("updated_at").notNull(), // ISO date string
});

/**
 * Questionnaire responses table
 * Stores detailed questionnaire responses for diet plan calculation
 */
export const questionnaireResponses = sqliteTable("questionnaire_responses", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  // Basic Demographics
  age: integer("age").notNull(),
  sex: text("sex").notNull(), // 'male' | 'female' | 'other'
  height: real("height").notNull(), // cm
  weight: real("weight").notNull(), // kg
  // Activity Level
  activityLevel: text("activity_level").notNull(), // 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active'
  // Dietary Preferences (JSON strings)
  dietaryRestrictions: text("dietary_restrictions"), // JSON string array
  allergies: text("allergies"), // JSON string array
  intolerances: text("intolerances"), // JSON string array
  // Goals
  primaryGoal: text("primary_goal").notNull(), // 'weight_loss' | 'muscle_gain' | 'maintenance' | 'performance'
  targetWeight: real("target_weight"), // kg
  targetDate: text("target_date"), // ISO date string
  // Lifestyle
  mealFrequency: integer("meal_frequency").notNull(), // meals per day
  fastingPreferences: text("fasting_preferences"), // JSON string array
  typicalWakeTime: text("typical_wake_time"), // HH:mm
  typicalBedTime: text("typical_bed_time"), // HH:mm
  // Optional (JSON strings)
  medicalConditions: text("medical_conditions"), // JSON string array
  medications: text("medications"), // JSON string array
  foodDislikes: text("food_dislikes"), // JSON string array
  foodFavorites: text("food_favorites"), // JSON string array
  // Metadata
  completedAt: text("completed_at").notNull(), // ISO date string
  createdAt: text("created_at").notNull(), // ISO date string
  updatedAt: text("updated_at").notNull(), // ISO date string
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
export type Food = typeof foods.$inferSelect;
export type FoodInsert = typeof foods.$inferInsert;
export type FoodLog = typeof foodLogs.$inferSelect;
export type FoodLogInsert = typeof foodLogs.$inferInsert;
export type NutritionTarget = typeof nutritionTargets.$inferSelect;
export type NutritionTargetInsert = typeof nutritionTargets.$inferInsert;
export type BodyMetric = typeof bodyMetrics.$inferSelect;
export type BodyMetricInsert = typeof bodyMetrics.$inferInsert;
export type NutritionAnalytic = typeof nutritionAnalytics.$inferSelect;
export type NutritionAnalyticInsert = typeof nutritionAnalytics.$inferInsert;
export type CoachingSetting = typeof coachingSettings.$inferSelect;
export type CoachingSettingInsert = typeof coachingSettings.$inferInsert;
export type QuestionnaireResponse = typeof questionnaireResponses.$inferSelect;
export type QuestionnaireResponseInsert =
  typeof questionnaireResponses.$inferInsert;
