import type { LocationPoint, CardioData } from "../types/cardio.types";

/**
 * Service for calculating route statistics (distance, pace, elevation, calories)
 */

export class RouteCalculatorService {
  /**
   * Earth's radius in meters
   */
  private static readonly EARTH_RADIUS_M = 6371000;

  /**
   * Calculate total distance in meters using Haversine formula
   */
  static calculateDistance(points: LocationPoint[]): number {
    if (points.length < 2) {
      return 0;
    }

    let totalDistance = 0;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];

      const lat1Rad = this.toRadians(prev.lat);
      const lat2Rad = this.toRadians(curr.lat);
      const deltaLat = this.toRadians(curr.lat - prev.lat);
      const deltaLng = this.toRadians(curr.lng - prev.lng);

      const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1Rad) *
          Math.cos(lat2Rad) *
          Math.sin(deltaLng / 2) *
          Math.sin(deltaLng / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = this.EARTH_RADIUS_M * c;

      totalDistance += distance;
    }

    return totalDistance;
  }

  /**
   * Calculate average pace in seconds per km (or mile if imperial)
   * Returns seconds per unit distance
   */
  static calculatePace(
    distance: number,
    duration: number,
    isImperial: boolean = false
  ): number {
    if (distance <= 0 || duration <= 0) {
      return 0;
    }

    // Convert distance to km or miles
    const distanceInUnit = isImperial ? distance / 1609.34 : distance / 1000;

    // Pace = duration (seconds) / distance (km or miles)
    return duration / distanceInUnit;
  }

  /**
   * Calculate elevation gain in meters
   * Only counts positive elevation changes
   */
  static calculateElevationGain(points: LocationPoint[]): number {
    if (points.length < 2) {
      return 0;
    }

    let elevationGain = 0;
    let lastAltitude: number | undefined = undefined;

    for (const point of points) {
      if (point.altitude !== undefined) {
        if (lastAltitude !== undefined && point.altitude > lastAltitude) {
          elevationGain += point.altitude - lastAltitude;
        }
        lastAltitude = point.altitude;
      }
    }

    return elevationGain;
  }

  /**
   * Estimate calories burned
   * Basic formula: calories = distance (km) * weight (kg) * MET
   * MET (Metabolic Equivalent) varies by activity:
   * - Running: ~10 MET
   * - Walking: ~3.5 MET
   * - Cycling: ~6 MET
   * Default assumes running
   */
  static estimateCalories(
    distance: number, // meters
    duration: number, // seconds
    userWeight?: number, // kg
    activityType: "running" | "walking" | "cycling" = "running"
  ): number {
    if (distance <= 0 || duration <= 0) {
      return 0;
    }

    // Default weight if not provided (average adult)
    const weight = userWeight || 70;

    // MET values for different activities
    const metValues = {
      running: 10,
      walking: 3.5,
      cycling: 6,
    };

    const met = metValues[activityType];

    // Convert distance to km
    const distanceKm = distance / 1000;

    // Convert duration to hours
    const durationHours = duration / 3600;

    // Calories = MET * weight (kg) * duration (hours)
    // For distance-based: calories = distance (km) * weight (kg) * MET / 1.6
    // (1.6 km is approximately 1 mile, and MET is typically per hour)
    // Simplified: calories ≈ distance (km) * weight (kg) * MET * 0.6
    const calories = distanceKm * weight * met * 0.6;

    return Math.round(calories);
  }

  /**
   * Calculate current pace from last N points
   * Useful for real-time pace calculation
   */
  static calculateCurrentPace(
    points: LocationPoint[],
    duration: number, // seconds
    isImperial: boolean = false,
    lastNPoints: number = 5
  ): number {
    if (points.length < 2) {
      return 0;
    }

    // Use last N points for current pace calculation
    const recentPoints = points.slice(-lastNPoints);
    const recentDistance = this.calculateDistance(recentPoints);

    if (recentDistance <= 0) {
      return 0;
    }

    // Estimate time for recent segment (proportional to distance)
    const totalDistance = this.calculateDistance(points);
    const recentDuration = totalDistance > 0
      ? (recentDistance / totalDistance) * duration
      : duration / points.length * recentPoints.length;

    return this.calculatePace(recentDistance, recentDuration, isImperial);
  }

  /**
   * Format pace as MM:SS per km/mile
   */
  static formatPace(paceSeconds: number, isImperial: boolean = false): string {
    if (paceSeconds <= 0 || !isFinite(paceSeconds)) {
      return "--:--";
    }

    const minutes = Math.floor(paceSeconds / 60);
    const seconds = Math.floor(paceSeconds % 60);
    const unit = isImperial ? "/mi" : "/km";

    return `${minutes}:${seconds.toString().padStart(2, "0")}${unit}`;
  }

  /**
   * Format distance with appropriate unit
   */
  static formatDistance(
    distanceMeters: number,
    isImperial: boolean = false
  ): string {
    if (distanceMeters <= 0) {
      return isImperial ? "0.0 mi" : "0.0 km";
    }

    if (isImperial) {
      const miles = distanceMeters / 1609.34;
      if (miles < 0.1) {
        const feet = distanceMeters * 3.28084;
        return `${Math.round(feet)} ft`;
      }
      return `${miles.toFixed(2)} mi`;
    } else {
      if (distanceMeters < 1000) {
        return `${Math.round(distanceMeters)} m`;
      }
      const km = distanceMeters / 1000;
      return `${km.toFixed(2)} km`;
    }
  }

  /**
   * Format duration as HH:MM:SS or MM:SS
   */
  static formatDuration(durationSeconds: number): string {
    if (durationSeconds <= 0) {
      return "0:00";
    }

    const hours = Math.floor(durationSeconds / 3600);
    const minutes = Math.floor((durationSeconds % 3600) / 60);
    const seconds = Math.floor(durationSeconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  /**
   * Convert degrees to radians
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Update cardio data statistics from route points and duration
   */
  static updateCardioStats(
    cardioData: CardioData,
    duration: number, // seconds
    isImperial: boolean = false,
    userWeight?: number
  ): CardioData {
    const distance = this.calculateDistance(cardioData.route);
    const averagePace = this.calculatePace(distance, duration, isImperial);
    const elevationGain = this.calculateElevationGain(cardioData.route);
    const calories = this.estimateCalories(
      distance,
      duration,
      userWeight,
      cardioData.trackingMode === "gps" ? "running" : undefined
    );

    // Calculate current pace from recent points
    const currentPace = this.calculateCurrentPace(
      cardioData.route,
      duration,
      isImperial
    );

    // Track min/max pace
    const maxPace = cardioData.maxPace
      ? Math.min(cardioData.maxPace, currentPace || Infinity)
      : currentPace;
    const minPace = cardioData.minPace
      ? Math.max(cardioData.minPace, currentPace || 0)
      : currentPace;

    return {
      ...cardioData,
      distance,
      averagePace,
      elevationGain,
      calories,
      currentPace: currentPace || undefined,
      maxPace: maxPace || undefined,
      minPace: minPace || undefined,
    };
  }
}

