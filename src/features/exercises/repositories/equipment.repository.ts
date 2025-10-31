import { db } from "@/shared/storage/database";
import type { Equipment } from "../types/exercise.types";

/**
 * Repository for equipment data access
 */
export class EquipmentRepository {
  /**
   * Get all equipment
   */
  static async getAll(): Promise<Equipment[]> {
    return await db.equipment.orderBy("name").toArray();
  }

  /**
   * Get equipment by name
   */
  static async getByName(name: string): Promise<Equipment | null> {
    return (await db.equipment.get(name)) ?? null;
  }

  /**
   * Save equipment
   */
  static async save(equipment: Equipment): Promise<string> {
    return await db.equipment.put(equipment);
  }

  /**
   * Delete equipment
   */
  static async delete(name: string): Promise<void> {
    await db.equipment.delete(name);
  }
}

