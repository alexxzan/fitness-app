import { Capacitor } from "@capacitor/core";
import type { LocationPoint } from "../types/cardio.types";

/**
 * Service for GPS/location tracking
 * Supports both native (Capacitor) and web (Geolocation API) platforms
 */

// Module name as variable to prevent Vite from analyzing at build time
const GEOLOCATION_MODULE = "@capacitor/geolocation";

export interface WatchPositionOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export interface WatchPositionCallback {
  (position: LocationPoint): void;
}

export class GPSService {
  private watchId: string | number | null = null;
  private watchCallback: WatchPositionCallback | null = null;

  /**
   * Check if GPS/location services are available
   */
  static async isAvailable(): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      // Check if geolocation plugin is available
      try {
        const geolocationModule = await import(
          /* @vite-ignore */ GEOLOCATION_MODULE
        );
        if (!geolocationModule || !geolocationModule.Geolocation) {
          return false;
        }
        const { Geolocation } = geolocationModule;
        const result = await Geolocation.checkPermissions();
        return result.location === "granted" || result.location === "prompt";
      } catch {
        // Plugin not installed or not available
        return false;
      }
    } else {
      // Web: Check if Geolocation API is available
      return !!(
        navigator.geolocation &&
        typeof navigator.geolocation.getCurrentPosition === "function"
      );
    }
  }

  /**
   * Request location permissions
   */
  static async requestPermission(): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      try {
        const geolocationModule = await import(
          /* @vite-ignore */ GEOLOCATION_MODULE
        );
        if (!geolocationModule || !geolocationModule.Geolocation) {
          return false;
        }
        const { Geolocation } = geolocationModule;
        const result = await Geolocation.requestPermissions();
        return result.location === "granted";
      } catch (error) {
        console.error("Error requesting GPS permission:", error);
        return false;
      }
    } else {
      // Web: Geolocation API will prompt automatically
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          resolve(false);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          () => resolve(true),
          () => resolve(false),
          { timeout: 5000 }
        );
      });
    }
  }

  /**
   * Get current position once
   */
  static async getCurrentPosition(
    options?: WatchPositionOptions
  ): Promise<LocationPoint | null> {
    if (Capacitor.isNativePlatform()) {
      try {
        const geolocationModule = await import(
          /* @vite-ignore */ GEOLOCATION_MODULE
        );
        if (!geolocationModule || !geolocationModule.Geolocation) {
          return null;
        }
        const { Geolocation } = geolocationModule;
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: options?.enableHighAccuracy ?? true,
          timeout: options?.timeout ?? 10000,
        });

        return {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: new Date().toISOString(),
          altitude: position.coords.altitude ?? undefined,
          accuracy: position.coords.accuracy ?? undefined,
        };
      } catch (error) {
        console.error("Error getting current position:", error);
        return null;
      }
    } else {
      // Web: Use Geolocation API
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          resolve(null);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              timestamp: new Date().toISOString(),
              altitude: position.coords.altitude ?? undefined,
              accuracy: position.coords.accuracy ?? undefined,
            });
          },
          (error) => {
            console.error("Error getting current position:", error);
            resolve(null);
          },
          {
            enableHighAccuracy: options?.enableHighAccuracy ?? true,
            timeout: options?.timeout ?? 10000,
            maximumAge: options?.maximumAge ?? 0,
          }
        );
      });
    }
  }

  /**
   * Start watching position (for continuous tracking)
   */
  async watchPosition(
    callback: WatchPositionCallback,
    options?: WatchPositionOptions
  ): Promise<boolean> {
    // Clear any existing watch
    await this.clearWatch();

    this.watchCallback = callback;

    if (Capacitor.isNativePlatform()) {
      try {
        const geolocationModule = await import(
          /* @vite-ignore */ GEOLOCATION_MODULE
        );
        if (!geolocationModule || !geolocationModule.Geolocation) {
          return false;
        }
        const { Geolocation } = geolocationModule;

        this.watchId = await Geolocation.watchPosition(
          {
            enableHighAccuracy: options?.enableHighAccuracy ?? true,
            timeout: options?.timeout ?? 10000,
            maximumAge: options?.maximumAge ?? 0,
          },
          (position, err) => {
            if (err) {
              console.error("GPS watch error:", err);
              return;
            }
            if (position && this.watchCallback) {
              this.watchCallback({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                timestamp: new Date().toISOString(),
                altitude: position.coords.altitude ?? undefined,
                accuracy: position.coords.accuracy ?? undefined,
              });
            }
          }
        );

        return this.watchId !== null;
      } catch (error) {
        console.error("Error starting GPS watch:", error);
        return false;
      }
    } else {
      // Web: Use Geolocation API
      if (!navigator.geolocation) {
        return false;
      }

      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          if (this.watchCallback) {
            this.watchCallback({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              timestamp: new Date().toISOString(),
              altitude: position.coords.altitude ?? undefined,
              accuracy: position.coords.accuracy ?? undefined,
            });
          }
        },
        (error) => {
          console.error("GPS watch error:", error);
        },
        {
          enableHighAccuracy: options?.enableHighAccuracy ?? true,
          timeout: options?.timeout ?? 10000,
          maximumAge: options?.maximumAge ?? 0,
        }
      );

      return this.watchId !== null;
    }
  }

  /**
   * Stop watching position
   */
  async clearWatch(): Promise<void> {
    if (this.watchId === null) {
      return;
    }

    if (Capacitor.isNativePlatform()) {
      try {
        const geolocationModule = await import(
          /* @vite-ignore */ GEOLOCATION_MODULE
        );
        if (geolocationModule && geolocationModule.Geolocation) {
          const { Geolocation } = geolocationModule;
          await Geolocation.clearWatch({ id: this.watchId as string });
        }
      } catch (error) {
        console.error("Error clearing GPS watch:", error);
      }
    } else {
      // Web: Use Geolocation API
      if (navigator.geolocation && typeof this.watchId === "number") {
        navigator.geolocation.clearWatch(this.watchId);
      }
    }

    this.watchId = null;
    this.watchCallback = null;
  }

  /**
   * Check if currently watching position
   */
  isWatching(): boolean {
    return this.watchId !== null;
  }
}

