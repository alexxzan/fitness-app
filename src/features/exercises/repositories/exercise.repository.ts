import { getDb, schema } from "@/shared/storage/database";
import { eq, asc } from "drizzle-orm";
import type { Exercise, ExerciseFilters } from "../types/exercise.types";
import type { ExerciseInsert } from "@/shared/storage/schema";

/**
 * Repository for exercise data access using Drizzle ORM with SQLite
 * Handles CRUD operations for exercises with performance-optimized queries
 */
export class ExerciseRepository {
  /**
   * Get all exercises
   */
  static async getAll(): Promise<Exercise[]> {
    const db = getDb();
    const results = await db
      .select()
      .from(schema.exercises)
      .orderBy(asc(schema.exercises.name));

    return results.map((row) => this.parseExerciseFromDb(row));
  }

  /**
   * Get an exercise by ID (exerciseId)
   */
  static async getById(exerciseId: string): Promise<Exercise | null> {
    const db = getDb();
    const results = await db
      .select()
      .from(schema.exercises)
      .where(eq(schema.exercises.exerciseId, exerciseId))
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    return this.parseExerciseFromDb(results[0]);
  }

  /**
   * Save an exercise (create or update)
   */
  static async save(exercise: Exercise): Promise<string> {
    const db = getDb();
    const serialized = this.serializeExerciseForDb(exercise);

    await db
      .insert(schema.exercises)
      .values(serialized)
      .onConflictDoUpdate({
        target: schema.exercises.exerciseId,
        set: serialized,
      });

    return exercise.exerciseId;
  }

  /**
   * Delete an exercise
   */
  static async delete(exerciseId: string): Promise<void> {
    const db = getDb();
    await db
      .delete(schema.exercises)
      .where(eq(schema.exercises.exerciseId, exerciseId));
  }

  /**
   * Search exercises with filters
   * Note: SQLite doesn't support array operations, so we filter in memory
   */
  static async search(filters: ExerciseFilters): Promise<Exercise[]> {
    // Get all exercises and filter in memory
    const allExercises = await this.getAll();

    let exercises = allExercises;

    // Apply search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      exercises = exercises.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.targetMuscles.some((m) => m.toLowerCase().includes(query)) ||
          e.bodyParts.some((bp) => bp.toLowerCase().includes(query)) ||
          e.equipments.some((eq) => eq.toLowerCase().includes(query))
      );
    }

    // Apply body parts filter
    if (filters.bodyParts && filters.bodyParts.length > 0) {
      exercises = exercises.filter((e) =>
        filters.bodyParts!.some((bp) =>
          e.bodyParts.some((ebp) => ebp.toLowerCase() === bp.toLowerCase())
        )
      );
    }

    // Apply equipment filter
    if (filters.equipments && filters.equipments.length > 0) {
      exercises = exercises.filter((e) =>
        filters.equipments!.some((eq) =>
          e.equipments.some((eeq) => eeq.toLowerCase() === eq.toLowerCase())
        )
      );
    }

    // Apply target muscles filter
    if (filters.targetMuscles && filters.targetMuscles.length > 0) {
      exercises = exercises.filter((e) =>
        filters.targetMuscles!.some((tm) =>
          e.targetMuscles.some((etm) => etm.toLowerCase() === tm.toLowerCase())
        )
      );
    }

    return exercises.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get exercises by body part
   */
  static async getByBodyPart(bodyPart: string): Promise<Exercise[]> {
    const allExercises = await this.getAll();
    return allExercises
      .filter((e) =>
        e.bodyParts.some((bp) => bp.toLowerCase() === bodyPart.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get exercises by equipment
   */
  static async getByEquipment(equipment: string): Promise<Exercise[]> {
    const allExercises = await this.getAll();
    return allExercises
      .filter((e) =>
        e.equipments.some((eq) => eq.toLowerCase() === equipment.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get exercises by target muscle
   */
  static async getByTargetMuscle(targetMuscle: string): Promise<Exercise[]> {
    const allExercises = await this.getAll();
    return allExercises
      .filter((e) =>
        e.targetMuscles.some(
          (tm) => tm.toLowerCase() === targetMuscle.toLowerCase()
        )
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get exercises by name (case-insensitive search)
   */
  static async searchByName(query: string): Promise<Exercise[]> {
    const lowerQuery = query.toLowerCase();
    const allExercises = await this.getAll();
    return allExercises
      .filter((exercise) => exercise.name.toLowerCase().includes(lowerQuery))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Parse exercise from database row
   */
  private static parseExerciseFromDb(row: Record<string, any>): Exercise {
    return {
      exerciseId: row.exerciseId,
      name: row.name,
      gifUrl: row.gifUrl,
      equipments: JSON.parse(row.equipments),
      bodyParts: JSON.parse(row.bodyParts),
      targetMuscles: JSON.parse(row.targetMuscles),
      secondaryMuscles: JSON.parse(row.secondaryMuscles),
      instructions: JSON.parse(row.instructions),
    };
  }

  /**
   * Serialize exercise for database storage
   */
  private static serializeExerciseForDb(exercise: Exercise): ExerciseInsert {
    return {
      exerciseId: exercise.exerciseId,
      name: exercise.name,
      gifUrl: exercise.gifUrl,
      equipments: JSON.stringify(exercise.equipments),
      bodyParts: JSON.stringify(exercise.bodyParts),
      targetMuscles: JSON.stringify(exercise.targetMuscles),
      secondaryMuscles: JSON.stringify(exercise.secondaryMuscles),
      instructions: JSON.stringify(exercise.instructions),
    };
  }
}
