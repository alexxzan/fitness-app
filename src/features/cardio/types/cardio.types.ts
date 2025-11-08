/**
 * Cardio-related TypeScript types and interfaces
 */

/**
 * Location point for GPS route tracking
 */
export interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: string; // ISO date string
  altitude?: number; // meters above sea level
  accuracy?: number; // meters
}

/**
 * Cardio workout data stored in Workout.cardioData
 */
export interface CardioData {
  // Distance in meters
  distance: number;
  // Average pace in seconds per km (or mile if imperial)
  averagePace: number;
  // Elevation gain in meters
  elevationGain: number;
  // Estimated calories burned
  calories: number;
  // GPS route points (empty for manual entries)
  route: LocationPoint[];
  // Tracking mode
  trackingMode: "gps" | "manual";
  // Real-time stats (not persisted, calculated on the fly)
  currentPace?: number; // seconds per km/mile
  maxPace?: number; // fastest pace achieved
  minPace?: number; // slowest pace achieved
}

/**
 * Real-time cardio statistics during workout
 */
export interface CardioStats {
  distance: number; // meters
  duration: number; // seconds
  averagePace: number; // seconds per km/mile
  currentPace?: number; // seconds per km/mile
  elevationGain: number; // meters
  calories: number; // estimated
  // Formatted display values
  distanceDisplay: string; // e.g., "5.2 km" or "3.2 mi"
  paceDisplay: string; // e.g., "5:30/km" or "8:50/mi"
  durationDisplay: string; // e.g., "25:30"
}

/**
 * Cardio workout settings/preferences
 */
export interface CardioSettings {
  units: "metric" | "imperial";
  gpsAccuracy: "low" | "medium" | "high"; // Maps to enableHighAccuracy
  workoutGoals?: {
    dailyDistance?: number; // meters
    weeklyDistance?: number; // meters
    targetPace?: number; // seconds per km/mile
  };
  milestoneNotifications: {
    enabled: boolean;
    distanceMilestones?: number[]; // meters
    paceThresholds?: {
      fasterThan?: number; // seconds per km/mile
      slowerThan?: number; // seconds per km/mile
    };
  };
}

/**
 * Cardio workout statistics for analytics
 */
export interface CardioWorkoutStats {
  totalDistance: number; // meters
  totalDuration: number; // seconds
  averagePace: number; // seconds per km/mile
  totalElevationGain: number; // meters
  totalCalories: number;
  workoutCount: number;
}

/**
 * Weekly/Monthly cardio statistics
 */
export interface CardioPeriodStats extends CardioWorkoutStats {
  period: "week" | "month";
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  workouts: Array<{
    id: string;
    date: string;
    distance: number;
    duration: number;
    pace: number;
  }>;
}

