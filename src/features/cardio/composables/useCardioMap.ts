import { ref, onUnmounted } from "vue";
import type { LocationPoint } from "../types/cardio.types";

// Dynamic import to prevent SSR issues
let L: any = null;

/**
 * Composable for Leaflet map initialization and route rendering
 */
export function useCardioMap() {
  const map = ref<any>(null);
  const routePolyline = ref<any>(null);
  const currentLocationMarker = ref<any>(null);
  const isInitialized = ref(false);

  /**
   * Initialize Leaflet map
   */
  async function initMap(containerId: string): Promise<void> {
    if (isInitialized.value && map.value) {
      return;
    }

    try {
      // Dynamic import Leaflet
      if (!L) {
        L = await import("leaflet");
        // Import Leaflet CSS
        await import("leaflet/dist/leaflet.css");
      }

      // Wait for container to be available
      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(`Map container with id "${containerId}" not found`);
      }

      // Initialize map centered on a default location (can be updated with user location)
      map.value = L.map(containerId, {
        zoomControl: true,
        attributionControl: true,
      });

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map.value);

      // Set initial view (will be updated when route is added)
      map.value.setView([51.505, -0.09], 13);

      isInitialized.value = true;
    } catch (error) {
      console.error("Failed to initialize map:", error);
      throw error;
    }
  }

  /**
   * Update route polyline from location points
   */
  function updateRoute(points: LocationPoint[]): void {
    if (!map.value || !L) {
      return;
    }

    // Remove existing polyline
    if (routePolyline.value) {
      map.value.removeLayer(routePolyline.value);
    }

    if (points.length === 0) {
      return;
    }

    // Create lat/lng array for polyline
    const latlngs = points.map((p) => [p.lat, p.lng]);

    // Create polyline with styling
    routePolyline.value = L.polyline(latlngs, {
      color: "#3880ff", // Ionic primary color
      weight: 4,
      opacity: 0.8,
    }).addTo(map.value);

    // Fit map to route bounds
    if (points.length > 0) {
      fitBounds(points);
    }
  }

  /**
   * Update current location marker
   */
  function updateCurrentLocation(point: LocationPoint): void {
    if (!map.value || !L) {
      return;
    }

    // Remove existing marker
    if (currentLocationMarker.value) {
      map.value.removeLayer(currentLocationMarker.value);
    }

    // Create marker
    currentLocationMarker.value = L.marker([point.lat, point.lng], {
      icon: L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
    }).addTo(map.value);

    // Center map on current location
    map.value.setView([point.lat, point.lng], 15);
  }

  /**
   * Fit map bounds to show entire route
   */
  function fitBounds(points: LocationPoint[]): void {
    if (!map.value || !L || points.length === 0) {
      return;
    }

    const latlngs = points.map((p) => [p.lat, p.lng] as [number, number]);
    const bounds = L.latLngBounds(latlngs);

    // Add padding
    map.value.fitBounds(bounds, {
      padding: [20, 20],
      maxZoom: 18,
    });
  }

  /**
   * Clear route and markers
   */
  function clearMap(): void {
    if (!map.value) {
      return;
    }

    if (routePolyline.value) {
      map.value.removeLayer(routePolyline.value);
      routePolyline.value = null;
    }

    if (currentLocationMarker.value) {
      map.value.removeLayer(currentLocationMarker.value);
      currentLocationMarker.value = null;
    }
  }

  /**
   * Set map center and zoom
   */
  function setView(lat: number, lng: number, zoom: number = 15): void {
    if (!map.value) {
      return;
    }
    map.value.setView([lat, lng], zoom);
  }

  /**
   * Cleanup on unmount
   */
  onUnmounted(() => {
    clearMap();
    if (map.value) {
      map.value.remove();
      map.value = null;
    }
    isInitialized.value = false;
  });

  return {
    map,
    isInitialized,
    initMap,
    updateRoute,
    updateCurrentLocation,
    fitBounds,
    clearMap,
    setView,
  };
}

