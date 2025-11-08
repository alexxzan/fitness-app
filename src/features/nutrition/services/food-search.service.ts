import { FoodRepository } from "../repositories/food.repository";
import type { Food } from "../types/food.types";

export interface FoodSearchFilters {
  query?: string;
  verifiedOnly?: boolean;
  userSubmitted?: boolean;
  minCalories?: number;
  maxCalories?: number;
}

/**
 * Service for searching and filtering foods
 */
export class FoodSearchService {
  /**
   * Search foods with filters
   */
  static async search(filters: FoodSearchFilters): Promise<Food[]> {
    let foods: Food[];

    // Start with all foods or search by name
    if (filters.query && filters.query.trim().length > 0) {
      foods = await FoodRepository.searchByName(filters.query);
    } else {
      foods = await FoodRepository.getAll();
    }

    // Apply filters
    if (filters.verifiedOnly) {
      foods = foods.filter((food) => food.verified === 1);
    }

    if (filters.userSubmitted !== undefined) {
      foods = foods.filter((food) => food.userSubmitted === (filters.userSubmitted ? 1 : 0));
    }

    if (filters.minCalories !== undefined) {
      foods = foods.filter((food) => food.calories >= filters.minCalories!);
    }

    if (filters.maxCalories !== undefined) {
      foods = foods.filter((food) => food.calories <= filters.maxCalories!);
    }

    return foods;
  }

  /**
   * Find food by barcode
   */
  static async findByBarcode(barcode: string): Promise<Food | null> {
    return await FoodRepository.findByBarcode(barcode);
  }

  /**
   * Get recent foods (most recently created)
   */
  static async getRecent(limit: number = 10): Promise<Food[]> {
    const allFoods = await FoodRepository.getAll();
    return allFoods
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  /**
   * Get frequently logged foods (would require analytics - placeholder for now)
   */
  static async getFrequent(limit: number = 10): Promise<Food[]> {
    // TODO: Implement with food log analytics
    // For now, return recent foods
    return await this.getRecent(limit);
  }
}

