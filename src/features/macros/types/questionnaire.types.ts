/**
 * Questionnaire types for macro setup
 */

import type {
  Gender,
  ActivityLevel,
  Goal,
  MacroPreference,
  DietaryRestriction,
} from "./macro.types";

export interface QuestionnaireData {
  // Step 1: Basic Info
  height: number; // in cm
  weight: number; // in kg
  age: number;
  gender: Gender;

  // Step 2: Activity Level
  activityLevel: ActivityLevel;

  // Step 3: Goal
  goal: Goal;

  // Step 4: Preferences
  proteinPreference?: MacroPreference;
  carbPreference?: MacroPreference;
  dietaryRestrictions?: DietaryRestriction[];

  // Step 5: Advanced (Optional)
  bodyFatPercentage?: number;
}

export interface QuestionnaireStep {
  id: number;
  title: string;
  description?: string;
}

export const QUESTIONNAIRE_STEPS: QuestionnaireStep[] = [
  {
    id: 1,
    title: "Basic Information",
    description: "Tell us about yourself",
  },
  {
    id: 2,
    title: "Activity Level",
    description: "How active are you?",
  },
  {
    id: 3,
    title: "Your Goal",
    description: "What do you want to achieve?",
  },
  {
    id: 4,
    title: "Preferences",
    description: "Customize your plan",
  },
  {
    id: 5,
    title: "Advanced (Optional)",
    description: "Fine-tune your calculations",
  },
];
