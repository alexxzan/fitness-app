import { getDb, schema } from "@/shared/storage/database";
import { eq, asc } from "drizzle-orm";
import type { Muscle } from "../types/exercise.types";

/**
 * Repository for muscle data access using Drizzle ORM with SQLite
 */
export class MuscleRepository {
  /**
   * Get all muscles
   */
  static async getAll(): Promise<Muscle[]> {
    const db = getDb();
    return await db.select().from(schema.muscles).orderBy(asc(schema.muscles.name));
  }

  /**
   * Get a muscle by name
   */
  static async getByName(name: string): Promise<Muscle | null> {
    const db = getDb();
    const results = await db
      .select()
      .from(schema.muscles)
      .where(eq(schema.muscles.name, name))
      .limit(1);

    return results.length > 0 ? results[0] : null;
  }

  /**
   * Save a muscle
   */
  static async save(muscle: Muscle): Promise<string> {
    const db = getDb();
    await db
      .insert(schema.muscles)
      .values(muscle)
      .onConflictDoUpdate({
        target: schema.muscles.name,
        set: muscle,
      });

    return muscle.name;
  }

  /**
   * Delete a muscle
   */
  static async delete(name: string): Promise<void> {
    const db = getDb();
    await db.delete(schema.muscles).where(eq(schema.muscles.name, name));
  }
}
