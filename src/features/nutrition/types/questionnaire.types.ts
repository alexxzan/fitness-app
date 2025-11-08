/**
 * Questionnaire-related TypeScript types and interfaces
 */

export type QuestionnaireActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "moderately_active"
  | "very_active"
  | "extra_active";

export type QuestionnaireSex = "male" | "female" | "other";

export type DietaryRestriction =
  | "vegan"
  | "vegetarian"
  | "keto"
  | "paleo"
  | "mediterranean";

export type PrimaryGoal =
  | "weight_loss"
  | "muscle_gain"
  | "maintenance"
  | "performance";

export type FastingPreference =
  | "none"
  | "intermittent_16_8"
  | "intermittent_18_6"
  | "alternate_day";

export interface QuestionnaireResponse {
  id: string;
  // Basic Demographics
  age: number;
  sex: QuestionnaireSex;
  height: number; // cm
  weight: number; // kg

  // Activity Level
  activityLevel: QuestionnaireActivityLevel;

  // Dietary Preferences
  dietaryRestrictions: DietaryRestriction[];
  allergies: string[];
  intolerances: string[];

  // Goals
  primaryGoal: PrimaryGoal;
  targetWeight?: number; // kg
  targetDate?: string; // ISO date

  // Lifestyle
  mealFrequency: number; // meals per day
  fastingPreferences: FastingPreference[];
  typicalWakeTime?: string; // HH:mm
  typicalBedTime?: string; // HH:mm

  // Optional
  medicalConditions?: string[];
  medications?: string[];
  foodDislikes?: string[];
  foodFavorites?: string[];

  // Metadata
  completedAt: string; // ISO date string
  userId: string;
}

/**
 * Partial questionnaire response for form state management
 */
export type QuestionnaireFormData = Omit<
  QuestionnaireResponse,
  "id" | "completedAt" | "userId"
>;

