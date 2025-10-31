import { db } from "@/shared/storage/database";
import type { Exercise, ExerciseFilters } from "../types/exercise.types";

/**
 * Repository for exercise data access using Dexie.js
 * Handles CRUD operations for exercises with performance-optimized queries using indexes
 */
export class ExerciseRepository {
  /**
   * Get all exercises
   */
  static async getAll(): Promise<Exercise[]> {
    return await db.exercises.orderBy("name").toArray();
  }

  /**
   * Get an exercise by ID (exerciseId)
   */
  static async getById(exerciseId: string): Promise<Exercise | null> {
    return (await db.exercises.get(exerciseId)) ?? null;
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
  static async delete(exerciseId: string): Promise<void> {
    await db.exercises.delete(exerciseId);
  }

  /**
   * Search exercises with filters using indexed queries for performance
   */
  static async search(filters: ExerciseFilters): Promise<Exercise[]> {
    let exercises: Exercise[] = [];

    // Build query using indexes for optimal performance
    if (filters.bodyParts && filters.bodyParts.length > 0) {
      // Use indexed query for bodyParts (multi-entry index)
      const bodyPartQueries = filters.bodyParts.map((bodyPart) =>
        db.exercises.where("bodyParts").equals(bodyPart)
      );
      
      // If multiple body parts, we need to intersect results
      if (bodyPartQueries.length === 1) {
        exercises = await bodyPartQueries[0].toArray();
      } else {
        // For multiple body parts, get results from each and intersect
        const allResults = await Promise.all(
          bodyPartQueries.map((q) => q.toArray())
        );
        // Intersect: exercises that have all specified body parts
        exercises = allResults.reduce((acc, curr) =>
          acc.filter((ex) => curr.some((e) => e.exerciseId === ex.exerciseId))
        );
      }
    } else if (filters.equipments && filters.equipments.length > 0) {
      // Use indexed query for equipments (multi-entry index)
      const equipmentQueries = filters.equipments.map((equipment) =>
        db.exercises.where("equipments").equals(equipment)
      );
      
      if (equipmentQueries.length === 1) {
        exercises = await equipmentQueries[0].toArray();
      } else {
        const allResults = await Promise.all(
          equipmentQueries.map((q) => q.toArray())
        );
        exercises = allResults.reduce((acc, curr) =>
          acc.filter((ex) => curr.some((e) => e.exerciseId === ex.exerciseId))
        );
      }
    } else if (filters.targetMuscles && filters.targetMuscles.length > 0) {
      // Use indexed query for targetMuscles (multi-entry index)
      const muscleQueries = filters.targetMuscles.map((muscle) =>
        db.exercises.where("targetMuscles").equals(muscle)
      );
      
      if (muscleQueries.length === 1) {
        exercises = await muscleQueries[0].toArray();
      } else {
        const allResults = await Promise.all(
          muscleQueries.map((q) => q.toArray())
        );
        exercises = allResults.reduce((acc, curr) =>
          acc.filter((ex) => curr.some((e) => e.exerciseId === ex.exerciseId))
        );
      }
    } else {
      // No indexed filters, get all exercises
      exercises = await db.exercises.toArray();
    }

    // Apply additional filters (text search, combine multiple filter types)
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

    // Apply multiple filter types intersection
    if (filters.bodyParts && filters.bodyParts.length > 0) {
      exercises = exercises.filter((e) =>
        filters.bodyParts!.some((bp) =>
          e.bodyParts.some((ebp) => ebp.toLowerCase() === bp.toLowerCase())
        )
      );
    }

    if (filters.equipments && filters.equipments.length > 0) {
      exercises = exercises.filter((e) =>
        filters.equipments!.some((eq) =>
          e.equipments.some((eeq) => eeq.toLowerCase() === eq.toLowerCase())
        )
      );
    }

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
   * Get exercises by body part (using indexed query)
   */
  static async getByBodyPart(bodyPart: string): Promise<Exercise[]> {
    return await db.exercises
      .where("bodyParts")
      .equals(bodyPart)
      .sortBy("name");
  }

  /**
   * Get exercises by equipment (using indexed query)
   */
  static async getByEquipment(equipment: string): Promise<Exercise[]> {
    return await db.exercises
      .where("equipments")
      .equals(equipment)
      .sortBy("name");
  }

  /**
   * Get exercises by target muscle (using indexed query)
   */
  static async getByTargetMuscle(targetMuscle: string): Promise<Exercise[]> {
    return await db.exercises
      .where("targetMuscles")
      .equals(targetMuscle)
      .sortBy("name");
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
