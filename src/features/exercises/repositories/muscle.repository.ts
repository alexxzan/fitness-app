import { getDatabase } from "@/shared/storage/database-adapter";
import type { Muscle } from "../types/exercise.types";

/**
 * Repository for muscle data access using database adapter
 * Works with both Dexie (web) and SQLite (native)
 */
export class MuscleRepository {
  /**
   * Get all muscles
   */
  static async getAll(): Promise<Muscle[]> {
    const db = getDatabase();
    return await db.muscles.getAll();
  }

  /**
   * Get a muscle by name
   */
  static async getByName(name: string): Promise<Muscle | null> {
    const db = getDatabase();
    return await db.muscles.getByName(name);
  }

  /**
   * Save a muscle
   */
  static async save(muscle: Muscle): Promise<string> {
    const db = getDatabase();
    return await db.muscles.save(muscle);
  }

  /**
   * Delete a muscle
   */
  static async delete(name: string): Promise<void> {
    const db = getDatabase();
    await db.muscles.delete(name);
  }
}
