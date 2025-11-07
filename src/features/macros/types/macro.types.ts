/**
 * Macro tracking related TypeScript types and interfaces
 */

export type Gender = "male" | "female" | "other";

export type ActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "moderately_active"
  | "very_active"
  | "extremely_active";

export type Goal = "weight_loss" | "weight_gain" | "maintain" | "build_muscle";

export type MacroPreference = "high" | "moderate" | "low";

export type DietaryRestriction =
  | "none"
  | "vegetarian"
  | "vegan"
  | "keto"
  | "paleo"
  | "mediterranean"
  | "other";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type MacroCalculationMethod = "mifflin_st_jeor";

export interface UserProfile {
  id: string;
  height: number; // in cm
  weight: number; // in kg
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: Goal;
  proteinPreference?: MacroPreference;
  carbPreference?: MacroPreference;
  dietaryRestrictions?: DietaryRestriction[];
  bodyFatPercentage?: number; // Optional, for advanced calculations
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface MacroPlan {
  id: string;
  userId?: string; // For future multi-user support
  dailyCalories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fats: number; // in grams
  waterGoal: number; // in ml
  calculationMethod: MacroCalculationMethod;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface FoodItem {
  name: string;
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fats: number; // in grams
}

export interface FoodLog {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  mealType: MealType;
  foodName: string;
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fats: number; // in grams
  notes?: string;
  createdAt: string; // ISO date string
}

export interface MealTemplate {
  id: string;
  name: string;
  description?: string;
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface PlannedMeal {
  mealType: MealType;
  foods: FoodItem[];
  notes?: string;
}

export interface MealPlan {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  meals: PlannedMeal[];
  isCompleted: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface WaterLog {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  amount: number; // in ml
  timestamp: string; // ISO date string
  createdAt: string; // ISO date string
}

export interface MacroHistory {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  waterIntake: number; // in ml
  createdAt: string; // ISO date string
}

export interface DailyMacroSummary {
  date: string;
  consumed: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  target: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  remaining: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  waterConsumed: number;
  waterGoal: number;
}

/**
 * Questionnaire step data
 */
export interface QuestionnaireStep {
  id: string;
  title: string;
  description?: string;
  fields: QuestionnaireField[];
}

export interface QuestionnaireField {
  id: string;
  label: string;
  type: "number" | "select" | "multiselect" | "radio";
  required: boolean;
  placeholder?: string;
  options?: { label: string; value: string | number }[];
  min?: number;
  max?: number;
  unit?: string;
  helpText?: string;
}
