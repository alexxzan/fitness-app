import { db } from "@/shared/storage/database";
import type { Muscle } from "../types/exercise.types";

/**
 * Repository for muscle data access
 */
export class MuscleRepository {
  /**
   * Get all muscles
   */
  static async getAll(): Promise<Muscle[]> {
    return await db.muscles.orderBy("name").toArray();
  }

  /**
   * Get a muscle by name
   */
  static async getByName(name: string): Promise<Muscle | null> {
    return (await db.muscles.get(name)) ?? null;
  }

  /**
   * Save a muscle
   */
  static async save(muscle: Muscle): Promise<string> {
    return await db.muscles.put(muscle);
  }

  /**
   * Delete a muscle
   */
  static async delete(name: string): Promise<void> {
    await db.muscles.delete(name);
  }
}

