import type { CoachingSetting, TDEEEstimate, ActivityLevel } from "../types/coaching.types";

/**
 * Service for calculating Total Daily Energy Expenditure (TDEE)
 */
export class ExpenditureCalculatorService {
  /**
   * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor equation
   */
  static calculateBMR(weight: number, height: number, age: number, gender: "male" | "female" | "other"): number {
    // Mifflin-St Jeor equation
    // Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
    // Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161
    const baseBMR = 10 * weight + 6.25 * height - 5 * age;
    
    if (gender === "male") {
      return baseBMR + 5;
    } else if (gender === "female") {
      return baseBMR - 161;
    } else {
      // For "other", use average of male and female
      return baseBMR - 78;
    }
  }

  /**
   * Get activity multiplier based on activity level
   */
  static getActivityMultiplier(activityLevel: ActivityLevel): number {
    const multipliers: Record<ActivityLevel, number> = {
      sedentary: 1.2, // Little to no exercise
      light: 1.375, // Light exercise 1-3 days/week
      moderate: 1.55, // Moderate exercise 3-5 days/week
      active: 1.725, // Hard exercise 6-7 days/week
      very_active: 1.9, // Very hard exercise, physical job
    };
    return multipliers[activityLevel];
  }

  /**
   * Calculate TDEE (Total Daily Energy Expenditure)
   */
  static calculateTDEE(
    weight: number,
    height: number,
    age: number,
    gender: "male" | "female" | "other",
    activityLevel: ActivityLevel
  ): TDEEEstimate {
    const bmr = this.calculateBMR(weight, height, age, gender);
    const activityMultiplier = this.getActivityMultiplier(activityLevel);
    const tdee = bmr * activityMultiplier;

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      activityMultiplier,
    };
  }

  /**
   * Calculate TDEE from coaching settings
   */
  static calculateTDEEFromSettings(settings: CoachingSetting): TDEEEstimate | null {
    if (!settings.height || !settings.age || !settings.initialWeight || !settings.gender) {
      return null;
    }

    return this.calculateTDEE(
      settings.initialWeight,
      settings.height,
      settings.age,
      settings.gender,
      settings.activityLevel
    );
  }

  /**
   * Adjust TDEE based on goal type
   */
  static adjustTDEEForGoal(tdee: number, goalType: "cutting" | "bulking" | "maintenance"): number {
    switch (goalType) {
      case "cutting":
        // Deficit of 500 calories per day (approximately 1 lb per week)
        return tdee - 500;
      case "bulking":
        // Surplus of 300-500 calories per day
        return tdee + 400;
      case "maintenance":
        return tdee;
      default:
        return tdee;
    }
  }
}

