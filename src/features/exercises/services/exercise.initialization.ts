import { db } from "@/shared/storage/database";
import { AppState } from "@/shared/storage/app.state";
import type { Exercise, BodyPart, Equipment, Muscle } from "../types/exercise.types";

// Import JSON data files
import exercisesData from "../data/exercises.json";
import bodyPartsData from "../data/bodyparts.json";
import equipmentData from "../data/equipment.json";
import musclesData from "../data/muscles.json";

/**
 * Initialize exercise library from JSON data files
 * Loads exercises and reference data into the database
 */
export class ExerciseInitialization {
  /**
   * Check if exercises are already loaded in the database
   */
  static async isInitialized(): Promise<boolean> {
    return await AppState.isInitialized();
  }

  /**
   * Load all exercises and reference data into the database
   * @param onProgress Optional callback for progress updates (0-100)
   */
  static async initialize(onProgress?: (progress: number) => void): Promise<void> {
    try {
      // Check if already initialized
      if (await this.isInitialized()) {
        return;
      }

      // Step 1: Load reference data (20% of progress)
      onProgress?.(0);
      await this.loadReferenceData();
      onProgress?.(20);

      // Step 2: Load exercises in batches (80% of progress)
      await this.loadExercises((batchProgress) => {
        // Map batch progress (0-100) to overall progress (20-100)
        onProgress?.(20 + (batchProgress * 0.8));
      });

      // Step 3: Mark as initialized
      await AppState.markAsInitialized();
      onProgress?.(100);
    } catch (error) {
      console.error("Failed to initialize exercise library:", error);
      throw new Error(
        `Failed to initialize exercise library: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Load reference data (bodyParts, equipment, muscles) into database
   */
  private static async loadReferenceData(): Promise<void> {
    // Load body parts
    const bodyParts: BodyPart[] = bodyPartsData.map((item) => ({
      name: item.name,
    }));
    await db.bodyParts.bulkPut(bodyParts);

    // Load equipment
    const equipment: Equipment[] = equipmentData.map((item) => ({
      name: item.name,
    }));
    await db.equipment.bulkPut(equipment);

    // Load muscles
    const muscles: Muscle[] = musclesData.map((item) => ({
      name: item.name,
    }));
    await db.muscles.bulkPut(muscles);
  }

  /**
   * Load exercises into database in batches for UI responsiveness
   * @param onProgress Optional callback for batch progress (0-100)
   */
  private static async loadExercises(onProgress?: (progress: number) => void): Promise<void> {
    const exercises: Exercise[] = exercisesData as Exercise[];
    const BATCH_SIZE = 500; // Process 500 exercises at a time
    const totalBatches = Math.ceil(exercises.length / BATCH_SIZE);

    for (let i = 0; i < totalBatches; i++) {
      const start = i * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, exercises.length);
      const batch = exercises.slice(start, end);

      // Use bulkPut for efficient batch insertion
      await db.exercises.bulkPut(batch);

      // Update progress
      const batchProgress = ((i + 1) / totalBatches) * 100;
      onProgress?.(batchProgress);

      // Small delay to keep UI responsive (only if not the last batch)
      if (i < totalBatches - 1) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }
  }

  /**
   * Reset initialization (useful for testing or re-initialization)
   */
  static async reset(): Promise<void> {
    await db.exercises.clear();
    await db.bodyParts.clear();
    await db.equipment.clear();
    await db.muscles.clear();
    await AppState.resetInitialization();
  }
}

