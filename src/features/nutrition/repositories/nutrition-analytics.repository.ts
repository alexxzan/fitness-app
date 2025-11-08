import { getDatabase } from "@/shared/storage/database-adapter";
import type { NutritionAnalytic } from "../types/nutrition.types";
import { generateId } from "@/shared/utils/id";
import { AnalyticsService } from "../services/analytics.service";

/**
 * Repository for nutrition analytics data access using database adapter
 * Works with both Dexie (web) and SQLite (native)
 */
export class NutritionAnalyticsRepository {
  private static readonly DEFAULT_USER_ID = "default-user"; // For single-user app

  /**
   * Get all nutrition analytics
   */
  static async getAll(): Promise<NutritionAnalytic[]> {
    const db = getDatabase();
    return await db.nutritionAnalytics.getAll();
  }

  /**
   * Get a nutrition analytic by ID
   */
  static async getById(id: string): Promise<NutritionAnalytic | null> {
    const db = getDatabase();
    return await db.nutritionAnalytics.getById(id);
  }

  /**
   * Save a nutrition analytic (create or update)
   */
  static async save(analytic: NutritionAnalytic): Promise<string> {
    const db = getDatabase();
    return await db.nutritionAnalytics.save(analytic);
  }

  /**
   * Create or update analytics for a specific date
   */
  static async createOrUpdateForDate(date: string): Promise<NutritionAnalytic> {
    const existing = await this.getByDate(date);
    const totals = await AnalyticsService.calculateDailyTotals(date);
    const adherenceScore = await AnalyticsService.calculateAdherenceScore(date);

    const now = new Date().toISOString();
    const analytic: NutritionAnalytic = {
      id: existing?.id || generateId(),
      userId: NutritionAnalyticsRepository.DEFAULT_USER_ID,
      date,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFats: totals.fats,
      micronutrients: totals.micronutrients,
      adherenceScore: adherenceScore || undefined,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    await this.save(analytic);
    return analytic;
  }

  /**
   * Get analytics for a specific date
   */
  static async getByDate(date: string): Promise<NutritionAnalytic | null> {
    const db = getDatabase();
    return await db.nutritionAnalytics.getByDate(date);
  }

  /**
   * Get analytics for a date range
   */
  static async getByDateRange(startDate: string, endDate: string): Promise<NutritionAnalytic[]> {
    const db = getDatabase();
    return await db.nutritionAnalytics.getByDateRange(startDate, endDate);
  }

  /**
   * Get analytics for a user
   */
  static async getByUserId(userId: string = NutritionAnalyticsRepository.DEFAULT_USER_ID): Promise<NutritionAnalytic[]> {
    const db = getDatabase();
    return await db.nutritionAnalytics.getByUserId(userId);
  }

  /**
   * Delete analytics for a date
   */
  static async deleteByDate(date: string): Promise<void> {
    const analytic = await this.getByDate(date);
    if (analytic) {
      const db = getDatabase();
      await db.nutritionAnalytics.delete(analytic.id);
    }
  }
}

