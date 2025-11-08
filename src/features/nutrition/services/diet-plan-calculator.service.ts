import { ExpenditureCalculatorService } from "./expenditure-calculator.service";
import { CoachingService } from "./coaching.service";
import type { QuestionnaireResponse } from "../types/questionnaire.types";
import type { DietPlan, MealSuggestion } from "../types/diet-plan.types";
import type { ActivityLevel } from "../types/coaching.types";

/**
 * Service for calculating personalized diet plans from questionnaire responses
 */
export class DietPlanCalculatorService {
  /**
   * Map questionnaire activity level to coaching activity level
   */
  private static mapActivityLevel(
    questionnaireLevel: QuestionnaireResponse["activityLevel"]
  ): ActivityLevel {
    const mapping: Record<
      QuestionnaireResponse["activityLevel"],
      ActivityLevel
    > = {
      sedentary: "sedentary",
      lightly_active: "light",
      moderately_active: "moderate",
      very_active: "active",
      extra_active: "very_active",
    };
    return mapping[questionnaireLevel];
  }

  /**
   * Map questionnaire goal to coaching goal type
   */
  private static mapGoalType(
    questionnaireGoal: QuestionnaireResponse["primaryGoal"]
  ): "cutting" | "bulking" | "maintenance" {
    const mapping: Record<
      QuestionnaireResponse["primaryGoal"],
      "cutting" | "bulking" | "maintenance"
    > = {
      weight_loss: "cutting",
      muscle_gain: "bulking",
      maintenance: "maintenance",
      performance: "maintenance", // Performance goals typically maintain weight
    };
    return mapping[questionnaireGoal];
  }

  /**
   * Calculate hydration needs based on weight, activity level, and sex
   */
  private static calculateHydration(
    weight: number,
    activityLevel: QuestionnaireResponse["activityLevel"],
    sex: QuestionnaireResponse["sex"]
  ): number {
    // Base hydration: 30-35ml per kg body weight
    let baseHydration = weight * 0.033; // liters

    // Adjust for activity level
    const activityMultipliers: Record<
      QuestionnaireResponse["activityLevel"],
      number
    > = {
      sedentary: 1.0,
      lightly_active: 1.1,
      moderately_active: 1.2,
      very_active: 1.3,
      extra_active: 1.4,
    };
    baseHydration *= activityMultipliers[activityLevel];

    // Slight adjustment for sex (men typically need slightly more)
    if (sex === "male") {
      baseHydration *= 1.05;
    }

    return Math.round(baseHydration * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Generate basic meal suggestions based on dietary preferences and goals
   */
  private static generateMealSuggestions(
    response: QuestionnaireResponse,
    dailyCalories: number,
    protein: number,
    carbs: number,
    fats: number
  ): MealSuggestion[] {
    const suggestions: MealSuggestion[] = [];
    const mealsPerDay = response.mealFrequency;

    // Calculate calories per meal
    const caloriesPerMeal = Math.round(dailyCalories / mealsPerDay);
    const proteinPerMeal = Math.round(protein / mealsPerDay);
    const carbsPerMeal = Math.round(carbs / mealsPerDay);
    const fatsPerMeal = Math.round(fats / mealsPerDay);

    // Check dietary restrictions
    const isVegan = response.dietaryRestrictions.includes("vegan");
    const isVegetarian = response.dietaryRestrictions.includes("vegetarian");
    const isKeto = response.dietaryRestrictions.includes("keto");

    // Breakfast suggestions
    if (mealsPerDay >= 3) {
      if (isKeto) {
        suggestions.push({
          mealType: "breakfast",
          name: "Keto Breakfast",
          description: "High-fat, low-carb breakfast",
          calories: caloriesPerMeal,
          protein: proteinPerMeal,
          carbs: Math.round(carbsPerMeal * 0.3), // Reduced carbs for keto
          fats: Math.round(fatsPerMeal * 1.2), // Higher fats for keto
        });
      } else if (isVegan) {
        suggestions.push({
          mealType: "breakfast",
          name: "Vegan Breakfast",
          description: "Plant-based breakfast options",
          calories: caloriesPerMeal,
          protein: proteinPerMeal,
          carbs: carbsPerMeal,
          fats: fatsPerMeal,
        });
      } else {
        suggestions.push({
          mealType: "breakfast",
          name: "Balanced Breakfast",
          description: "Protein-rich breakfast to start your day",
          calories: caloriesPerMeal,
          protein: proteinPerMeal,
          carbs: carbsPerMeal,
          fats: fatsPerMeal,
        });
      }
    }

    // Lunch suggestions
    if (mealsPerDay >= 2) {
      suggestions.push({
        mealType: "lunch",
        name: "Balanced Lunch",
        description: "Nutritious midday meal",
        calories: caloriesPerMeal,
        protein: proteinPerMeal,
        carbs: carbsPerMeal,
        fats: fatsPerMeal,
      });
    }

    // Dinner suggestions
    suggestions.push({
      mealType: "dinner",
      name: "Balanced Dinner",
      description: "Evening meal with complete nutrition",
      calories: caloriesPerMeal,
      protein: proteinPerMeal,
      carbs: carbsPerMeal,
      fats: fatsPerMeal,
    });

    // Snack suggestions (if more than 3 meals)
    if (mealsPerDay > 3) {
      const snackCalories = Math.round(dailyCalories * 0.1); // 10% of daily calories
      suggestions.push({
        mealType: "snack",
        name: "Healthy Snack",
        description: "Nutritious snack between meals",
        calories: snackCalories,
        protein: Math.round(proteinPerMeal * 0.5),
        carbs: Math.round(carbsPerMeal * 0.5),
        fats: Math.round(fatsPerMeal * 0.5),
      });
    }

    return suggestions;
  }

  /**
   * Calculate calorie cycling if applicable (e.g., for intermittent fasting)
   */
  private static calculateCalorieCycling(
    response: QuestionnaireResponse,
    baseCalories: number
  ): DietPlan["calorieCycling"] | undefined {
    // Only implement calorie cycling for specific fasting preferences
    if (
      response.fastingPreferences.includes("intermittent_16_8") ||
      response.fastingPreferences.includes("intermittent_18_6")
    ) {
      // High days: 5 days (Mon-Fri), Low days: 2 days (Sat-Sun)
      return {
        highDays: [1, 2, 3, 4, 5], // Monday to Friday
        lowDays: [0, 6], // Sunday and Saturday
        highCalories: Math.round(baseCalories * 1.1), // 10% more on high days
        lowCalories: Math.round(baseCalories * 0.9), // 10% less on low days
      };
    }
    return undefined;
  }

  /**
   * Calculate a complete diet plan from questionnaire response
   */
  static calculateDietPlan(
    response: QuestionnaireResponse
  ): DietPlan {
    // Map activity level and goal type
    const activityLevel = this.mapActivityLevel(response.activityLevel);
    const goalType = this.mapGoalType(response.primaryGoal);

    // Calculate TDEE
    const tdeeEstimate = ExpenditureCalculatorService.calculateTDEE(
      response.weight,
      response.height,
      response.age,
      response.sex,
      activityLevel
    );

    // Calculate macro targets using coaching service
    const macroTargets = CoachingService.calculateMacroTargets(
      tdeeEstimate.tdee,
      goalType
    );

    // Calculate hydration
    const hydration = this.calculateHydration(
      response.weight,
      response.activityLevel,
      response.sex
    );

    // Generate meal suggestions
    const mealSuggestions = this.generateMealSuggestions(
      response,
      macroTargets.calories,
      macroTargets.protein,
      macroTargets.carbs,
      macroTargets.fats
    );

    // Calculate calorie cycling if applicable
    const calorieCycling = this.calculateCalorieCycling(
      response,
      macroTargets.calories
    );

    return {
      dailyCalories: macroTargets.calories,
      protein: macroTargets.protein,
      carbs: macroTargets.carbs,
      fats: macroTargets.fats,
      mealSuggestions,
      dailyWaterIntake: hydration,
      calorieCycling,
      calculatedAt: new Date().toISOString(),
      basedOnQuestionnaire: response.id,
    };
  }
}

