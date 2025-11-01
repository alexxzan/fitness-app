import { getDatabase } from "@/shared/storage/database-adapter";
import type { Equipment } from "../types/exercise.types";

/**
 * Repository for equipment data access using database adapter
 * Works with both Dexie (web) and SQLite (native)
 */
export class EquipmentRepository {
  /**
   * Get all equipment
   */
  static async getAll(): Promise<Equipment[]> {
    const db = getDatabase();
    return await db.equipment.getAll();
  }

  /**
   * Get equipment by name
   */
  static async getByName(name: string): Promise<Equipment | null> {
    const db = getDatabase();
    return await db.equipment.getByName(name);
  }

  /**
   * Save equipment
   */
  static async save(equipment: Equipment): Promise<string> {
    const db = getDatabase();
    return await db.equipment.save(equipment);
  }

  /**
   * Delete equipment
   */
  static async delete(name: string): Promise<void> {
    const db = getDatabase();
    await db.equipment.delete(name);
  }
}
