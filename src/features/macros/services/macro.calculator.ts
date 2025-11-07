/**
 * Macro calculation service
 * Uses Mifflin-St Jeor equation for BMR calculation
 */

import type {
  UserProfile,
  MacroPlan,
  ActivityLevel,
  Goal,
  MacroPreference,
} from "../types/macro.types";

/**
 * Activity level multipliers for TDEE calculation
 */
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2, // Little to no exercise
  lightly_active: 1.375, // Light exercise 1-3 days/week
  moderately_active: 1.55, // Moderate exercise 3-5 days/week
  very_active: 1.725, // Hard exercise 6-7 days/week
  extremely_active: 1.9, // Very hard exercise, physical job
};

/**
 * Calculate Base Metabolic Rate (BMR) using Mifflin-St Jeor equation
 * BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + s
 * where s = +5 for males, -161 for females, -78 for other (average)
 */
export function calculateBMR(profile: UserProfile): number {
  const { weight, height, age, gender } = profile;

  let genderConstant: number;
  switch (gender) {
    case "male":
      genderConstant = 5;
      break;
    case "female":
      genderConstant = -161;
      break;
    case "other":
      // Use average of male and female
      genderConstant = -78;
      break;
  }

  const bmr = 10 * weight + 6.25 * height - 5 * age + genderConstant;

  return Math.round(bmr);
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 * TDEE = BMR × Activity Multiplier
 */
export function calculateTDEE(profile: UserProfile): number {
  const bmr = calculateBMR(profile);
  const multiplier = ACTIVITY_MULTIPLIERS[profile.activityLevel];
  return Math.round(bmr * multiplier);
}

/**
 * Calculate calorie adjustment based on goal
 */
function calculateCalorieAdjustment(
  tdee: number,
  goal: Goal,
  weight: number
): number {
  switch (goal) {
    case "weight_loss":
      // Moderate deficit: 20% reduction (500-750 kcal deficit)
      return Math.round(tdee * 0.8);
    case "weight_gain":
      // Moderate surplus: 15% increase (300-500 kcal surplus)
      return Math.round(tdee * 1.15);
    case "build_muscle":
      // Slight surplus: 10% increase (200-300 kcal surplus)
      return Math.round(tdee * 1.1);
    case "maintain":
    default:
      return tdee;
  }
}

/**
 * Calculate protein target based on goal and preference
 */
function calculateProteinTarget(
  goal: Goal,
  weight: number,
  calories: number,
  preference?: MacroPreference
): number {
  let proteinPerKg: number;

  // Base protein per kg based on goal
  switch (goal) {
    case "build_muscle":
      proteinPerKg = 2.0; // 2.0-2.2g per kg for muscle building
      break;
    case "weight_loss":
      proteinPerKg = 2.2; // Higher protein for weight loss to preserve muscle
      break;
    case "weight_gain":
      proteinPerKg = 1.8; // Moderate protein for weight gain
      break;
    case "maintain":
    default:
      proteinPerKg = 1.6; // 1.6-2.0g per kg for maintenance
      break;
  }

  // Adjust based on preference
  if (preference === "high") {
    proteinPerKg += 0.3;
  } else if (preference === "low") {
    proteinPerKg -= 0.3;
  }

  // Ensure minimum of 0.8g per kg (RDA)
  proteinPerKg = Math.max(0.8, proteinPerKg);

  const proteinGrams = weight * proteinPerKg;
  const proteinCalories = proteinGrams * 4; // 4 calories per gram

  // Ensure protein doesn't exceed 40% of total calories
  const maxProteinCalories = calories * 0.4;
  if (proteinCalories > maxProteinCalories) {
    return Math.round(maxProteinCalories / 4);
  }

  return Math.round(proteinGrams);
}

/**
 * Calculate fat target based on preference
 */
function calculateFatTarget(
  calories: number,
  preference?: MacroPreference
): number {
  let fatPercentage: number;

  if (preference === "high") {
    fatPercentage = 0.35; // 35% of calories
  } else if (preference === "low") {
    fatPercentage = 0.2; // 20% of calories
  } else {
    fatPercentage = 0.25; // 25% of calories (moderate)
  }

  // Ensure minimum 20% for health
  fatPercentage = Math.max(0.2, fatPercentage);

  const fatCalories = calories * fatPercentage;
  return Math.round(fatCalories / 9); // 9 calories per gram
}

/**
 * Calculate carb target (remaining calories after protein and fat)
 */
function calculateCarbTarget(
  calories: number,
  protein: number,
  fats: number
): number {
  const proteinCalories = protein * 4;
  const fatCalories = fats * 9;
  const carbCalories = calories - proteinCalories - fatCalories;

  // Ensure carbs are at least 0 (shouldn't be negative)
  return Math.max(0, Math.round(carbCalories / 4)); // 4 calories per gram
}

/**
 * Calculate water goal based on weight and activity level
 * Base: 35ml per kg body weight
 * Add 500ml for active individuals
 */
function calculateWaterGoal(
  weight: number,
  activityLevel: ActivityLevel
): number {
  const baseWater = weight * 35; // 35ml per kg
  const isActive =
    activityLevel === "very_active" || activityLevel === "extremely_active";
  const additionalWater = isActive ? 500 : 0;

  return Math.round(baseWater + additionalWater);
}

/**
 * Calculate complete macro plan from user profile
 */
export function calculateMacros(profile: UserProfile): MacroPlan {
  const tdee = calculateTDEE(profile);
  const calories = calculateCalorieAdjustment(
    tdee,
    profile.goal,
    profile.weight
  );

  const protein = calculateProteinTarget(
    profile.goal,
    profile.weight,
    calories,
    profile.proteinPreference
  );

  const fats = calculateFatTarget(calories, profile.carbPreference);

  const carbs = calculateCarbTarget(calories, protein, fats);

  const waterGoal = calculateWaterGoal(profile.weight, profile.activityLevel);

  return {
    id: `macro-plan-${Date.now()}`,
    dailyCalories: calories,
    protein,
    carbs,
    fats,
    waterGoal,
    calculationMethod: "mifflin_st_jeor",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
