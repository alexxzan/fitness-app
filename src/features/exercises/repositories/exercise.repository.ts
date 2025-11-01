import { getDatabase } from "@/shared/storage/database-adapter";
import type { Exercise, ExerciseFilters } from "../types/exercise.types";

/**
 * Repository for exercise data access using database adapter
 * Works with both Dexie (web) and SQLite (native)
 */
export class ExerciseRepository {
  /**
   * Get all exercises
   */
  static async getAll(): Promise<Exercise[]> {
    const db = getDatabase();
    return await db.exercises.getAll();
  }

  /**
   * Get an exercise by ID (exerciseId)
   */
  static async getById(exerciseId: string): Promise<Exercise | null> {
    const db = getDatabase();
    return await db.exercises.getById(exerciseId);
  }

  /**
   * Save an exercise (create or update)
   */
  static async save(exercise: Exercise): Promise<string> {
    const db = getDatabase();
    return await db.exercises.save(exercise);
  }

  /**
   * Delete an exercise
   */
  static async delete(exerciseId: string): Promise<void> {
    const db = getDatabase();
    await db.exercises.delete(exerciseId);
  }

  /**
   * Search exercises with filters
   */
  static async search(filters: ExerciseFilters): Promise<Exercise[]> {
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
}
