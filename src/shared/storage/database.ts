import Dexie, { Table } from "dexie";
import type {
  Workout,
  WorkoutRoutine,
} from "@/features/workouts/types/workout.types";
import type { Exercise } from "@/features/exercises/types/exercise.types";

/**
 * Fitness Database using Dexie.js
 * Provides persistent storage with IndexedDB (web) and can be extended for native SQLite
 */
export class FitnessDatabase extends Dexie {
  workouts!: Table<Workout, string>;
  routines!: Table<WorkoutRoutine, string>;
  exercises!: Table<Exercise, string>;

  constructor() {
    super("FitnessDatabase");

    // Define schema version 1
    // Indexes: ++ = auto-increment primary key, * = multi-entry index
    this.version(1).stores({
      workouts: "++id, name, createdAt, startTime, endTime",
      exercises: "++id, name, category, createdAt",
      routines: "++id, name, createdAt",
    });
  }
}

// Export singleton instance
export const db = new FitnessDatabase();
