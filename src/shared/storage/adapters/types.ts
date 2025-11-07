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
import type {
  UserProfile,
  MacroPlan,
  FoodLog,
  MealTemplate,
  MealPlan,
  WaterLog,
  MacroHistory,
} from "@/features/macros/types/macro.types";

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

  // User Profile
  userProfile: {
    get(): Promise<UserProfile | null>;
    save(profile: UserProfile): Promise<string>;
    delete(): Promise<void>;
  };

  // Macro Plan
  macroPlan: {
    get(): Promise<MacroPlan | null>;
    save(plan: MacroPlan): Promise<string>;
    delete(): Promise<void>;
  };

  // Food Logs
  foodLogs: {
    getByDate(date: string): Promise<FoodLog[]>;
    getById(id: string): Promise<FoodLog | null>;
    save(log: FoodLog): Promise<string>;
    update(id: string, log: Partial<FoodLog>): Promise<void>;
    delete(id: string): Promise<void>;
    getDateRange(startDate: string, endDate: string): Promise<FoodLog[]>;
  };

  // Meal Templates
  mealTemplates: {
    getAll(): Promise<MealTemplate[]>;
    getById(id: string): Promise<MealTemplate | null>;
    save(template: MealTemplate): Promise<string>;
    delete(id: string): Promise<void>;
  };

  // Meal Plans
  mealPlans: {
    getByDate(date: string): Promise<MealPlan | null>;
    getAll(): Promise<MealPlan[]>;
    save(plan: MealPlan): Promise<string>;
    delete(id: string): Promise<void>;
    getDateRange(startDate: string, endDate: string): Promise<MealPlan[]>;
  };

  // Water Logs
  waterLogs: {
    getByDate(date: string): Promise<WaterLog[]>;
    getTotalByDate(date: string): Promise<number>;
    save(log: WaterLog): Promise<string>;
    delete(id: string): Promise<void>;
    getDateRange(startDate: string, endDate: string): Promise<WaterLog[]>;
  };

  // Macro History
  macroHistory: {
    getByDate(date: string): Promise<MacroHistory | null>;
    getAll(): Promise<MacroHistory[]>;
    save(history: MacroHistory): Promise<string>;
    delete(id: string): Promise<void>;
    getDateRange(startDate: string, endDate: string): Promise<MacroHistory[]>;
  };
}
