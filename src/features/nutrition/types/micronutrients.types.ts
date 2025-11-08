/**
 * Micronutrient-related TypeScript types and interfaces
 */

export interface MicronutrientValues {
  // Vitamins
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
  // Minerals
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

export interface MicronutrientDailyValue {
  name: string;
  value: number;
  unit: string; // 'mg', 'mcg', 'g'
  dailyValue?: number; // Recommended daily value
  percentage?: number; // Percentage of daily value
}

export interface MicronutrientSummary {
  date: string;
  values: MicronutrientValues;
  percentages: Record<string, number>; // Percentage of daily value for each micronutrient
}

