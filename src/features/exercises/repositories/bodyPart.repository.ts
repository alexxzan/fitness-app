import { getDatabase } from "@/shared/storage/database-adapter";
import type { BodyPart } from "../types/exercise.types";

/**
 * Repository for body part data access using database adapter
 * Works with both Dexie (web) and SQLite (native)
 */
export class BodyPartRepository {
  /**
   * Get all body parts
   */
  static async getAll(): Promise<BodyPart[]> {
    const db = getDatabase();
    return await db.bodyParts.getAll();
  }

  /**
   * Get a body part by name
   */
  static async getByName(name: string): Promise<BodyPart | null> {
    const db = getDatabase();
    return await db.bodyParts.getByName(name);
  }

  /**
   * Save a body part
   */
  static async save(bodyPart: BodyPart): Promise<string> {
    const db = getDatabase();
    return await db.bodyParts.save(bodyPart);
  }

  /**
   * Delete a body part
   */
  static async delete(name: string): Promise<void> {
    const db = getDatabase();
    await db.bodyParts.delete(name);
  }
}
