/**
 * Nutrition-related TypeScript types and interfaces
 */

export interface MacroTargets {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fats: number; // grams
}

export interface NutritionTarget {
  id: string;
  userId: string;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fats: number; // grams
  startDate: string; // ISO date string
  endDate?: string; // ISO date string (null for active target)
  goalType: 'cutting' | 'bulking' | 'maintenance';
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface NutritionAnalytic {
  id: string;
  userId: string;
  date: string; // ISO date string (date only)
  totalCalories: number;
  totalProtein: number; // grams
  totalCarbs: number; // grams
  totalFats: number; // grams
  micronutrients?: string; // JSON string
  adherenceScore?: number; // 0-100 percentage
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface DailyNutritionSummary {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  adherenceScore?: number;
}

