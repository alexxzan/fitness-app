import { FoodLogRepository } from "../repositories/food-log.repository";
import { FoodRepository } from "../repositories/food.repository";
import { NutritionTargetsRepository } from "../repositories/nutrition-targets.repository";
import { MicronutrientCalculatorService } from "./micronutrient-calculator.service";
import { CoachingService } from "./coaching.service";
import type { MacroTargets, DailyNutritionSummary } from "../types/nutrition.types";
import type { MicronutrientValues } from "../types/micronutrients.types";

/**
 * Service for aggregating nutrition analytics
 */
export class AnalyticsService {
  /**
   * Calculate daily nutrition totals from food logs
   */
  static async calculateDailyTotals(date: string): Promise<MacroTargets & { micronutrients?: string }> {
    const foodLogs = await FoodLogRepository.getByDate(date);
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fats = 0;

    for (const log of foodLogs) {
      const food = await FoodRepository.getById(log.foodId);
      if (food) {
        const multiplier = log.quantity;
        calories += food.calories * multiplier;
        protein += food.protein * multiplier;
        carbs += food.carbs * multiplier;
        fats += food.fats * multiplier;
      }
    }

    // Calculate micronutrients
    const micronutrients = await MicronutrientCalculatorService.calculateTotals(foodLogs);
    const micronutrientsString = MicronutrientCalculatorService.formatMicronutrients(micronutrients);

    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fats: Math.round(fats),
      micronutrients: micronutrientsString,
    };
  }

  /**
   * Calculate adherence score for a date
   */
  static async calculateAdherenceScore(date: string): Promise<number | null> {
    const totals = await this.calculateDailyTotals(date);
    const activeTarget = await NutritionTargetsRepository.getActive();

    if (!activeTarget) {
      return null;
    }

    const target: MacroTargets = {
      calories: activeTarget.calories,
      protein: activeTarget.protein,
      carbs: activeTarget.carbs,
      fats: activeTarget.fats,
    };

    return CoachingService.calculateAdherenceScore(totals, target);
  }

  /**
   * Get daily nutrition summary
   */
  static async getDailySummary(date: string): Promise<DailyNutritionSummary> {
    const totals = await this.calculateDailyTotals(date);
    const adherenceScore = await this.calculateAdherenceScore(date);

    return {
      date,
      calories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fats: totals.fats,
      adherenceScore: adherenceScore || undefined,
    };
  }

  /**
   * Get weekly averages
   */
  static async getWeeklyAverages(endDate: string): Promise<MacroTargets> {
    const startDate = new Date(new Date(endDate).getTime() - 6 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const summaries: DailyNutritionSummary[] = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const summary = await this.getDailySummary(dateStr);
      summaries.push(summary);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const totals = summaries.reduce(
      (acc, summary) => ({
        calories: acc.calories + summary.calories,
        protein: acc.protein + summary.protein,
        carbs: acc.carbs + summary.carbs,
        fats: acc.fats + summary.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    const count = summaries.length || 1;

    return {
      calories: Math.round(totals.calories / count),
      protein: Math.round(totals.protein / count),
      carbs: Math.round(totals.carbs / count),
      fats: Math.round(totals.fats / count),
    };
  }

  /**
   * Get monthly averages
   */
  static async getMonthlyAverages(endDate: string): Promise<MacroTargets> {
    const startDate = new Date(new Date(endDate).getTime() - 29 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const summaries: DailyNutritionSummary[] = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const summary = await this.getDailySummary(dateStr);
      summaries.push(summary);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const totals = summaries.reduce(
      (acc, summary) => ({
        calories: acc.calories + summary.calories,
        protein: acc.protein + summary.protein,
        carbs: acc.carbs + summary.carbs,
        fats: acc.fats + summary.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    const count = summaries.length || 1;

    return {
      calories: Math.round(totals.calories / count),
      protein: Math.round(totals.protein / count),
      carbs: Math.round(totals.carbs / count),
      fats: Math.round(totals.fats / count),
    };
  }

  /**
   * Generate insights based on analytics
   */
  static async generateInsights(date: string): Promise<string[]> {
    const summary = await this.getDailySummary(date);
    const insights: string[] = [];

    if (summary.adherenceScore !== undefined) {
      if (summary.adherenceScore >= 90) {
        insights.push("Excellent adherence! You're hitting your targets consistently.");
      } else if (summary.adherenceScore >= 70) {
        insights.push("Good adherence. Keep tracking to maintain consistency.");
      } else if (summary.adherenceScore < 50) {
        insights.push("Consider adjusting your targets or logging more consistently.");
      }
    }

    const activeTarget = await NutritionTargetsRepository.getActive();
    if (activeTarget) {
      const proteinPercent = (summary.protein / activeTarget.protein) * 100;
      if (proteinPercent < 80) {
        insights.push("Protein intake is below target. Consider adding more protein-rich foods.");
      }

      const calorieDiff = summary.calories - activeTarget.calories;
      if (Math.abs(calorieDiff) > 200) {
        if (calorieDiff > 0) {
          insights.push(`You're ${Math.round(calorieDiff)} calories over your target today.`);
        } else {
          insights.push(`You're ${Math.round(Math.abs(calorieDiff))} calories under your target today.`);
        }
      }
    }

    return insights;
  }
}

