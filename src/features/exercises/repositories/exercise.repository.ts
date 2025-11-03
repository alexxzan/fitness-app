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
    const exercises = await db.exercises.getAll();
    console.log(`📚 ExerciseRepository.getAll() retrieved ${exercises.length} exercises`);
    return exercises;
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

    // Filter out invalid exercises first
    exercises = exercises.filter(
      (e) =>
        e &&
        e.name &&
        e.exerciseId &&
        e.name.trim().length > 0 &&
        e.exerciseId.trim().length > 0
    );

    // Apply search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      exercises = exercises.filter(
        (e) =>
          (e.name || '').toLowerCase().includes(query) ||
          (e.targetMuscles || []).some((m) => m.toLowerCase().includes(query)) ||
          (e.bodyParts || []).some((bp) => bp.toLowerCase().includes(query)) ||
          (e.equipments || []).some((eq) => eq.toLowerCase().includes(query))
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

    // Filter out invalid exercises and sort safely
    const validExercises = exercises.filter(e => e && e.name && e.exerciseId);
    return validExercises.sort((a, b) => {
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }

  /**
   * Get exercises by body part
   */
  static async getByBodyPart(bodyPart: string): Promise<Exercise[]> {
    const allExercises = await this.getAll();
    const validExercises = allExercises.filter(
      (e) =>
        e &&
        e.name &&
        e.exerciseId &&
        e.name.trim().length > 0 &&
        e.exerciseId.trim().length > 0
    );
    return validExercises
      .filter((e) =>
        (e.bodyParts || []).some((bp) => bp.toLowerCase() === bodyPart.toLowerCase())
      )
      .sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }

  /**
   * Get exercises by equipment
   */
  static async getByEquipment(equipment: string): Promise<Exercise[]> {
    const allExercises = await this.getAll();
    const validExercises = allExercises.filter(
      (e) =>
        e &&
        e.name &&
        e.exerciseId &&
        e.name.trim().length > 0 &&
        e.exerciseId.trim().length > 0
    );
    return validExercises
      .filter((e) =>
        (e.equipments || []).some((eq) => eq.toLowerCase() === equipment.toLowerCase())
      )
      .sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }

  /**
   * Get exercises by target muscle
   */
  static async getByTargetMuscle(targetMuscle: string): Promise<Exercise[]> {
    const allExercises = await this.getAll();
    const validExercises = allExercises.filter(
      (e) =>
        e &&
        e.name &&
        e.exerciseId &&
        e.name.trim().length > 0 &&
        e.exerciseId.trim().length > 0
    );
    return validExercises
      .filter((e) =>
        (e.targetMuscles || []).some(
          (tm) => tm.toLowerCase() === targetMuscle.toLowerCase()
        )
      )
      .sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }

  /**
   * Get exercises by name (case-insensitive search)
   */
  static async searchByName(query: string): Promise<Exercise[]> {
    const lowerQuery = query.toLowerCase();
    const allExercises = await this.getAll();
    const validExercises = allExercises.filter(
      (e) =>
        e &&
        e.name &&
        e.exerciseId &&
        e.name.trim().length > 0 &&
        e.exerciseId.trim().length > 0
    );
    return validExercises
      .filter((exercise) => (exercise.name || '').toLowerCase().includes(lowerQuery))
      .sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }
}
