import Dexie, { Table } from "dexie";
import type {
  Workout,
  WorkoutRoutine,
} from "@/features/workouts/types/workout.types";
import type {
  Exercise,
  BodyPart,
  Equipment,
  Muscle,
} from "@/features/exercises/types/exercise.types";

/**
 * Fitness Database using Dexie.js
 * Provides persistent storage with IndexedDB (web) and can be extended for native SQLite
 */
export class FitnessDatabase extends Dexie {
  workouts!: Table<Workout, string>;
  routines!: Table<WorkoutRoutine, string>;
  exercises!: Table<Exercise, string>;
  bodyParts!: Table<BodyPart, string>;
  equipment!: Table<Equipment, string>;
  muscles!: Table<Muscle, string>;
  appSettings!: Table<{ key: string; value: any }, string>;

  constructor() {
    super("FitnessDatabase");

    // Define schema version 1
    // Indexes: ++ = auto-increment primary key, * = multi-entry index
    this.version(1).stores({
      workouts: "++id, name, createdAt, startTime, endTime",
      exercises: "++id, name, category, createdAt",
      routines: "++id, name, createdAt",
    });

    // Define schema version 2 - updated exercise structure with performance indexes
    // IMPORTANT: Dexie cannot change primary key from ++id to exerciseId in an upgrade
    // Solution: We need to delete the database and recreate it, or use a workaround
    // For this migration, we'll delete the exercises table entirely and let it be recreated
    this.version(2)
      .stores({
        workouts: "++id, name, createdAt, startTime, endTime",
        // Note: If version 1 exists, we need to handle the primary key change
        // by deleting the old table first, then recreating with new structure
        exercises: null, // First, delete the old table
        routines: "++id, name, createdAt",
        appSettings: "key",
        bodyParts: "name",
        equipment: "name",
        muscles: "name",
      })
      .upgrade(async (tx) => {
        // The exercises table will be deleted and recreated with new structure
        // No data migration needed as exercises will be reloaded from JSON
      });

    // Define schema version 3 - recreate exercises table with new primary key
    this.version(3).stores({
      workouts: "++id, name, createdAt, startTime, endTime",
      exercises: "exerciseId, name, *bodyParts, *equipments, *targetMuscles", // New structure
      routines: "++id, name, createdAt",
      appSettings: "key",
      bodyParts: "name",
      equipment: "name",
      muscles: "name",
    });
  }
}

// Export singleton instance
export const db = new FitnessDatabase();
