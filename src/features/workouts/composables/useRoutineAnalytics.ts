import { ref, computed } from "vue";
import { WorkoutRepository } from "../repositories/workout.repository";
import type {
  RoutineAnalytics,
  RoutineAnalyticsSummary,
  RoutinePerformanceMetrics,
} from "../types/analytics.types";
import type { Workout } from "../types/workout.types";
import { generateId } from "@/shared/utils/id";

/**
 * Composable for routine analytics and performance tracking
 */
export function useRoutineAnalytics() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Calculate completion percentage for a workout
   */
  function calculateWorkoutCompletionPercentage(workout: Workout): number {
    if (workout.type === "interval") {
      // For interval workouts, check if all rounds completed
      if (workout.intervalProgress) {
        const config = workout.intervalConfig;
        if (config && workout.intervalProgress.currentRound >= config.rounds) {
          return 100;
        }
        return (
          (workout.intervalProgress.currentRound / (config?.rounds || 1)) * 100
        );
      }
      return 0;
    }

    // For regular workouts, calculate based on completed sets
    let totalSets = 0;
    let completedSets = 0;

    workout.exercises.forEach((exercise) => {
      exercise.sets.forEach((set) => {
        totalSets++;
        if (set.completed) {
          completedSets++;
        }
      });
    });

    return totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  }

  /**
   * Calculate workout volume (total weight lifted)
   */
  function calculateWorkoutVolume(workout: Workout): number {
    if (workout.type !== "regular") return 0;

    let totalVolume = 0;
    workout.exercises.forEach((exercise) => {
      exercise.sets.forEach((set) => {
        if (set.completed && set.reps && set.weight) {
          totalVolume += set.reps * set.weight;
        }
      });
    });

    return totalVolume;
  }

  /**
   * Calculate workout duration in minutes
   */
  function calculateWorkoutDuration(workout: Workout): number {
    if (!workout.startTime) return 0;

    const start = new Date(workout.startTime);
    const end = workout.endTime ? new Date(workout.endTime) : new Date();
    return Math.round((end.getTime() - start.getTime()) / 1000 / 60);
  }

  /**
   * Get analytics summary for a routine
   */
  async function getRoutineAnalyticsSummary(
    routineId: string
  ): Promise<RoutineAnalyticsSummary> {
    try {
      const analytics = await WorkoutRepository.getRoutineAnalytics(routineId);

      if (analytics) {
        return {
          routineId,
          totalWorkouts: analytics.totalWorkoutsStarted,
          completionRate: analytics.averageCompletionRate,
          lastPerformed: analytics.lastStartedAt,
          averageDuration: analytics.averageDuration,
          personalBest: {
            volume: analytics.bestVolume,
            duration: analytics.bestDuration,
          },
        };
      }

      // Return empty summary if no analytics found
      return {
        routineId,
        totalWorkouts: 0,
        completionRate: 0,
      };
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to get analytics summary";
      throw err;
    }
  }

  /**
   * Get detailed performance metrics for a routine
   */
  async function getRoutinePerformanceMetrics(
    routineId: string
  ): Promise<RoutinePerformanceMetrics> {
    try {
      const workouts = await WorkoutRepository.getWorkoutsByRoutineId(
        routineId
      );
      const routine = await WorkoutRepository.getRoutineById(routineId);

      if (!routine) {
        throw new Error("Routine not found");
      }

      // Calculate time-based metrics
      const completedWorkouts = workouts.filter((w) => w.completed);
      const completionRate =
        workouts.length > 0
          ? (completedWorkouts.length / workouts.length) * 100
          : 0;

      // Calculate average workouts per week
      const sortedWorkouts = workouts
        .filter((w) => w.startTime)
        .sort(
          (a, b) =>
            new Date(a.startTime!).getTime() - new Date(b.startTime!).getTime()
        );

      let averageWorkoutsPerWeek = 0;
      if (sortedWorkouts.length > 1) {
        const firstDate = new Date(sortedWorkouts[0].startTime!);
        const lastDate = new Date(
          sortedWorkouts[sortedWorkouts.length - 1].startTime!
        );
        const weeksDiff =
          (lastDate.getTime() - firstDate.getTime()) /
          (1000 * 60 * 60 * 24 * 7);
        averageWorkoutsPerWeek =
          weeksDiff > 0 ? workouts.length / weeksDiff : 0;
      }

      // Calculate streak (consecutive days with workouts)
      const streakDays = calculateStreakDays(sortedWorkouts);

      // Volume and duration progression
      const volumeProgression = sortedWorkouts.map((w) => ({
        date: w.startTime!.toString(),
        volume: calculateWorkoutVolume(w),
      }));

      const durationTrend = sortedWorkouts.map((w) => ({
        date: w.startTime!.toString(),
        duration: calculateWorkoutDuration(w),
      }));

      // Exercise-specific performance
      const exercisePerformance = calculateExercisePerformance(
        workouts,
        routine.exercises
      );

      return {
        routineId,
        routineName: routine.name,
        completionRate,
        averageWorkoutsPerWeek,
        streakDays,
        volumeProgression,
        durationTrend,
        exercisePerformance,
      };
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to get performance metrics";
      throw err;
    }
  }

  /**
   * Update routine analytics after workout completion
   */
  async function updateRoutineAnalyticsAfterWorkout(
    workout: Workout
  ): Promise<void> {
    if (!workout.routineId) return;

    try {
      isLoading.value = true;
      const routineId = workout.routineId;

      // Get existing analytics or create new
      let analytics = await WorkoutRepository.getRoutineAnalytics(routineId);

      // Get all workouts for this routine
      const allWorkouts = await WorkoutRepository.getWorkoutsByRoutineId(
        routineId
      );

      // Calculate updated metrics
      const completedWorkouts = allWorkouts.filter((w) => w.completed);
      const totalStarted = allWorkouts.length;
      const totalCompletions = completedWorkouts.length;

      // Average completion rate
      let totalCompletionPercentage = 0;
      allWorkouts.forEach((w) => {
        totalCompletionPercentage += w.completionPercentage || 0;
      });
      const averageCompletionRate =
        totalStarted > 0 ? totalCompletionPercentage / totalStarted : 0;

      // Average duration
      let totalDuration = 0;
      let durationCount = 0;
      allWorkouts.forEach((w) => {
        const duration = calculateWorkoutDuration(w);
        if (duration > 0) {
          totalDuration += duration;
          durationCount++;
        }
      });
      const averageDuration =
        durationCount > 0 ? totalDuration / durationCount : 0;

      // Average volume
      let totalVolume = 0;
      let volumeCount = 0;
      allWorkouts.forEach((w) => {
        const volume = calculateWorkoutVolume(w);
        if (volume > 0) {
          totalVolume += volume;
          volumeCount++;
        }
      });
      const averageVolume = volumeCount > 0 ? totalVolume / volumeCount : 0;

      // Best metrics
      let bestVolume = analytics?.bestVolume || 0;
      let bestDuration = analytics?.bestDuration || Infinity;

      allWorkouts.forEach((w) => {
        const volume = calculateWorkoutVolume(w);
        const duration = calculateWorkoutDuration(w);
        if (volume > bestVolume) bestVolume = volume;
        if (duration > 0 && duration < bestDuration) bestDuration = duration;
      });

      // Last completed/started
      const sortedByStart = allWorkouts
        .filter((w) => w.startTime)
        .sort(
          (a, b) =>
            new Date(b.startTime!).getTime() - new Date(a.startTime!).getTime()
        );
      const lastStartedAt = sortedByStart[0]?.startTime;

      const sortedByEnd = completedWorkouts
        .filter((w) => w.endTime)
        .sort(
          (a, b) =>
            new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime()
        );
      const lastCompletedAt = sortedByEnd[0]?.endTime;

      // Create or update analytics
      const updatedAnalytics: RoutineAnalytics = {
        id: analytics?.id || generateId(),
        routineId,
        totalCompletions,
        averageCompletionRate,
        totalWorkoutsStarted: totalStarted,
        averageDuration,
        averageVolume,
        lastCompletedAt: lastCompletedAt?.toString(),
        lastStartedAt: lastStartedAt?.toString(),
        bestVolume,
        bestDuration: bestDuration === Infinity ? undefined : bestDuration,
        createdAt: analytics?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await WorkoutRepository.saveRoutineAnalytics(updatedAnalytics);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update analytics";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Calculate consecutive days streak
   */
  function calculateStreakDays(workouts: Workout[]): number {
    if (workouts.length === 0) return 0;

    const sortedWorkouts = workouts
      .filter((w) => w.startTime && w.completed)
      .sort(
        (a, b) =>
          new Date(b.startTime!).getTime() - new Date(a.startTime!).getTime()
      );

    if (sortedWorkouts.length === 0) return 0;

    let streak = 1;
    for (let i = 0; i < sortedWorkouts.length - 1; i++) {
      const current = new Date(sortedWorkouts[i].startTime!);
      const next = new Date(sortedWorkouts[i + 1].startTime!);

      // Calculate day difference
      const daysDiff = Math.floor(
        (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24)
      );

      // If workouts are consecutive days or same day, continue streak
      if (daysDiff <= 1) {
        if (daysDiff === 1) streak++; // Only increment for different days
      } else {
        break; // Streak broken
      }
    }

    return streak;
  }

  /**
   * Calculate exercise-specific performance
   */
  function calculateExercisePerformance(
    workouts: Workout[],
    routineExercises: any[]
  ) {
    const exerciseStats: Record<string, any> = {};

    // Initialize stats for each exercise in routine
    routineExercises.forEach((ex) => {
      exerciseStats[ex.exerciseId || ex.exerciseName] = {
        exerciseId: ex.exerciseId || "",
        exerciseName: ex.exerciseName,
        weights: [],
        reps: [],
        progression: [],
      };
    });

    // Collect data from workouts
    workouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        const key = exercise.exerciseId || exercise.exerciseName;
        if (!exerciseStats[key]) {
          exerciseStats[key] = {
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exerciseName,
            weights: [],
            reps: [],
            progression: [],
          };
        }

        exercise.sets.forEach((set) => {
          if (set.completed && set.weight && set.reps) {
            exerciseStats[key].weights.push(set.weight);
            exerciseStats[key].reps.push(set.reps);

            if (workout.startTime) {
              exerciseStats[key].progression.push({
                date: workout.startTime.toString(),
                weight: set.weight,
                reps: set.reps,
              });
            }
          }
        });
      });
    });

    // Calculate averages and best
    return Object.values(exerciseStats).map((stats: any) => ({
      exerciseId: stats.exerciseId,
      exerciseName: stats.exerciseName,
      averageWeight:
        stats.weights.length > 0
          ? stats.weights.reduce((a: number, b: number) => a + b, 0) /
            stats.weights.length
          : 0,
      averageReps:
        stats.reps.length > 0
          ? stats.reps.reduce((a: number, b: number) => a + b, 0) /
            stats.reps.length
          : 0,
      bestWeight: stats.weights.length > 0 ? Math.max(...stats.weights) : 0,
      progression: stats.progression,
    }));
  }

  return {
    isLoading,
    error,
    calculateWorkoutCompletionPercentage,
    calculateWorkoutVolume,
    calculateWorkoutDuration,
    getRoutineAnalyticsSummary,
    getRoutinePerformanceMetrics,
    updateRoutineAnalyticsAfterWorkout,
  };
}
