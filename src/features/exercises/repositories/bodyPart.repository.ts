import { db } from "@/shared/storage/database";
import type { BodyPart } from "../types/exercise.types";

/**
 * Repository for body part data access
 */
export class BodyPartRepository {
  /**
   * Get all body parts
   */
  static async getAll(): Promise<BodyPart[]> {
    return await db.bodyParts.orderBy("name").toArray();
  }

  /**
   * Get a body part by name
   */
  static async getByName(name: string): Promise<BodyPart | null> {
    return (await db.bodyParts.get(name)) ?? null;
  }

  /**
   * Save a body part
   */
  static async save(bodyPart: BodyPart): Promise<string> {
    return await db.bodyParts.put(bodyPart);
  }

  /**
   * Delete a body part
   */
  static async delete(name: string): Promise<void> {
    await db.bodyParts.delete(name);
  }
}

