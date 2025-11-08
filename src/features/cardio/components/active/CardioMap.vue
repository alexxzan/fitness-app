<template>
  <div id="cardio-map" class="cardio-map"></div>
</template>

<script setup lang="ts">
import { onMounted, watch, onUnmounted } from "vue";
import { useCardioMap } from "../../composables/useCardioMap";
import type { LocationPoint } from "../../types/cardio.types";

interface Props {
  route?: LocationPoint[];
  currentLocation?: LocationPoint | null;
  autoFit?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  route: () => [],
  currentLocation: null,
  autoFit: true,
});

const { initMap, updateRoute, updateCurrentLocation, fitBounds, isInitialized } =
  useCardioMap();

onMounted(async () => {
  try {
    await initMap("cardio-map");
  } catch (error) {
    console.error("Failed to initialize map:", error);
  }
});

watch(
  () => props.route,
  (newRoute) => {
    if (isInitialized.value && newRoute.length > 0) {
      updateRoute(newRoute);
      if (props.autoFit && newRoute.length > 1) {
        fitBounds(newRoute);
      }
    }
  },
  { immediate: true }
);

watch(
  () => props.currentLocation,
  (location) => {
    if (isInitialized.value && location) {
      updateCurrentLocation(location);
    }
  }
);
</script>

<style scoped>
.cardio-map {
  width: 100%;
  height: 100%;
  min-height: 300px;
  z-index: 0;
}

/* Fix Leaflet marker icon paths */
:deep(.leaflet-marker-icon) {
  background-image: url("https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png");
}

:deep(.leaflet-marker-shadow) {
  background-image: url("https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png");
}
</style>

