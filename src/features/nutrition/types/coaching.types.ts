/**
 * Coaching-related TypeScript types and interfaces
 */

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Gender = 'male' | 'female' | 'other';
export type GoalType = 'cutting' | 'bulking' | 'maintenance';

export interface MacroSplit {
  proteinPercent: number; // 0-100
  carbsPercent: number; // 0-100
  fatsPercent: number; // 0-100
}

export interface CoachingSetting {
  id: string;
  userId: string;
  activityLevel: ActivityLevel;
  gender?: Gender;
  age?: number;
  height?: number; // cm
  initialWeight?: number; // kg
  goalWeight?: number; // kg
  preferredMacroSplit?: string; // JSON string of MacroSplit
  recalibrationFrequency?: number; // days
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface TDEEEstimate {
  bmr: number; // Basal Metabolic Rate (calories)
  tdee: number; // Total Daily Energy Expenditure (calories)
  activityMultiplier: number;
}

export interface CoachingInsight {
  type: 'target_adjustment' | 'adherence_warning' | 'progress_update' | 'recalibration';
  message: string;
  date: string;
  data?: Record<string, any>;
}

