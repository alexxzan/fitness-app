import { getDb, schema } from "@/shared/storage/database";
import { eq, asc } from "drizzle-orm";
import type { BodyPart } from "../types/exercise.types";

/**
 * Repository for body part data access using Drizzle ORM with SQLite
 */
export class BodyPartRepository {
  /**
   * Get all body parts
   */
  static async getAll(): Promise<BodyPart[]> {
    const db = getDb();
    return await db.select().from(schema.bodyParts).orderBy(asc(schema.bodyParts.name));
  }

  /**
   * Get a body part by name
   */
  static async getByName(name: string): Promise<BodyPart | null> {
    const db = getDb();
    const results = await db
      .select()
      .from(schema.bodyParts)
      .where(eq(schema.bodyParts.name, name))
      .limit(1);

    return results.length > 0 ? results[0] : null;
  }

  /**
   * Save a body part
   */
  static async save(bodyPart: BodyPart): Promise<string> {
    const db = getDb();
    await db
      .insert(schema.bodyParts)
      .values(bodyPart)
      .onConflictDoUpdate({
        target: schema.bodyParts.name,
        set: bodyPart,
      });

    return bodyPart.name;
  }

  /**
   * Delete a body part
   */
  static async delete(name: string): Promise<void> {
    const db = getDb();
    await db.delete(schema.bodyParts).where(eq(schema.bodyParts.name, name));
  }
}
