/**
 * Workout-related TypeScript types and interfaces
 */

import type { IntervalConfig, IntervalProgress } from "./interval.types";

/**
 * Workout type discriminator
 */
export type WorkoutType = "regular" | "interval";

export interface WorkoutSet {
  id: string;
  reps?: number;
  weight?: number; // in kg
  restTime?: number; // in seconds
  completed: boolean;
  notes?: string;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: WorkoutSet[];
  notes?: string;
  order: number;
}

export interface Workout {
  id: string;
  name: string;
  type: WorkoutType;
  exercises: WorkoutExercise[];
  // Interval workout specific fields
  intervalConfig?: IntervalConfig;
  intervalProgress?: IntervalProgress;
  // Routine tracking fields
  routineId?: string; // Reference to routines table (if started from routine)
  routineTemplateId?: string; // Direct reference to template if used directly
  // Analytics fields
  completed?: boolean;
  completionPercentage?: number; // 0-100
  // Common fields
  startTime?: Date | string;
  endTime?: Date | string;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Exercise structure for workout routines
 */
export interface RoutineExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  targetSets?: number; // Suggested sets
  targetReps?: string; // Suggested reps (e.g., "8-10", "5")
  targetWeight?: number; // Optional target weight
  restTime?: number; // Suggested rest time in seconds
  notes?: string;
  order: number;
}

/**
 * Workout routine (both custom and template-based)
 */
export interface WorkoutRoutine {
  id: string;
  name: string;
  description?: string;
  exercises: RoutineExercise[];
  type: "custom" | "template";
  templateId?: string; // Reference to workout-templates.json (if template-based)
  isFavorite?: boolean;
  tags?: string[];
  estimatedDuration?: number; // in minutes
  difficulty?: "beginner" | "intermediate" | "advanced";
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface WorkoutStatistics {
  totalVolume: number; // Total weight lifted
  totalSets: number;
  totalReps: number;
  duration: number; // in minutes
  exercisesCount: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  durationWeeks: number;
  exercises: Array<{
    exerciseId: string; // Reference to exercises.json
    exerciseName: string; // Human-readable name for display
    targetSets?: number;
    targetReps?: string;
  }>;
}
