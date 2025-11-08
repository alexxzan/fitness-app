import { getDatabase } from "@/shared/storage/database-adapter";
import type { Food } from "../types/food.types";
import { generateId } from "@/shared/utils/id";

/**
 * Repository for food data access using database adapter
 * Works with both Dexie (web) and SQLite (native)
 */
export class FoodRepository {
  /**
   * Get all foods
   */
  static async getAll(): Promise<Food[]> {
    const db = getDatabase();
    return await db.foods.getAll();
  }

  /**
   * Get a food by ID
   */
  static async getById(id: string): Promise<Food | null> {
    const db = getDatabase();
    return await db.foods.getById(id);
  }

  /**
   * Save a food (create or update)
   */
  static async save(food: Food): Promise<string> {
    const db = getDatabase();
    return await db.foods.save(food);
  }

  /**
   * Create a new food
   */
  static async create(foodData: Omit<Food, "id" | "createdAt" | "updatedAt">): Promise<Food> {
    const now = new Date().toISOString();
    const food: Food = {
      ...foodData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    await this.save(food);
    return food;
  }

  /**
   * Update an existing food
   */
  static async update(id: string, updates: Partial<Omit<Food, "id" | "createdAt">>): Promise<Food> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Food with id ${id} not found`);
    }
    const updated: Food = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await this.save(updated);
    return updated;
  }

  /**
   * Delete a food
   */
  static async delete(id: string): Promise<void> {
    const db = getDatabase();
    await db.foods.delete(id);
  }

  /**
   * Search foods by name
   */
  static async searchByName(query: string): Promise<Food[]> {
    const db = getDatabase();
    return await db.foods.searchByName(query);
  }

  /**
   * Find food by barcode
   */
  static async findByBarcode(barcode: string): Promise<Food | null> {
    const db = getDatabase();
    return await db.foods.findByBarcode(barcode);
  }

  /**
   * Bulk insert foods (for initialization)
   */
  static async bulkInsert(foods: Food[]): Promise<void> {
    const db = getDatabase();
    await db.foods.bulkInsert(foods);
  }
}

