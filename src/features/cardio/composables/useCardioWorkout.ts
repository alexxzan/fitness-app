import { ref, computed, onUnmounted } from "vue";
import { WorkoutRepository } from "@/features/workouts/repositories/workout.repository";
import { CardioRepository } from "../repositories/cardio.repository";
import { GPSService } from "../services/gps.service";
import { RouteCalculatorService } from "../services/route-calculator.service";
import { generateId } from "@/shared/utils/id";
import type { Workout } from "@/features/workouts/types/workout.types";
import type {
  CardioData,
  CardioStats,
  LocationPoint,
  CardioSettings,
} from "../types/cardio.types";
import { useCardioSettings } from "./useCardioSettings";

/**
 * Composable for managing active cardio workout state and operations
 */
export function useCardioWorkout() {
  const currentWorkout = ref<Workout | null>(null);
  const isActive = ref(false);
  const isPaused = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const gpsService = new GPSService();
  const startTime = ref<Date | null>(null);
  const pausedDuration = ref(0); // Total paused time in milliseconds
  const pauseStartTime = ref<Date | null>(null);
  const { settings } = useCardioSettings();

  // Real-time stats
  const stats = ref<CardioStats>({
    distance: 0,
    duration: 0,
    averagePace: 0,
    elevationGain: 0,
    calories: 0,
    distanceDisplay: "0.0 km",
    paceDisplay: "--:--/km",
    durationDisplay: "0:00",
  });

  /**
   * Load the active cardio workout from storage
   */
  async function loadActiveWorkout() {
    isLoading.value = true;
    error.value = null;
    try {
      const activeWorkout = await CardioRepository.getActiveWorkout();
      if (activeWorkout) {
        currentWorkout.value = activeWorkout;
        isActive.value = true;
        isPaused.value = false;

        // Restore start time
        if (activeWorkout.startTime) {
          startTime.value = new Date(activeWorkout.startTime);
        }

        // Update stats from saved workout
        if (activeWorkout.cardioData) {
          updateStats();
        }
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load workout";
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Start a new cardio workout
   */
  async function startWorkout(
    type: "gps" | "manual",
    name: string = "Cardio Workout"
  ): Promise<void> {
    if (isActive.value) {
      throw new Error("A workout is already active");
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Request GPS permission if GPS workout
      if (type === "gps") {
        const hasPermission = await GPSService.requestPermission();
        if (!hasPermission) {
          throw new Error(
            "GPS permission is required for GPS tracking. Please enable location access in settings."
          );
        }

        const isAvailable = await GPSService.isAvailable();
        if (!isAvailable) {
          throw new Error("GPS is not available on this device");
        }
      }

      // Create workout
      const workoutType = type === "gps" ? "cardio-gps" : "cardio-manual";
      const now = new Date();
      startTime.value = now;

      const cardioData: CardioData = {
        distance: 0,
        averagePace: 0,
        elevationGain: 0,
        calories: 0,
        route: [],
        trackingMode: type,
      };

      const workout: Workout = {
        id: generateId(),
        name,
        type: workoutType,
        exercises: [], // Empty for cardio workouts
        cardioData,
        startTime: now.toISOString(),
        completed: false,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      currentWorkout.value = workout;
      isActive.value = true;
      isPaused.value = false;
      pausedDuration.value = 0;
      pauseStartTime.value = null;

      // Save workout
      await WorkoutRepository.setActiveWorkout(workout);

      // Start GPS tracking if GPS workout
      if (type === "gps") {
        await startGPSTracking();
      }

      // Initialize stats
      updateStats();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to start workout";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Start GPS tracking
   */
  async function startGPSTracking(): Promise<void> {
    if (!currentWorkout.value || currentWorkout.value.type !== "cardio-gps") {
      return;
    }

    const options = {
      enableHighAccuracy:
        settings.value.gpsAccuracy === "high" ||
        settings.value.gpsAccuracy === "medium",
      timeout: 10000,
      maximumAge: 0,
    };

    await gpsService.watchPosition(
      (location: LocationPoint) => {
        addLocationPoint(location);
      },
      options
    );
  }

  /**
   * Add a location point to the route
   */
  function addLocationPoint(point: LocationPoint): void {
    if (!currentWorkout.value || !currentWorkout.value.cardioData) {
      return;
    }

    const cardioData = currentWorkout.value.cardioData;
    cardioData.route.push(point);

    // Update stats
    updateStats();

    // Save workout periodically (every 10 points to avoid too many saves)
    if (cardioData.route.length % 10 === 0) {
      saveWorkout();
    }
  }

  /**
   * Pause the workout
   */
  async function pauseWorkout(): Promise<void> {
    if (!isActive.value || isPaused.value) {
      return;
    }

    isPaused.value = true;
    pauseStartTime.value = new Date();

    // Stop GPS tracking
    await gpsService.clearWatch();

    // Save workout state
    await saveWorkout();
  }

  /**
   * Resume the workout
   */
  async function resumeWorkout(): Promise<void> {
    if (!isActive.value || !isPaused.value) {
      return;
    }

    isPaused.value = false;

    // Add paused duration
    if (pauseStartTime.value) {
      const pauseDuration = Date.now() - pauseStartTime.value.getTime();
      pausedDuration.value += pauseDuration;
      pauseStartTime.value = null;
    }

    // Resume GPS tracking if GPS workout
    if (currentWorkout.value?.type === "cardio-gps") {
      await startGPSTracking();
    }

    // Save workout state
    await saveWorkout();
  }

  /**
   * Stop and save the workout
   */
  async function stopWorkout(): Promise<void> {
    if (!isActive.value || !currentWorkout.value) {
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Stop GPS tracking
      await gpsService.clearWatch();

      // Final stats update
      updateStats();

      // Mark workout as completed
      const now = new Date();
      currentWorkout.value.endTime = now.toISOString();
      currentWorkout.value.completed = true;
      currentWorkout.value.updatedAt = now.toISOString();

      // Convert to plain object before saving
      const plainWorkout = toPlainWorkout(currentWorkout.value);

      // Save final workout
      await WorkoutRepository.save(plainWorkout);
      await WorkoutRepository.setActiveWorkout(null);

      // Reset state
      currentWorkout.value = null;
      isActive.value = false;
      isPaused.value = false;
      startTime.value = null;
      pausedDuration.value = 0;
      pauseStartTime.value = null;
      stats.value = {
        distance: 0,
        duration: 0,
        averagePace: 0,
        elevationGain: 0,
        calories: 0,
        distanceDisplay: "0.0 km",
        paceDisplay: "--:--/km",
        durationDisplay: "0:00",
      };
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to stop workout";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update real-time statistics
   */
  function updateStats(): void {
    if (!currentWorkout.value || !currentWorkout.value.cardioData) {
      return;
    }

    const cardioData = currentWorkout.value.cardioData;
    const isImperial = settings.value.units === "imperial";

    // Calculate duration
    let duration = 0;
    if (startTime.value) {
      const now = Date.now();
      const elapsed = now - startTime.value.getTime() - pausedDuration.value;
      duration = Math.floor(elapsed / 1000); // seconds
    }

    // Update cardio data stats
    const updatedCardioData = RouteCalculatorService.updateCardioStats(
      cardioData,
      duration,
      isImperial
    );

    currentWorkout.value.cardioData = updatedCardioData;

    // Update reactive stats
    stats.value = {
      distance: updatedCardioData.distance,
      duration,
      averagePace: updatedCardioData.averagePace,
      currentPace: updatedCardioData.currentPace,
      elevationGain: updatedCardioData.elevationGain,
      calories: updatedCardioData.calories,
      distanceDisplay: RouteCalculatorService.formatDistance(
        updatedCardioData.distance,
        isImperial
      ),
      paceDisplay: RouteCalculatorService.formatPace(
        updatedCardioData.averagePace,
        isImperial
      ),
      durationDisplay: RouteCalculatorService.formatDuration(duration),
    };
  }

  /**
   * Helper to convert reactive workout to plain object for storage
   */
  function toPlainWorkout(workout: Workout): Workout {
    // Deep clone to remove Vue reactivity and ensure all properties are included
    return JSON.parse(JSON.stringify(workout));
  }

  /**
   * Save the current workout state
   */
  async function saveWorkout(): Promise<void> {
    if (!currentWorkout.value) {
      return;
    }

    try {
      updateStats();
      currentWorkout.value.updatedAt = new Date().toISOString();
      const plainWorkout = toPlainWorkout(currentWorkout.value);
      await WorkoutRepository.save(plainWorkout);
      await WorkoutRepository.setActiveWorkout(plainWorkout);
    } catch (err) {
      console.error("Failed to save workout:", err);
      error.value =
        err instanceof Error ? err.message : "Failed to save workout";
    }
  }

  /**
   * Get current location point (for manual entry or initial position)
   */
  async function getCurrentLocation(): Promise<LocationPoint | null> {
    return await GPSService.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    });
  }

  // Cleanup on unmount
  onUnmounted(async () => {
    await gpsService.clearWatch();
  });

  // Computed properties
  const hasRoute = computed(() => {
    return (
      currentWorkout.value?.cardioData?.route &&
      currentWorkout.value.cardioData.route.length > 0
    );
  });

  const route = computed(() => {
    return currentWorkout.value?.cardioData?.route || [];
  });

  return {
    // State
    currentWorkout,
    isActive,
    isPaused,
    isLoading,
    error,
    stats,
    hasRoute,
    route,

    // Methods
    loadActiveWorkout,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    stopWorkout,
    addLocationPoint,
    getCurrentLocation,
    updateStats,
    saveWorkout,
  };
}

