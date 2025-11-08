import type { MicronutrientValues } from "../types/micronutrients.types";
import type { FoodLog, Food } from "../types/food.types";
import { FoodRepository } from "../repositories/food.repository";

/**
 * Service for calculating micronutrient totals
 */
export class MicronutrientCalculatorService {
  /**
   * Parse micronutrients from JSON string
   */
  static parseMicronutrients(micronutrientsString?: string): MicronutrientValues {
    if (!micronutrientsString) {
      return {};
    }
    try {
      return JSON.parse(micronutrientsString) as MicronutrientValues;
    } catch {
      return {};
    }
  }

  /**
   * Calculate total micronutrients from food logs
   */
  static async calculateTotals(foodLogs: FoodLog[]): Promise<MicronutrientValues> {
    const totals: MicronutrientValues = {};

    for (const log of foodLogs) {
      const food = await FoodRepository.getById(log.foodId);
      if (!food || !food.micronutrients) {
        continue;
      }

      const foodMicronutrients = this.parseMicronutrients(food.micronutrients);
      const multiplier = log.quantity;

      // Sum up all micronutrients
      Object.keys(foodMicronutrients).forEach((key) => {
        const value = foodMicronutrients[key as keyof MicronutrientValues];
        if (value !== undefined) {
          const currentTotal = totals[key as keyof MicronutrientValues] || 0;
          totals[key as keyof MicronutrientValues] = (currentTotal + value * multiplier) as any;
        }
      });
    }

    return totals;
  }

  /**
   * Calculate daily value percentages (based on standard RDAs)
   */
  static calculateDailyValuePercentages(values: MicronutrientValues): Record<string, number> {
    // Standard Recommended Daily Allowances (RDAs)
    const rdas: Partial<Record<keyof MicronutrientValues, number>> = {
      vitaminA: 900, // mcg
      vitaminC: 90, // mg
      vitaminD: 20, // mcg
      vitaminE: 15, // mg
      vitaminK: 120, // mcg
      thiamin: 1.2, // mg
      riboflavin: 1.3, // mg
      niacin: 16, // mg
      vitaminB6: 1.7, // mg
      folate: 400, // mcg
      vitaminB12: 2.4, // mcg
      biotin: 30, // mcg
      pantothenicAcid: 5, // mg
      calcium: 1000, // mg
      iron: 18, // mg
      magnesium: 400, // mg
      phosphorus: 700, // mg
      potassium: 4700, // mg
      sodium: 2300, // mg (max)
      zinc: 11, // mg
      copper: 0.9, // mg
      manganese: 2.3, // mg
      selenium: 55, // mcg
      chromium: 35, // mcg
      molybdenum: 45, // mcg
      iodine: 150, // mcg
      fiber: 25, // g
    };

    const percentages: Record<string, number> = {};

    Object.keys(values).forEach((key) => {
      const value = values[key as keyof MicronutrientValues];
      const rda = rdas[key as keyof MicronutrientValues];
      if (value !== undefined && rda !== undefined && rda > 0) {
        percentages[key] = Math.round((value / rda) * 100);
      }
    });

    return percentages;
  }

  /**
   * Format micronutrients as JSON string
   */
  static formatMicronutrients(values: MicronutrientValues): string {
    return JSON.stringify(values);
  }
}

