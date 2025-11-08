/**
 * Database Adapter Interface
 * Provides a common interface for both Dexie (web) and SQLite (native) implementations
 */

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

export interface IDatabaseAdapter {
  // Initialization
  initialize(): Promise<void>;
  close(): Promise<void>;
  deleteDatabase(): Promise<void>;

  // Workouts
  workouts: {
    getAll(): Promise<Workout[]>;
    getById(id: string): Promise<Workout | null>;
    save(workout: Workout): Promise<string>;
    delete(id: string): Promise<void>;
    getActive(): Promise<Workout | null>;
    searchByName(query: string): Promise<Workout[]>;
  };

  // Routines
  routines: {
    getAll(): Promise<WorkoutRoutine[]>;
    getById(id: string): Promise<WorkoutRoutine | null>;
    save(routine: WorkoutRoutine): Promise<string>;
    delete(id: string): Promise<void>;
  };

  // Workout Programs
  workoutPrograms: {
    getAll(): Promise<WorkoutProgram[]>;
    getById(id: string): Promise<WorkoutProgram | null>;
    save(program: WorkoutProgram): Promise<string>;
    delete(id: string): Promise<void>;
  };

  // Exercises
  exercises: {
    getAll(): Promise<Exercise[]>;
    getById(id: string): Promise<Exercise | null>;
    save(exercise: Exercise): Promise<string>;
    delete(id: string): Promise<void>;
    bulkInsert(exercises: Exercise[]): Promise<void>;
    clear(): Promise<void>;
  };

  // Body Parts
  bodyParts: {
    getAll(): Promise<BodyPart[]>;
    getByName(name: string): Promise<BodyPart | null>;
    save(bodyPart: BodyPart): Promise<string>;
    delete(name: string): Promise<void>;
    bulkInsert(bodyParts: BodyPart[]): Promise<void>;
    clear(): Promise<void>;
  };

  // Equipment
  equipment: {
    getAll(): Promise<Equipment[]>;
    getByName(name: string): Promise<Equipment | null>;
    save(equipment: Equipment): Promise<string>;
    delete(name: string): Promise<void>;
    bulkInsert(equipment: Equipment[]): Promise<void>;
    clear(): Promise<void>;
  };

  // Muscles
  muscles: {
    getAll(): Promise<Muscle[]>;
    getByName(name: string): Promise<Muscle | null>;
    save(muscle: Muscle): Promise<string>;
    delete(name: string): Promise<void>;
    bulkInsert(muscles: Muscle[]): Promise<void>;
    clear(): Promise<void>;
  };

  // App Settings
  settings: {
    get(key: string): Promise<any | null>;
    set(key: string, value: any): Promise<void>;
    delete(key: string): Promise<void>;
  };

  // Foods
  foods: {
    getAll(): Promise<Food[]>;
    getById(id: string): Promise<Food | null>;
    save(food: Food): Promise<string>;
    delete(id: string): Promise<void>;
    searchByName(query: string): Promise<Food[]>;
    findByBarcode(barcode: string): Promise<Food | null>;
    bulkInsert(foods: Food[]): Promise<void>;
  };

  // Food Logs
  foodLogs: {
    getAll(): Promise<FoodLog[]>;
    getById(id: string): Promise<FoodLog | null>;
    save(foodLog: FoodLog): Promise<string>;
    delete(id: string): Promise<void>;
    getByDate(date: string): Promise<FoodLog[]>;
    getByDateRange(startDate: string, endDate: string): Promise<FoodLog[]>;
    getByUserId(userId: string): Promise<FoodLog[]>;
  };

  // Nutrition Targets
  nutritionTargets: {
    getAll(): Promise<NutritionTarget[]>;
    getById(id: string): Promise<NutritionTarget | null>;
    save(target: NutritionTarget): Promise<string>;
    delete(id: string): Promise<void>;
    getActive(userId: string): Promise<NutritionTarget | null>;
    getByUserId(userId: string): Promise<NutritionTarget[]>;
  };

  // Body Metrics
  bodyMetrics: {
    getAll(): Promise<BodyMetric[]>;
    getById(id: string): Promise<BodyMetric | null>;
    save(metric: BodyMetric): Promise<string>;
    delete(id: string): Promise<void>;
    getByUserId(userId: string): Promise<BodyMetric[]>;
    getByDateRange(userId: string, startDate: string, endDate: string): Promise<BodyMetric[]>;
  };

  // Nutrition Analytics
  nutritionAnalytics: {
    getAll(): Promise<NutritionAnalytic[]>;
    getById(id: string): Promise<NutritionAnalytic | null>;
    save(analytic: NutritionAnalytic): Promise<string>;
    delete(id: string): Promise<void>;
    getByDate(date: string): Promise<NutritionAnalytic | null>;
    getByDateRange(startDate: string, endDate: string): Promise<NutritionAnalytic[]>;
    getByUserId(userId: string): Promise<NutritionAnalytic[]>;
  };

  // Coaching Settings
  coachingSettings: {
    getAll(): Promise<CoachingSetting[]>;
    getById(id: string): Promise<CoachingSetting | null>;
    save(setting: CoachingSetting): Promise<string>;
    delete(id: string): Promise<void>;
    getByUserId(userId: string): Promise<CoachingSetting | null>;
  };

  // Questionnaire Responses
  questionnaireResponses: {
    getAll(): Promise<QuestionnaireResponse[]>;
    getById(id: string): Promise<QuestionnaireResponse | null>;
    save(response: QuestionnaireResponse): Promise<string>;
    delete(id: string): Promise<void>;
    getByUserId(userId: string): Promise<QuestionnaireResponse[]>;
    getLatestByUserId(userId: string): Promise<QuestionnaireResponse | null>;
  };
}
