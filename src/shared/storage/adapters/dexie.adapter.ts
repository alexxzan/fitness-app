/**
 * Dexie Database Adapter (for Web)
 * Uses IndexedDB via Dexie.js for fast web development
 */

import Dexie, { Table } from "dexie";
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
import type { RoutineAnalytics } from "@/features/workouts/types/analytics.types";
import type {
  UserProfile,
  MacroPlan,
  FoodLog,
  MealTemplate,
  MealPlan,
  WaterLog,
  MacroHistory,
} from "@/features/macros/types/macro.types";

class FitnessDexieDB extends Dexie {
  workouts!: Table<Workout, string>;
  routines!: Table<WorkoutRoutine, string>;
  workoutPrograms!: Table<WorkoutProgram, string>;
  routineAnalytics!: Table<RoutineAnalytics, string>;
  exercises!: Table<Exercise, string>;
  bodyParts!: Table<BodyPart, string>;
  equipment!: Table<Equipment, string>;
  muscles!: Table<Muscle, string>;
  appSettings!: Table<{ key: string; value: any }, string>;
  userProfile!: Table<UserProfile, string>;
  macroPlan!: Table<MacroPlan, string>;
  foodLogs!: Table<FoodLog, string>;
  mealTemplates!: Table<MealTemplate, string>;
  mealPlans!: Table<MealPlan, string>;
  waterLogs!: Table<WaterLog, string>;
  macroHistory!: Table<MacroHistory, string>;

  constructor() {
    super("FitnessDatabase");

    // Schema matching the SQLite structure
    // Version 1: Original schema
    this.version(1).stores({
      workouts: "id, name, createdAt, startTime, endTime",
      routines: "id, name, createdAt",
      exercises: "exerciseId, name, *bodyParts, *equipments, *targetMuscles",
      bodyParts: "name",
      equipment: "name",
      muscles: "name",
      appSettings: "key",
    });

    // Version 2: Add routine analytics and new workout/routine fields
    this.version(2).stores({
      workouts: "id, name, createdAt, startTime, endTime, routineId, completed",
      routines: "id, name, createdAt, type, templateId, isFavorite",
      routineAnalytics: "id, routineId, lastCompletedAt",
      exercises: "exerciseId, name, *bodyParts, *equipments, *targetMuscles",
      bodyParts: "name",
      equipment: "name",
      muscles: "name",
      appSettings: "key",
    });

    // Version 3: Add workout programs
    // Note: programId is stored in workout objects but not indexed
    this.version(3).stores({
      workouts: "id, name, createdAt, startTime, endTime, routineId, completed",
      routines: "id, name, createdAt, type, templateId, isFavorite",
      workoutPrograms: "id, name, createdAt, templateId",
      routineAnalytics: "id, routineId, lastCompletedAt",
      exercises: "exerciseId, name, *bodyParts, *equipments, *targetMuscles",
      bodyParts: "name",
      equipment: "name",
      muscles: "name",
      appSettings: "key",
    });

    // Version 4: Add macro tracking tables
    this.version(4).stores({
      workouts: "id, name, createdAt, startTime, endTime, routineId, completed",
      routines: "id, name, createdAt, type, templateId, isFavorite",
      workoutPrograms: "id, name, createdAt, templateId",
      routineAnalytics: "id, routineId, lastCompletedAt",
      exercises: "exerciseId, name, *bodyParts, *equipments, *targetMuscles",
      bodyParts: "name",
      equipment: "name",
      muscles: "name",
      appSettings: "key",
      userProfile: "id",
      macroPlan: "id",
      foodLogs: "id, date, mealType",
      mealTemplates: "id, name, createdAt",
      mealPlans: "id, date",
      waterLogs: "id, date, timestamp",
      macroHistory: "id, date",
    });
  }
}

export class DexieAdapter implements IDatabaseAdapter {
  private db: FitnessDexieDB;
  private isInitialized = false;

  constructor() {
    this.db = new FitnessDexieDB();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.db.open();
      this.isInitialized = true;
      console.log("✅ Dexie (IndexedDB) initialized for web");
    } catch (error) {
      console.error("❌ Failed to initialize Dexie:", error);
      throw error;
    }
  }

  async close(): Promise<void> {
    this.db.close();
    this.isInitialized = false;
  }

  async deleteDatabase(): Promise<void> {
    await this.close();
    await this.db.delete();
    await this.initialize();
  }

  // Workouts
  workouts = {
    getAll: async (): Promise<Workout[]> => {
      return await this.db.workouts.orderBy("createdAt").reverse().toArray();
    },

    getById: async (id: string): Promise<Workout | null> => {
      return (await this.db.workouts.get(id)) ?? null;
    },

    save: async (workout: Workout): Promise<string> => {
      return await this.db.workouts.put(workout);
    },

    delete: async (id: string): Promise<void> => {
      await this.db.workouts.delete(id);
    },

    getActive: async (): Promise<Workout | null> => {
      const allWorkouts = await this.db.workouts.toArray();
      return (
        allWorkouts.find(
          (w) =>
            (!w.endTime || w.endTime === "" || w.endTime === null) &&
            (w.completed === undefined || w.completed === false)
        ) ?? null
      );
    },

    searchByName: async (query: string): Promise<Workout[]> => {
      const lowerQuery = query.toLowerCase();
      return await this.db.workouts
        .filter((workout) => workout.name.toLowerCase().includes(lowerQuery))
        .toArray();
    },
  };

  // Routines
  routines = {
    getAll: async (): Promise<WorkoutRoutine[]> => {
      return await this.db.routines.orderBy("createdAt").reverse().toArray();
    },

    getById: async (id: string): Promise<WorkoutRoutine | null> => {
      return (await this.db.routines.get(id)) ?? null;
    },

    save: async (routine: WorkoutRoutine): Promise<string> => {
      return await this.db.routines.put(routine);
    },

    delete: async (id: string): Promise<void> => {
      await this.db.routines.delete(id);
    },
  };

  // Workout Programs
  workoutPrograms = {
    getAll: async (): Promise<WorkoutProgram[]> => {
      return await this.db.workoutPrograms
        .orderBy("createdAt")
        .reverse()
        .toArray();
    },

    getById: async (id: string): Promise<WorkoutProgram | null> => {
      return (await this.db.workoutPrograms.get(id)) ?? null;
    },

    save: async (program: WorkoutProgram): Promise<string> => {
      return await this.db.workoutPrograms.put(program);
    },

    delete: async (id: string): Promise<void> => {
      await this.db.workoutPrograms.delete(id);
    },
  };

  // Exercises
  exercises = {
    getAll: async (): Promise<Exercise[]> => {
      return await this.db.exercises.orderBy("name").toArray();
    },

    getById: async (id: string): Promise<Exercise | null> => {
      return (await this.db.exercises.get(id)) ?? null;
    },

    save: async (exercise: Exercise): Promise<string> => {
      return await this.db.exercises.put(exercise);
    },

    delete: async (id: string): Promise<void> => {
      await this.db.exercises.delete(id);
    },

    bulkInsert: async (exercises: Exercise[]): Promise<void> => {
      await this.db.exercises.bulkPut(exercises);
    },

    clear: async (): Promise<void> => {
      await this.db.exercises.clear();
    },
  };

  // Body Parts
  bodyParts = {
    getAll: async (): Promise<BodyPart[]> => {
      return await this.db.bodyParts.orderBy("name").toArray();
    },

    getByName: async (name: string): Promise<BodyPart | null> => {
      return (await this.db.bodyParts.get(name)) ?? null;
    },

    save: async (bodyPart: BodyPart): Promise<string> => {
      return await this.db.bodyParts.put(bodyPart);
    },

    delete: async (name: string): Promise<void> => {
      await this.db.bodyParts.delete(name);
    },

    bulkInsert: async (bodyParts: BodyPart[]): Promise<void> => {
      await this.db.bodyParts.bulkPut(bodyParts);
    },

    clear: async (): Promise<void> => {
      await this.db.bodyParts.clear();
    },
  };

  // Equipment
  equipment = {
    getAll: async (): Promise<Equipment[]> => {
      return await this.db.equipment.orderBy("name").toArray();
    },

    getByName: async (name: string): Promise<Equipment | null> => {
      return (await this.db.equipment.get(name)) ?? null;
    },

    save: async (equipment: Equipment): Promise<string> => {
      return await this.db.equipment.put(equipment);
    },

    delete: async (name: string): Promise<void> => {
      await this.db.equipment.delete(name);
    },

    bulkInsert: async (equipment: Equipment[]): Promise<void> => {
      await this.db.equipment.bulkPut(equipment);
    },

    clear: async (): Promise<void> => {
      await this.db.equipment.clear();
    },
  };

  // Muscles
  muscles = {
    getAll: async (): Promise<Muscle[]> => {
      return await this.db.muscles.orderBy("name").toArray();
    },

    getByName: async (name: string): Promise<Muscle | null> => {
      return (await this.db.muscles.get(name)) ?? null;
    },

    save: async (muscle: Muscle): Promise<string> => {
      return await this.db.muscles.put(muscle);
    },

    delete: async (name: string): Promise<void> => {
      await this.db.muscles.delete(name);
    },

    bulkInsert: async (muscles: Muscle[]): Promise<void> => {
      await this.db.muscles.bulkPut(muscles);
    },

    clear: async (): Promise<void> => {
      await this.db.muscles.clear();
    },
  };

  // App Settings
  settings = {
    get: async (key: string): Promise<any | null> => {
      const setting = await this.db.appSettings.get(key);
      return setting?.value ?? null;
    },

    set: async (key: string, value: any): Promise<void> => {
      await this.db.appSettings.put({ key, value });
    },

    delete: async (key: string): Promise<void> => {
      await this.db.appSettings.delete(key);
    },
  };

  // User Profile
  userProfile = {
    get: async (): Promise<UserProfile | null> => {
      const profiles = await this.db.userProfile.toArray();
      return profiles.length > 0 ? profiles[0] : null;
    },

    save: async (profile: UserProfile): Promise<string> => {
      // Delete existing profile first (only one profile allowed)
      await this.db.userProfile.clear();
      await this.db.userProfile.add(profile);
      return profile.id;
    },

    delete: async (): Promise<void> => {
      await this.db.userProfile.clear();
    },
  };

  // Macro Plan
  macroPlan = {
    get: async (): Promise<MacroPlan | null> => {
      const plans = await this.db.macroPlan.toArray();
      return plans.length > 0 ? plans[0] : null;
    },

    save: async (plan: MacroPlan): Promise<string> => {
      // Delete existing plan first (only one plan allowed)
      await this.db.macroPlan.clear();
      await this.db.macroPlan.add(plan);
      return plan.id;
    },

    delete: async (): Promise<void> => {
      await this.db.macroPlan.clear();
    },
  };

  // Food Logs
  foodLogs = {
    getByDate: async (date: string): Promise<FoodLog[]> => {
      return await this.db.foodLogs
        .where("date")
        .equals(date)
        .sortBy("createdAt");
    },

    getById: async (id: string): Promise<FoodLog | null> => {
      return (await this.db.foodLogs.get(id)) ?? null;
    },

    save: async (log: FoodLog): Promise<string> => {
      await this.db.foodLogs.put(log);
      return log.id;
    },

    update: async (id: string, log: Partial<FoodLog>): Promise<void> => {
      const existing = await this.db.foodLogs.get(id);
      if (existing) {
        await this.db.foodLogs.put({ ...existing, ...log });
      }
    },

    delete: async (id: string): Promise<void> => {
      await this.db.foodLogs.delete(id);
    },

    getDateRange: async (
      startDate: string,
      endDate: string
    ): Promise<FoodLog[]> => {
      return await this.db.foodLogs
        .where("date")
        .between(startDate, endDate, true, true)
        .sortBy("date");
    },
  };

  // Meal Templates
  mealTemplates = {
    getAll: async (): Promise<MealTemplate[]> => {
      return await this.db.mealTemplates
        .orderBy("createdAt")
        .reverse()
        .toArray();
    },

    getById: async (id: string): Promise<MealTemplate | null> => {
      return (await this.db.mealTemplates.get(id)) ?? null;
    },

    save: async (template: MealTemplate): Promise<string> => {
      await this.db.mealTemplates.put(template);
      return template.id;
    },

    delete: async (id: string): Promise<void> => {
      await this.db.mealTemplates.delete(id);
    },
  };

  // Meal Plans
  mealPlans = {
    getByDate: async (date: string): Promise<MealPlan | null> => {
      return (await this.db.mealPlans.where("date").equals(date).first()) ?? null;
    },

    getAll: async (): Promise<MealPlan[]> => {
      return await this.db.mealPlans.orderBy("date").reverse().toArray();
    },

    save: async (plan: MealPlan): Promise<string> => {
      await this.db.mealPlans.put(plan);
      return plan.id;
    },

    delete: async (id: string): Promise<void> => {
      await this.db.mealPlans.delete(id);
    },

    getDateRange: async (
      startDate: string,
      endDate: string
    ): Promise<MealPlan[]> => {
      return await this.db.mealPlans
        .where("date")
        .between(startDate, endDate, true, true)
        .sortBy("date");
    },
  };

  // Water Logs
  waterLogs = {
    getByDate: async (date: string): Promise<WaterLog[]> => {
      return await this.db.waterLogs
        .where("date")
        .equals(date)
        .sortBy("timestamp");
    },

    getTotalByDate: async (date: string): Promise<number> => {
      const logs = await this.db.waterLogs
        .where("date")
        .equals(date)
        .toArray();
      return logs.reduce((sum, log) => sum + log.amount, 0);
    },

    save: async (log: WaterLog): Promise<string> => {
      await this.db.waterLogs.add(log);
      return log.id;
    },

    delete: async (id: string): Promise<void> => {
      await this.db.waterLogs.delete(id);
    },

    getDateRange: async (
      startDate: string,
      endDate: string
    ): Promise<WaterLog[]> => {
      return await this.db.waterLogs
        .where("date")
        .between(startDate, endDate, true, true)
        .sortBy("date");
    },
  };

  // Macro History
  macroHistory = {
    getByDate: async (date: string): Promise<MacroHistory | null> => {
      return (
        (await this.db.macroHistory.where("date").equals(date).first()) ?? null
      );
    },

    getAll: async (): Promise<MacroHistory[]> => {
      return await this.db.macroHistory.orderBy("date").reverse().toArray();
    },

    save: async (history: MacroHistory): Promise<string> => {
      await this.db.macroHistory.put(history);
      return history.id;
    },

    delete: async (id: string): Promise<void> => {
      await this.db.macroHistory.delete(id);
    },

    getDateRange: async (
      startDate: string,
      endDate: string
    ): Promise<MacroHistory[]> => {
      return await this.db.macroHistory
        .where("date")
        .between(startDate, endDate, true, true)
        .sortBy("date");
    },
  };
}
