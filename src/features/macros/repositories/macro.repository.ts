/**
 * Macro repository for data access
 * Provides high-level interface for macro-related data operations
 */

import { getDatabase } from "@/shared/storage/database-adapter";
import { generateId } from "@/shared/utils/id";
import type {
  UserProfile,
  MacroPlan,
  FoodLog,
  MealTemplate,
  MealPlan,
  WaterLog,
  MacroHistory,
} from "../types/macro.types";

export class MacroRepository {
  /**
   * Get user profile
   */
  static async getUserProfile(): Promise<UserProfile | null> {
    const db = getDatabase();
    return await db.userProfile.get();
  }

  /**
   * Save user profile
   */
  static async saveUserProfile(profile: UserProfile): Promise<string> {
    const db = getDatabase();
    return await db.userProfile.save(profile);
  }

  /**
   * Delete user profile
   */
  static async deleteUserProfile(): Promise<void> {
    const db = getDatabase();
    await db.userProfile.delete();
  }

  /**
   * Get macro plan
   */
  static async getMacroPlan(): Promise<MacroPlan | null> {
    const db = getDatabase();
    return await db.macroPlan.get();
  }

  /**
   * Save macro plan
   */
  static async saveMacroPlan(plan: MacroPlan): Promise<string> {
    const db = getDatabase();
    return await db.macroPlan.save(plan);
  }

  /**
   * Delete macro plan
   */
  static async deleteMacroPlan(): Promise<void> {
    const db = getDatabase();
    await db.macroPlan.delete();
  }

  /**
   * Get food logs for a specific date
   */
  static async getFoodLogs(date: string): Promise<FoodLog[]> {
    const db = getDatabase();
    return await db.foodLogs.getByDate(date);
  }

  /**
   * Get food log by ID
   */
  static async getFoodLogById(id: string): Promise<FoodLog | null> {
    const db = getDatabase();
    return await db.foodLogs.getById(id);
  }

  /**
   * Add food log
   */
  static async addFoodLog(
    log: Omit<FoodLog, "id" | "createdAt">
  ): Promise<string> {
    const db = getDatabase();
    const foodLog: FoodLog = {
      ...log,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    return await db.foodLogs.save(foodLog);
  }

  /**
   * Update food log
   */
  static async updateFoodLog(
    id: string,
    updates: Partial<FoodLog>
  ): Promise<void> {
    const db = getDatabase();
    await db.foodLogs.update(id, updates);
  }

  /**
   * Delete food log
   */
  static async deleteFoodLog(id: string): Promise<void> {
    const db = getDatabase();
    await db.foodLogs.delete(id);
  }

  /**
   * Get food logs for a date range
   */
  static async getFoodLogsDateRange(
    startDate: string,
    endDate: string
  ): Promise<FoodLog[]> {
    const db = getDatabase();
    return await db.foodLogs.getDateRange(startDate, endDate);
  }

  /**
   * Get all meal templates
   */
  static async getAllMealTemplates(): Promise<MealTemplate[]> {
    const db = getDatabase();
    return await db.mealTemplates.getAll();
  }

  /**
   * Get meal template by ID
   */
  static async getMealTemplateById(id: string): Promise<MealTemplate | null> {
    const db = getDatabase();
    return await db.mealTemplates.getById(id);
  }

  /**
   * Save meal template
   */
  static async saveMealTemplate(
    template: Omit<MealTemplate, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const db = getDatabase();
    const now = new Date().toISOString();
    const mealTemplate: MealTemplate = {
      ...template,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    return await db.mealTemplates.save(mealTemplate);
  }

  /**
   * Delete meal template
   */
  static async deleteMealTemplate(id: string): Promise<void> {
    const db = getDatabase();
    await db.mealTemplates.delete(id);
  }

  /**
   * Get meal plan for a specific date
   */
  static async getMealPlan(date: string): Promise<MealPlan | null> {
    const db = getDatabase();
    return await db.mealPlans.getByDate(date);
  }

  /**
   * Get all meal plans
   */
  static async getAllMealPlans(): Promise<MealPlan[]> {
    const db = getDatabase();
    return await db.mealPlans.getAll();
  }

  /**
   * Save meal plan
   */
  static async saveMealPlan(
    plan: Omit<MealPlan, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const db = getDatabase();
    const now = new Date().toISOString();
    const mealPlan: MealPlan = {
      ...plan,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    return await db.mealPlans.save(mealPlan);
  }

  /**
   * Delete meal plan
   */
  static async deleteMealPlan(id: string): Promise<void> {
    const db = getDatabase();
    await db.mealPlans.delete(id);
  }

  /**
   * Get meal plans for a date range
   */
  static async getMealPlansDateRange(
    startDate: string,
    endDate: string
  ): Promise<MealPlan[]> {
    const db = getDatabase();
    return await db.mealPlans.getDateRange(startDate, endDate);
  }

  /**
   * Get water logs for a specific date
   */
  static async getWaterLogs(date: string): Promise<WaterLog[]> {
    const db = getDatabase();
    return await db.waterLogs.getByDate(date);
  }

  /**
   * Get total water intake for a specific date
   */
  static async getWaterTotal(date: string): Promise<number> {
    const db = getDatabase();
    return await db.waterLogs.getTotalByDate(date);
  }

  /**
   * Add water log
   */
  static async addWaterLog(
    log: Omit<WaterLog, "id" | "createdAt">
  ): Promise<string> {
    const db = getDatabase();
    const waterLog: WaterLog = {
      ...log,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    return await db.waterLogs.save(waterLog);
  }

  /**
   * Delete water log
   */
  static async deleteWaterLog(id: string): Promise<void> {
    const db = getDatabase();
    await db.waterLogs.delete(id);
  }

  /**
   * Get water logs for a date range
   */
  static async getWaterLogsDateRange(
    startDate: string,
    endDate: string
  ): Promise<WaterLog[]> {
    const db = getDatabase();
    return await db.waterLogs.getDateRange(startDate, endDate);
  }

  /**
   * Get macro history for a specific date
   */
  static async getMacroHistory(date: string): Promise<MacroHistory | null> {
    const db = getDatabase();
    return await db.macroHistory.getByDate(date);
  }

  /**
   * Get all macro history
   */
  static async getAllMacroHistory(): Promise<MacroHistory[]> {
    const db = getDatabase();
    return await db.macroHistory.getAll();
  }

  /**
   * Save macro history
   */
  static async saveMacroHistory(
    history: Omit<MacroHistory, "id" | "createdAt">
  ): Promise<string> {
    const db = getDatabase();
    const macroHistory: MacroHistory = {
      ...history,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    return await db.macroHistory.save(macroHistory);
  }

  /**
   * Delete macro history
   */
  static async deleteMacroHistory(id: string): Promise<void> {
    const db = getDatabase();
    await db.macroHistory.delete(id);
  }

  /**
   * Get macro history for a date range
   */
  static async getMacroHistoryDateRange(
    startDate: string,
    endDate: string
  ): Promise<MacroHistory[]> {
    const db = getDatabase();
    return await db.macroHistory.getDateRange(startDate, endDate);
  }
}
