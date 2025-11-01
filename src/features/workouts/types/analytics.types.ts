/**
 * Workout analytics types and interfaces
 */

/**
 * Routine analytics stored in database
 */
export interface RoutineAnalytics {
  id: string;
  routineId: string;
  // Aggregated metrics
  totalCompletions: number;
  averageCompletionRate: number; // 0-100
  totalWorkoutsStarted: number;
  averageDuration: number; // in minutes
  averageVolume: number; // total weight lifted
  lastCompletedAt?: Date | string;
  lastStartedAt?: Date | string;
  // Performance tracking
  bestVolume?: number;
  bestDuration?: number; // fastest completion in minutes
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Comprehensive performance metrics for a routine
 */
export interface RoutinePerformanceMetrics {
  routineId: string;
  routineName: string;
  // Time-based metrics
  completionRate: number; // 0-100
  averageWorkoutsPerWeek: number;
  streakDays: number; // Consecutive days with completed workouts
  // Performance metrics
  volumeProgression: Array<{ date: string; volume: number }>;
  durationTrend: Array<{ date: string; duration: number }>;
  // Exercise-specific metrics
  exercisePerformance: Array<{
    exerciseId: string;
    exerciseName: string;
    averageWeight: number;
    averageReps: number;
    bestWeight: number;
    progression: Array<{ date: string; weight: number; reps: number }>;
  }>;
}

/**
 * Simple analytics summary for routine display
 */
export interface RoutineAnalyticsSummary {
  routineId: string;
  totalWorkouts: number;
  completionRate: number;
  lastPerformed?: Date | string;
  averageDuration?: number;
  personalBest?: {
    volume?: number;
    duration?: number;
  };
}
