import { LocalStorage } from "@/shared/storage/local-storage";
import type { Exercise, ExerciseFilters } from "../types/exercise.types";

const STORAGE_KEY = "exercises";

/**
 * Repository for exercise data access
 * Handles CRUD operations for exercises
 */
export class ExerciseRepository {
  /**
   * Get all exercises
   */
  static async getAll(): Promise<Exercise[]> {
    const exercises = await LocalStorage.get<Exercise[]>(STORAGE_KEY);
    return exercises || [];
  }

  /**
   * Get an exercise by ID
   */
  static async getById(id: string): Promise<Exercise | null> {
    const exercises = await this.getAll();
    return exercises.find((e) => e.id === id) || null;
  }

  /**
   * Save an exercise
   */
  static async save(exercise: Exercise): Promise<void> {
    const exercises = await this.getAll();
    const index = exercises.findIndex((e) => e.id === exercise.id);

    if (index >= 0) {
      exercises[index] = exercise;
    } else {
      exercises.push(exercise);
    }

    await LocalStorage.set(STORAGE_KEY, exercises);
  }

  /**
   * Delete an exercise
   */
  static async delete(id: string): Promise<void> {
    const exercises = await this.getAll();
    const filtered = exercises.filter((e) => e.id !== id);
    await LocalStorage.set(STORAGE_KEY, filtered);
  }

  /**
   * Search exercises with filters
   */
  static async search(filters: ExerciseFilters): Promise<Exercise[]> {
    let exercises = await this.getAll();

    if (filters.category) {
      exercises = exercises.filter((e) => e.category === filters.category);
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      exercises = exercises.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.description?.toLowerCase().includes(query)
      );
    }

    if (filters.muscleGroup) {
      exercises = exercises.filter((e) =>
        e.muscleGroups?.some(
          (mg) => mg.toLowerCase() === filters.muscleGroup?.toLowerCase()
        )
      );
    }

    if (filters.equipment) {
      exercises = exercises.filter((e) =>
        e.equipment?.some(
          (eq) => eq.toLowerCase() === filters.equipment?.toLowerCase()
        )
      );
    }

    return exercises;
  }

  /**
   * Get exercises by category
   */
  static async getByCategory(
    category: Exercise["category"]
  ): Promise<Exercise[]> {
    const exercises = await this.getAll();
    return exercises.filter((e) => e.category === category);
  }
}
