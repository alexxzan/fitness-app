/**
 * Food-related TypeScript types and interfaces
 */

export interface ServingSize {
  amount: number;
  unit: string; // 'g', 'ml', 'cup', 'piece', etc.
}

export interface Micronutrients {
  // Vitamins (mg or mcg)
  vitaminA?: number; // mcg
  vitaminC?: number; // mg
  vitaminD?: number; // mcg
  vitaminE?: number; // mg
  vitaminK?: number; // mcg
  thiamin?: number; // mg (B1)
  riboflavin?: number; // mg (B2)
  niacin?: number; // mg (B3)
  vitaminB6?: number; // mg
  folate?: number; // mcg (B9)
  vitaminB12?: number; // mcg
  biotin?: number; // mcg
  pantothenicAcid?: number; // mg (B5)
  // Minerals (mg)
  calcium?: number; // mg
  iron?: number; // mg
  magnesium?: number; // mg
  phosphorus?: number; // mg
  potassium?: number; // mg
  sodium?: number; // mg
  zinc?: number; // mg
  copper?: number; // mg
  manganese?: number; // mg
  selenium?: number; // mcg
  chromium?: number; // mcg
  molybdenum?: number; // mcg
  iodine?: number; // mcg
  // Other
  fiber?: number; // g
  sugar?: number; // g
  cholesterol?: number; // mg
  saturatedFat?: number; // g
  transFat?: number; // g
  monounsaturatedFat?: number; // g
  polyunsaturatedFat?: number; // g
}

export interface Food {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  servingSize: string; // JSON string of ServingSize
  calories: number; // per serving
  protein: number; // grams per serving
  carbs: number; // grams per serving
  fats: number; // grams per serving
  micronutrients?: string; // JSON string of Micronutrients
  verified: number; // 0 or 1
  userSubmitted: number; // 0 or 1
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface FoodLog {
  id: string;
  userId: string;
  date: string; // ISO date string (date only)
  foodId: string;
  quantity: number; // Multiplier for serving size
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  createdAt: string; // ISO date string
}

export interface NutritionData {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fats: number; // grams
  micronutrients?: Micronutrients;
}

