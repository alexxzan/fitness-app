import { getDatabase } from "@/shared/storage/database-adapter";
import type { NutritionTarget } from "../types/nutrition.types";
import { generateId } from "@/shared/utils/id";

/**
 * Repository for nutrition targets data access using database adapter
 * Works with both Dexie (web) and SQLite (native)
 */
export class NutritionTargetsRepository {
  private static readonly DEFAULT_USER_ID = "default-user"; // For single-user app

  /**
   * Get all nutrition targets
   */
  static async getAll(): Promise<NutritionTarget[]> {
    const db = getDatabase();
    return await db.nutritionTargets.getAll();
  }

  /**
   * Get a nutrition target by ID
   */
  static async getById(id: string): Promise<NutritionTarget | null> {
    const db = getDatabase();
    return await db.nutritionTargets.getById(id);
  }

  /**
   * Save a nutrition target (create or update)
   */
  static async save(target: NutritionTarget): Promise<string> {
    const db = getDatabase();
    return await db.nutritionTargets.save(target);
  }

  /**
   * Create a new nutrition target
   */
  static async create(
    targetData: Omit<NutritionTarget, "id" | "userId" | "createdAt" | "updatedAt">
  ): Promise<NutritionTarget> {
    const now = new Date().toISOString();
    const target: NutritionTarget = {
      ...targetData,
      id: generateId(),
      userId: NutritionTargetsRepository.DEFAULT_USER_ID,
      createdAt: now,
      updatedAt: now,
    };
    await this.save(target);
    return target;
  }

  /**
   * Update an existing nutrition target
   */
  static async update(
    id: string,
    updates: Partial<Omit<NutritionTarget, "id" | "userId" | "createdAt">>
  ): Promise<NutritionTarget> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Nutrition target with id ${id} not found`);
    }
    const updated: NutritionTarget = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await this.save(updated);
    return updated;
  }

  /**
   * Delete a nutrition target
   */
  static async delete(id: string): Promise<void> {
    const db = getDatabase();
    await db.nutritionTargets.delete(id);
  }

  /**
   * Get the active nutrition target (no end date)
   */
  static async getActive(userId: string = NutritionTargetsRepository.DEFAULT_USER_ID): Promise<NutritionTarget | null> {
    const db = getDatabase();
    return await db.nutritionTargets.getActive(userId);
  }

  /**
   * Get all nutrition targets for a user
   */
  static async getByUserId(userId: string = NutritionTargetsRepository.DEFAULT_USER_ID): Promise<NutritionTarget[]> {
    const db = getDatabase();
    return await db.nutritionTargets.getByUserId(userId);
  }

  /**
   * End the current active target and create a new one
   */
  static async replaceActive(
    newTargetData: Omit<NutritionTarget, "id" | "userId" | "createdAt" | "updatedAt" | "endDate">
  ): Promise<NutritionTarget> {
    // End the current active target
    const active = await this.getActive();
    if (active) {
      await this.update(active.id, {
        endDate: new Date().toISOString(),
      });
    }

    // Create new target
    return await this.create(newTargetData);
  }
}

