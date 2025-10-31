import { db } from "@/shared/storage/database";
import type { Exercise, ExerciseFilters } from "../types/exercise.types";

/**
 * Repository for exercise data access using Dexie.js
 * Handles CRUD operations for exercises
 */
export class ExerciseRepository {
  /**
   * Get all exercises
   */
  static async getAll(): Promise<Exercise[]> {
    return await db.exercises.orderBy("name").toArray();
  }

  /**
   * Get an exercise by ID
   */
  static async getById(id: string): Promise<Exercise | null> {
    return (await db.exercises.get(id)) ?? null;
  }

  /**
   * Save an exercise (create or update)
   */
  static async save(exercise: Exercise): Promise<string> {
    return await db.exercises.put(exercise);
  }

  /**
   * Delete an exercise
   */
  static async delete(id: string): Promise<void> {
    await db.exercises.delete(id);
  }

  /**
   * Search exercises with filters
   */
  static async search(filters: ExerciseFilters): Promise<Exercise[]> {
    let collection = db.exercises.toCollection();

    // Filter by category if specified
    if (filters.category) {
      collection = db.exercises.where("category").equals(filters.category);
    }

    let exercises = await collection.toArray();

    // Apply text search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      exercises = exercises.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.description?.toLowerCase().includes(query)
      );
    }

    // Filter by muscle group
    if (filters.muscleGroup) {
      exercises = exercises.filter((e) =>
        e.muscleGroups?.some(
          (mg) => mg.toLowerCase() === filters.muscleGroup?.toLowerCase()
        )
      );
    }

    // Filter by equipment
    if (filters.equipment) {
      exercises = exercises.filter((e) =>
        e.equipment?.some(
          (eq) => eq.toLowerCase() === filters.equipment?.toLowerCase()
        )
      );
    }

    return exercises.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get exercises by category
   */
  static async getByCategory(
    category: Exercise["category"]
  ): Promise<Exercise[]> {
    return await db.exercises.where("category").equals(category).sortBy("name");
  }

  /**
   * Get exercises by name (case-insensitive search)
   */
  static async searchByName(query: string): Promise<Exercise[]> {
    const lowerQuery = query.toLowerCase();
    return await db.exercises
      .filter((exercise) => exercise.name.toLowerCase().includes(lowerQuery))
      .sortBy("name");
  }
}
