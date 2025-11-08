import { WorkoutRepository } from "@/features/workouts/repositories/workout.repository";
import type { Workout } from "@/features/workouts/types/workout.types";
import type {
  CardioWorkoutStats,
  CardioPeriodStats,
} from "../types/cardio.types";

/**
 * Repository for cardio workout data access
 * Wraps WorkoutRepository and filters for cardio-specific workouts
 */
export class CardioRepository {
  /**
   * Check if a workout is a cardio workout
   */
  private static isCardioWorkout(workout: Workout): boolean {
    return workout.type === "cardio-gps" || workout.type === "cardio-manual";
  }

  /**
   * Get all cardio workouts
   */
  static async getAll(): Promise<Workout[]> {
    const allWorkouts = await WorkoutRepository.getAll();
    return allWorkouts.filter(this.isCardioWorkout);
  }

  /**
   * Get a cardio workout by ID
   */
  static async getById(id: string): Promise<Workout | null> {
    const workout = await WorkoutRepository.getById(id);
    if (workout && this.isCardioWorkout(workout)) {
      return workout;
    }
    return null;
  }

  /**
   * Save a cardio workout (create or update)
   */
  static async save(workout: Workout): Promise<string> {
    if (!this.isCardioWorkout(workout)) {
      throw new Error("Workout must be a cardio workout type");
    }
    return await WorkoutRepository.save(workout);
  }

  /**
   * Delete a cardio workout
   */
  static async delete(id: string): Promise<void> {
    await WorkoutRepository.delete(id);
  }

  /**
   * Get the currently active cardio workout (if any)
   */
  static async getActiveWorkout(): Promise<Workout | null> {
    const activeWorkout = await WorkoutRepository.getActiveWorkout();
    if (activeWorkout && this.isCardioWorkout(activeWorkout)) {
      return activeWorkout;
    }
    return null;
  }

  /**
   * Get cardio workout history (completed workouts) sorted by date
   */
  static async getHistory(): Promise<Workout[]> {
    const allCardio = await this.getAll();
    return allCardio
      .filter((w) => w.completed && w.endTime)
      .sort(
        (a, b) =>
          new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime()
      );
  }

  /**
   * Get recent cardio workouts (last N workouts)
   */
  static async getRecentWorkouts(limit: number = 10): Promise<Workout[]> {
    const history = await this.getHistory();
    return history.slice(0, limit);
  }

  /**
   * Get cardio workouts for a date range
   */
  static async getStatsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Workout[]> {
    const allCardio = await this.getAll();
    return allCardio.filter((w) => {
      if (!w.startTime) return false;
      const workoutDate = new Date(w.startTime);
      return workoutDate >= startDate && workoutDate <= endDate;
    });
  }

  /**
   * Get weekly cardio statistics
   */
  static async getWeeklyStats(
    weekStartDate: Date
  ): Promise<CardioPeriodStats> {
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    const workouts = await this.getStatsByDateRange(weekStartDate, weekEndDate);
    return this.calculatePeriodStats(workouts, "week", weekStartDate, weekEndDate);
  }

  /**
   * Get monthly cardio statistics
   */
  static async getMonthlyStats(
    monthStartDate: Date
  ): Promise<CardioPeriodStats> {
    const monthEndDate = new Date(monthStartDate);
    monthEndDate.setMonth(monthEndDate.getMonth() + 1);
    monthEndDate.setDate(monthEndDate.getDate() - 1);

    const workouts = await this.getStatsByDateRange(
      monthStartDate,
      monthEndDate
    );
    return this.calculatePeriodStats(
      workouts,
      "month",
      monthStartDate,
      monthEndDate
    );
  }

  /**
   * Calculate statistics for a period
   */
  private static calculatePeriodStats(
    workouts: Workout[],
    period: "week" | "month",
    startDate: Date,
    endDate: Date
  ): CardioPeriodStats {
    let totalDistance = 0;
    let totalDuration = 0;
    let totalElevationGain = 0;
    let totalCalories = 0;
    let totalPace = 0;
    let paceCount = 0;

    const workoutSummaries = workouts
      .filter((w) => w.completed && w.cardioData && w.startTime && w.endTime)
      .map((w) => {
        const cardioData = w.cardioData!;
        const duration =
          (new Date(w.endTime!).getTime() -
            new Date(w.startTime!).getTime()) /
          1000;

        totalDistance += cardioData.distance;
        totalDuration += duration;
        totalElevationGain += cardioData.elevationGain;
        totalCalories += cardioData.calories;
        if (cardioData.averagePace > 0) {
          totalPace += cardioData.averagePace;
          paceCount++;
        }

        return {
          id: w.id,
          date: w.startTime!,
          distance: cardioData.distance,
          duration,
          pace: cardioData.averagePace,
        };
      });

    const averagePace = paceCount > 0 ? totalPace / paceCount : 0;

    return {
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalDistance,
      totalDuration,
      averagePace,
      totalElevationGain,
      totalCalories,
      workoutCount: workoutSummaries.length,
      workouts: workoutSummaries,
    };
  }

  /**
   * Get overall cardio statistics
   */
  static async getOverallStats(): Promise<CardioWorkoutStats> {
    const allCardio = await this.getAll();
    const completed = allCardio.filter(
      (w) => w.completed && w.cardioData && w.startTime && w.endTime
    );

    let totalDistance = 0;
    let totalDuration = 0;
    let totalElevationGain = 0;
    let totalCalories = 0;
    let totalPace = 0;
    let paceCount = 0;

    completed.forEach((w) => {
      const cardioData = w.cardioData!;
      const duration =
        (new Date(w.endTime!).getTime() - new Date(w.startTime!).getTime()) /
        1000;

      totalDistance += cardioData.distance;
      totalDuration += duration;
      totalElevationGain += cardioData.elevationGain;
      totalCalories += cardioData.calories;
      if (cardioData.averagePace > 0) {
        totalPace += cardioData.averagePace;
        paceCount++;
      }
    });

    const averagePace = paceCount > 0 ? totalPace / paceCount : 0;

    return {
      totalDistance,
      totalDuration,
      averagePace,
      totalElevationGain,
      totalCalories,
      workoutCount: completed.length,
    };
  }
}

