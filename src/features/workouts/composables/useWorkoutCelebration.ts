import { ref, computed } from "vue";
import { WorkoutRepository } from "../repositories/workout.repository";
import type { Workout, WorkoutExercise } from "../types/workout.types";

/**
 * Milestone information
 */
export interface MilestoneInfo {
  isMilestone: boolean;
  number: number | null;
  label: string;
  icon: string;
  message: string;
}

/**
 * Personal Record (PR) information
 */
export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  type: "weight" | "reps" | "volume";
  value: number;
  previousBest: number;
  improvement: number;
  improvementPercent: number;
}

/**
 * Positive comparison data (only improvements)
 */
export interface PositiveComparison {
  volume?: {
    current: number;
    previous: number;
    improvement: number;
    improvementPercent: number;
  };
  duration?: {
    current: number;
    previous: number;
    improvement: number;
    improvementPercent: number;
  };
}

/**
 * Workout celebration statistics
 */
export interface CelebrationStats {
  workoutCount: number;
  milestone: MilestoneInfo | null;
  prs: PersonalRecord[];
  comparisons: PositiveComparison | null;
  streak: number;
  weeklyCount: number;
  totalVolume: number;
}

/**
 * Composable for workout celebration and achievement tracking
 */
export function useWorkoutCelebration() {
  const isLoading = ref(false);
  const workoutHistory = ref<Workout[]>([]);

  /**
   * Load workout history from repository
   */
  async function loadWorkoutHistory() {
    isLoading.value = true;
    try {
      workoutHistory.value = await WorkoutRepository.getWorkoutHistory();
    } catch (error) {
      console.error("Failed to load workout history:", error);
      workoutHistory.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Calculate total workout count
   */
  function calculateWorkoutCount(): number {
    return workoutHistory.value.length;
  }

  /**
   * Detect if this is a milestone workout
   */
  function detectMilestone(workoutCount: number): MilestoneInfo {
    const milestones = [
      {
        number: 10,
        label: "10 Workouts",
        icon: "star",
        message: "Amazing start!",
      },
      {
        number: 25,
        label: "25 Workouts",
        icon: "trophy",
        message: "Quarter century!",
      },
      {
        number: 50,
        label: "50 Workouts",
        icon: "medal",
        message: "Half century!",
      },
      {
        number: 100,
        label: "100 Workouts",
        icon: "trophy",
        message: "Century milestone!",
      },
      {
        number: 250,
        label: "250 Workouts",
        icon: "medal",
        message: "Incredible dedication!",
      },
      {
        number: 500,
        label: "500 Workouts",
        icon: "trophy",
        message: "Elite level!",
      },
      {
        number: 1000,
        label: "1000 Workouts",
        icon: "trophy",
        message: "Legendary!",
      },
    ];

    const milestone = milestones.find((m) => m.number === workoutCount);

    if (milestone) {
      return {
        isMilestone: true,
        number: milestone.number,
        label: milestone.label,
        icon: milestone.icon,
        message: milestone.message,
      };
    }

    return {
      isMilestone: false,
      number: null,
      label: "",
      icon: "",
      message: "",
    };
  }

  /**
   * Calculate Personal Records (PRs) achieved in current workout
   */
  function calculatePRs(currentWorkout: Workout): PersonalRecord[] {
    if (currentWorkout.type !== "regular") {
      return []; // PRs only apply to regular workouts with weights
    }

    const prs: PersonalRecord[] = [];

    // For each exercise in current workout
    currentWorkout.exercises.forEach((exercise) => {
      const exerciseId = exercise.exerciseId;
      const exerciseName = exercise.exerciseName;

      // Get all previous workouts containing this exercise
      const previousWorkouts = workoutHistory.value.filter((w) =>
        w.exercises.some(
          (ex) => ex.exerciseId === exerciseId && w.id !== currentWorkout.id
        )
      );

      // Find max weight, max reps, and max volume from history
      let maxWeight = 0;
      let maxReps = 0;
      let maxVolume = 0;

      previousWorkouts.forEach((workout) => {
        const prevExercise = workout.exercises.find(
          (ex) => ex.exerciseId === exerciseId
        );
        if (!prevExercise) return;

        prevExercise.sets.forEach((set) => {
          if (set.completed && set.weight && set.reps) {
            const volume = set.weight * set.reps;
            maxWeight = Math.max(maxWeight, set.weight);
            maxReps = Math.max(maxReps, set.reps);
            maxVolume = Math.max(maxVolume, volume);
          }
        });
      });

      // Check current workout sets for PRs
      exercise.sets.forEach((set) => {
        if (!set.completed || !set.weight || !set.reps) return;

        const volume = set.weight * set.reps;

        // Check for weight PR (including first time doing exercise)
        if (set.weight > maxWeight || maxWeight === 0) {
          const improvement = set.weight - maxWeight;
          // Use a high percentage for first-time exercises, otherwise calculate normally
          const improvementPercent =
            maxWeight > 0 ? (improvement / maxWeight) * 100 : 100; // First time = 100% improvement
          prs.push({
            exerciseId,
            exerciseName,
            type: "weight",
            value: set.weight,
            previousBest: maxWeight,
            improvement,
            improvementPercent,
          });
        }

        // Check for rep PR (including first time doing exercise)
        if (set.reps > maxReps || maxReps === 0) {
          const improvement = set.reps - maxReps;
          const improvementPercent =
            maxReps > 0 ? (improvement / maxReps) * 100 : 100; // First time = 100% improvement
          prs.push({
            exerciseId,
            exerciseName,
            type: "reps",
            value: set.reps,
            previousBest: maxReps,
            improvement,
            improvementPercent,
          });
        }

        // Check for volume PR (including first time doing exercise)
        if (volume > maxVolume || maxVolume === 0) {
          const improvement = volume - maxVolume;
          const improvementPercent =
            maxVolume > 0 ? (improvement / maxVolume) * 100 : 100; // First time = 100% improvement
          prs.push({
            exerciseId,
            exerciseName,
            type: "volume",
            value: volume,
            previousBest: maxVolume,
            improvement,
            improvementPercent,
          });
        }
      });
    });

    // Remove duplicates (if same exercise has multiple PRs, keep only the best one)
    const uniquePRs = new Map<string, PersonalRecord>();
    prs.forEach((pr) => {
      const key = `${pr.exerciseId}-${pr.type}`;
      const existing = uniquePRs.get(key);
      if (!existing || pr.improvementPercent > existing.improvementPercent) {
        uniquePRs.set(key, pr);
      }
    });

    return Array.from(uniquePRs.values());
  }

  /**
   * Calculate workout volume
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
   * Get positive comparisons (only improvements)
   */
  function getPositiveComparisons(
    currentWorkout: Workout,
    workoutCount: number
  ): PositiveComparison | null {
    // Get most recent workout of same type (excluding current)
    const previousWorkouts = workoutHistory.value
      .filter(
        (w) =>
          w.type === currentWorkout.type &&
          w.id !== currentWorkout.id &&
          w.completed
      )
      .sort(
        (a, b) =>
          new Date(b.endTime || b.startTime || "").getTime() -
          new Date(a.endTime || a.startTime || "").getTime()
      );

    if (previousWorkouts.length === 0) {
      return null; // No previous workouts to compare
    }

    const previousWorkout = previousWorkouts[0];
    const comparison: PositiveComparison = {};

    // Compare volume (only for regular workouts)
    if (currentWorkout.type === "regular") {
      const currentVolume = calculateWorkoutVolume(currentWorkout);
      const previousVolume = calculateWorkoutVolume(previousWorkout);

      if (currentVolume > previousVolume) {
        const improvement = currentVolume - previousVolume;
        const improvementPercent =
          previousVolume > 0 ? (improvement / previousVolume) * 100 : 0;

        comparison.volume = {
          current: currentVolume,
          previous: previousVolume,
          improvement,
          improvementPercent,
        };
      }
    }

    // Compare duration (if improved)
    const currentDuration = calculateWorkoutDuration(currentWorkout);
    const previousDuration = calculateWorkoutDuration(previousWorkout);

    if (
      currentDuration > 0 &&
      previousDuration > 0 &&
      currentDuration < previousDuration
    ) {
      // Shorter duration is better
      const improvement = previousDuration - currentDuration;
      const improvementPercent =
        previousDuration > 0 ? (improvement / previousDuration) * 100 : 0;

      comparison.duration = {
        current: currentDuration,
        previous: previousDuration,
        improvement,
        improvementPercent,
      };
    }

    // Only return if there's at least one positive comparison
    return Object.keys(comparison).length > 0 ? comparison : null;
  }

  /**
   * Calculate workout streak (consecutive days)
   */
  function calculateStreak(): number {
    if (workoutHistory.value.length === 0) return 0;

    // Sort workouts by date (most recent first)
    const sortedWorkouts = [...workoutHistory.value].sort((a, b) => {
      const dateA = new Date(a.endTime || a.startTime || "").getTime();
      const dateB = new Date(b.endTime || b.startTime || "").getTime();
      return dateB - dateA;
    });

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const workout of sortedWorkouts) {
      const workoutDate = new Date(workout.endTime || workout.startTime || "");
      workoutDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === streak) {
        streak++;
        currentDate = workoutDate;
      } else if (daysDiff > streak) {
        // Gap found, streak broken
        break;
      }
    }

    return streak;
  }

  /**
   * Get weekly workout count
   */
  function getWeeklyStats(): number {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return workoutHistory.value.filter((workout) => {
      const workoutDate = new Date(workout.endTime || workout.startTime || "");
      return workoutDate >= weekAgo;
    }).length;
  }

  /**
   * Calculate total volume lifted (all-time)
   */
  function calculateTotalVolume(): number {
    let total = 0;
    workoutHistory.value.forEach((workout) => {
      total += calculateWorkoutVolume(workout);
    });
    return total;
  }

  /**
   * Get all celebration stats for a completed workout
   */
  async function getCelebrationStats(
    currentWorkout: Workout
  ): Promise<CelebrationStats> {
    await loadWorkoutHistory();

    const workoutCount = calculateWorkoutCount() + 1; // +1 for current workout
    const milestone = detectMilestone(workoutCount);
    const prs = calculatePRs(currentWorkout);
    const comparisons = getPositiveComparisons(currentWorkout, workoutCount);
    const streak = calculateStreak();
    const weeklyCount = getWeeklyStats();
    const totalVolume =
      calculateTotalVolume() + calculateWorkoutVolume(currentWorkout);

    return {
      workoutCount,
      milestone,
      prs,
      comparisons,
      streak,
      weeklyCount,
      totalVolume,
    };
  }

  return {
    isLoading,
    workoutHistory,
    loadWorkoutHistory,
    calculateWorkoutCount,
    detectMilestone,
    calculatePRs,
    getPositiveComparisons,
    calculateStreak,
    getWeeklyStats,
    calculateTotalVolume,
    getCelebrationStats,
  };
}
