import { getDb, schema } from "@/shared/storage/database";
import { eq, asc } from "drizzle-orm";
import type { Equipment } from "../types/exercise.types";

/**
 * Repository for equipment data access using Drizzle ORM with SQLite
 */
export class EquipmentRepository {
  /**
   * Get all equipment
   */
  static async getAll(): Promise<Equipment[]> {
    const db = getDb();
    return await db.select().from(schema.equipment).orderBy(asc(schema.equipment.name));
  }

  /**
   * Get equipment by name
   */
  static async getByName(name: string): Promise<Equipment | null> {
    const db = getDb();
    const results = await db
      .select()
      .from(schema.equipment)
      .where(eq(schema.equipment.name, name))
      .limit(1);

    return results.length > 0 ? results[0] : null;
  }

  /**
   * Save equipment
   */
  static async save(equipment: Equipment): Promise<string> {
    const db = getDb();
    await db
      .insert(schema.equipment)
      .values(equipment)
      .onConflictDoUpdate({
        target: schema.equipment.name,
        set: equipment,
      });

    return equipment.name;
  }

  /**
   * Delete equipment
   */
  static async delete(name: string): Promise<void> {
    const db = getDb();
    await db.delete(schema.equipment).where(eq(schema.equipment.name, name));
  }
}
