import { ExpenditureCalculatorService } from "./expenditure-calculator.service";
import type { CoachingSetting, MacroSplit, GoalType, CoachingInsight } from "../types/coaching.types";
import type { MacroTargets } from "../types/nutrition.types";

/**
 * Service for nutrition coaching algorithms
 */
export class CoachingService {
  /**
   * Calculate macro targets based on TDEE and goal type
   */
  static calculateMacroTargets(
    tdee: number,
    goalType: GoalType,
    preferredSplit?: MacroSplit
  ): MacroTargets {
    // Adjust calories for goal
    const targetCalories = ExpenditureCalculatorService.adjustTDEEForGoal(tdee, goalType);

    // Default macro splits (as percentages of calories)
    let proteinPercent = 30;
    let carbsPercent = 35;
    let fatsPercent = 35;

    // Use preferred split if provided
    if (preferredSplit) {
      proteinPercent = preferredSplit.proteinPercent;
      carbsPercent = preferredSplit.carbsPercent;
      fatsPercent = preferredSplit.fatsPercent;
    } else {
      // Adjust defaults based on goal type
      if (goalType === "cutting") {
        // Higher protein for cutting
        proteinPercent = 35;
        carbsPercent = 30;
        fatsPercent = 35;
      } else if (goalType === "bulking") {
        // Higher carbs for bulking
        proteinPercent = 25;
        carbsPercent = 45;
        fatsPercent = 30;
      }
    }

    // Convert percentages to grams
    // Protein: 4 calories per gram
    // Carbs: 4 calories per gram
    // Fats: 9 calories per gram
    const protein = Math.round((targetCalories * proteinPercent) / 100 / 4);
    const carbs = Math.round((targetCalories * carbsPercent) / 100 / 4);
    const fats = Math.round((targetCalories * fatsPercent) / 100 / 9);

    return {
      calories: Math.round(targetCalories),
      protein,
      carbs,
      fats,
    };
  }

  /**
   * Calculate macro targets from coaching settings
   */
  static calculateMacroTargetsFromSettings(settings: CoachingSetting): MacroTargets | null {
    const tdeeEstimate = ExpenditureCalculatorService.calculateTDEEFromSettings(settings);
    if (!tdeeEstimate) {
      return null;
    }

    const preferredSplit = settings.preferredMacroSplit
      ? (JSON.parse(settings.preferredMacroSplit) as MacroSplit)
      : undefined;

    return this.calculateMacroTargets(tdeeEstimate.tdee, settings.activityLevel as GoalType, preferredSplit);
  }

  /**
   * Calculate adherence score (0-100) based on actual vs target macros
   */
  static calculateAdherenceScore(
    actual: MacroTargets,
    target: MacroTargets
  ): number {
    // Calculate percentage differences for each macro
    const calorieDiff = Math.abs(actual.calories - target.calories) / target.calories;
    const proteinDiff = Math.abs(actual.protein - target.protein) / target.protein;
    const carbsDiff = Math.abs(actual.carbs - target.carbs) / target.carbs;
    const fatsDiff = Math.abs(actual.fats - target.fats) / target.fats;

    // Weighted average (calories weighted more heavily)
    const averageDiff = (calorieDiff * 0.4 + proteinDiff * 0.2 + carbsDiff * 0.2 + fatsDiff * 0.2);
    
    // Convert to adherence score (0-100)
    const adherenceScore = Math.max(0, Math.min(100, (1 - averageDiff) * 100));
    
    return Math.round(adherenceScore);
  }

  /**
   * Generate coaching insights based on progress
   */
  static generateInsights(
    settings: CoachingSetting,
    currentWeight?: number,
    adherenceScore?: number,
    daysSinceStart?: number
  ): CoachingInsight[] {
    const insights: CoachingInsight[] = [];

    if (currentWeight && settings.initialWeight && daysSinceStart && daysSinceStart >= 7) {
      const weightChange = currentWeight - settings.initialWeight;
      const weeklyChange = (weightChange / daysSinceStart) * 7;

      if (settings.goalWeight) {
        const goalProgress = ((settings.initialWeight - currentWeight) / (settings.initialWeight - settings.goalWeight)) * 100;
        
        if (goalProgress > 0) {
          insights.push({
            type: "progress_update",
            message: `You're ${Math.round(goalProgress)}% of the way to your goal weight!`,
            date: new Date().toISOString(),
            data: { goalProgress, weeklyChange },
          });
        }
      }

      // Check if weight change aligns with goal
      const goalType = settings.activityLevel as GoalType;
      if (goalType === "cutting" && weeklyChange > -0.5) {
        insights.push({
          type: "target_adjustment",
          message: "Weight loss is slower than expected. Consider adjusting your calorie target.",
          date: new Date().toISOString(),
          data: { weeklyChange },
        });
      } else if (goalType === "bulking" && weeklyChange < 0.3) {
        insights.push({
          type: "target_adjustment",
          message: "Weight gain is slower than expected. Consider increasing your calorie target.",
          date: new Date().toISOString(),
          data: { weeklyChange },
        });
      }
    }

    if (adherenceScore !== undefined && adherenceScore < 70) {
      insights.push({
        type: "adherence_warning",
        message: `Your adherence score is ${adherenceScore}%. Try to stay closer to your targets for better results.`,
        date: new Date().toISOString(),
        data: { adherenceScore },
      });
    }

    return insights;
  }

  /**
   * Check if recalibration is needed
   */
  static shouldRecalibrate(
    settings: CoachingSetting,
    lastRecalibrationDate?: string
  ): boolean {
    if (!settings.recalibrationFrequency) {
      return false;
    }

    if (!lastRecalibrationDate) {
      return true; // First time
    }

    const daysSince = Math.floor(
      (new Date().getTime() - new Date(lastRecalibrationDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSince >= settings.recalibrationFrequency;
  }
}

