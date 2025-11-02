import { getDatabase } from "@/shared/storage/database-adapter";
import { AppState } from "@/shared/storage/app.state";
import type {
  Exercise,
  BodyPart,
  Equipment,
  Muscle,
} from "../types/exercise.types";

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
  static async initialize(
    onProgress?: (progress: number) => void
  ): Promise<void> {
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
        onProgress?.(20 + batchProgress * 0.8);
      });

      // Step 3: Mark as initialized
      await AppState.markAsInitialized();
      onProgress?.(100);
    } catch (error) {
      console.error("Failed to initialize exercise library:", error);
      throw new Error(
        `Failed to initialize exercise library: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Load reference data (bodyParts, equipment, muscles) into database
   */
  private static async loadReferenceData(): Promise<void> {
    const db = getDatabase();

    console.log("📚 Loading reference data...");

    // Load body parts
    const bodyParts: BodyPart[] = bodyPartsData.map((item) => ({
      name: item.name,
    }));
    console.log(`  Loading ${bodyParts.length} body parts...`);
    await db.bodyParts.bulkInsert(bodyParts);

    // Load equipment
    const equipment: Equipment[] = equipmentData.map((item) => ({
      name: item.name,
    }));
    console.log(`  Loading ${equipment.length} equipment types...`);
    await db.equipment.bulkInsert(equipment);

    // Load muscles
    const muscles: Muscle[] = musclesData.map((item) => ({
      name: item.name,
    }));
    console.log(`  Loading ${muscles.length} muscles...`);
    await db.muscles.bulkInsert(muscles);

    console.log("✅ Reference data loaded successfully");
  }

  /**
   * Load exercises into database in batches for UI responsiveness
   * @param onProgress Optional callback for batch progress (0-100)
   */
  private static async loadExercises(
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const db = getDatabase();
    const exercises: Exercise[] = exercisesData as Exercise[];
    const BATCH_SIZE = 100; // Process 100 exercises at a time
    const totalBatches = Math.ceil(exercises.length / BATCH_SIZE);

    console.log(
      `💪 Loading ${exercises.length} exercises in ${totalBatches} batches...`
    );

    for (let i = 0; i < totalBatches; i++) {
      const start = i * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, exercises.length);
      const batch = exercises.slice(start, end);

      // Use bulk insert for efficiency
      await db.exercises.bulkInsert(batch);

      // Update progress
      const batchProgress = ((i + 1) / totalBatches) * 100;
      onProgress?.(batchProgress);

      // Log progress every 10 batches
      if ((i + 1) % 10 === 0 || i === totalBatches - 1) {
        console.log(
          `  Loaded ${end}/${exercises.length} exercises (${Math.round(
            batchProgress
          )}%)`
        );
      }

      // Small delay to keep UI responsive (only if not the last batch)
      if (i < totalBatches - 1) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }

    console.log("✅ All exercises loaded successfully");
  }

  /**
   * Reset initialization (useful for testing or re-initialization)
   */
  static async reset(): Promise<void> {
    const db = getDatabase();
    await db.exercises.clear();
    await db.bodyParts.clear();
    await db.equipment.clear();
    await db.muscles.clear();
    await AppState.resetInitialization();
  }
}
