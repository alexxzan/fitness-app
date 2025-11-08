import { getDatabase } from "@/shared/storage/database-adapter";
import type { FoodLog } from "../types/food.types";
import { generateId } from "@/shared/utils/id";

/**
 * Repository for food log data access using database adapter
 * Works with both Dexie (web) and SQLite (native)
 */
export class FoodLogRepository {
  private static readonly DEFAULT_USER_ID = "default-user"; // For single-user app

  /**
   * Get all food logs
   */
  static async getAll(): Promise<FoodLog[]> {
    const db = getDatabase();
    return await db.foodLogs.getAll();
  }

  /**
   * Get a food log by ID
   */
  static async getById(id: string): Promise<FoodLog | null> {
    const db = getDatabase();
    return await db.foodLogs.getById(id);
  }

  /**
   * Save a food log (create or update)
   */
  static async save(foodLog: FoodLog): Promise<string> {
    const db = getDatabase();
    return await db.foodLogs.save(foodLog);
  }

  /**
   * Create a new food log entry
   */
  static async create(
    foodLogData: Omit<FoodLog, "id" | "userId" | "createdAt">
  ): Promise<FoodLog> {
    const foodLog: FoodLog = {
      ...foodLogData,
      id: generateId(),
      userId: FoodLogRepository.DEFAULT_USER_ID,
      createdAt: new Date().toISOString(),
    };
    await this.save(foodLog);
    return foodLog;
  }

  /**
   * Update an existing food log
   */
  static async update(
    id: string,
    updates: Partial<Omit<FoodLog, "id" | "userId" | "createdAt">>
  ): Promise<FoodLog> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Food log with id ${id} not found`);
    }
    const updated: FoodLog = {
      ...existing,
      ...updates,
    };
    await this.save(updated);
    return updated;
  }

  /**
   * Delete a food log
   */
  static async delete(id: string): Promise<void> {
    const db = getDatabase();
    await db.foodLogs.delete(id);
  }

  /**
   * Get food logs for a specific date
   */
  static async getByDate(date: string): Promise<FoodLog[]> {
    const db = getDatabase();
    return await db.foodLogs.getByDate(date);
  }

  /**
   * Get food logs for today
   */
  static async getToday(): Promise<FoodLog[]> {
    const today = new Date().toISOString().split("T")[0];
    return await this.getByDate(today);
  }

  /**
   * Get food logs for a date range
   */
  static async getByDateRange(startDate: string, endDate: string): Promise<FoodLog[]> {
    const db = getDatabase();
    return await db.foodLogs.getByDateRange(startDate, endDate);
  }

  /**
   * Get food logs for a user (default user for single-user app)
   */
  static async getByUserId(userId: string = FoodLogRepository.DEFAULT_USER_ID): Promise<FoodLog[]> {
    const db = getDatabase();
    return await db.foodLogs.getByUserId(userId);
  }
}

