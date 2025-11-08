/**
 * Diet plan calculation result types
 */

import type { MacroTargets } from "./nutrition.types";

export interface MicronutrientTargets {
  vitaminA?: number; // mcg
  vitaminC?: number; // mg
  vitaminD?: number; // mcg
  vitaminE?: number; // mg
  vitaminK?: number; // mcg
  thiamine?: number; // mg
  riboflavin?: number; // mg
  niacin?: number; // mg
  vitaminB6?: number; // mg
  folate?: number; // mcg
  vitaminB12?: number; // mcg
  biotin?: number; // mcg
  pantothenicAcid?: number; // mg
  choline?: number; // mg
  calcium?: number; // mg
  phosphorus?: number; // mg
  magnesium?: number; // mg
  iron?: number; // mg
  zinc?: number; // mg
  copper?: number; // mg
  manganese?: number; // mg
  selenium?: number; // mcg
  chromium?: number; // mcg
  molybdenum?: number; // mcg
  iodine?: number; // mcg
  sodium?: number; // mg
  potassium?: number; // mg
  chloride?: number; // mg
}

export interface MealSuggestion {
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  description?: string;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fats: number; // grams
  ingredients?: string[];
}

export interface DietPlan {
  // Macro targets
  dailyCalories: number;
  protein: number; // grams
  carbs: number; // grams
  fats: number; // grams

  // Micronutrient targets (optional)
  micronutrientTargets?: MicronutrientTargets;

  // Meal suggestions
  mealSuggestions: MealSuggestion[];

  // Hydration
  dailyWaterIntake: number; // liters

  // Calorie cycling (if applicable)
  calorieCycling?: {
    highDays: number[]; // Day numbers (0-6, where 0 is Sunday)
    lowDays: number[];
    highCalories: number;
    lowCalories: number;
  };

  // Metadata
  calculatedAt: string; // ISO date string
  basedOnQuestionnaire: string; // questionnaire ID
}

