<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ workoutName }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleStop">
            <ion-icon :icon="close" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="cardio-workout-container">
        <!-- Map Section -->
        <div class="map-section">
          <CardioMap
            :route="route"
            :current-location="currentLocation"
            :auto-fit="false"
          />
        </div>

        <!-- Stats Section -->
        <div class="stats-section">
          <CardioStatsDisplay :stats="stats" :is-imperial="isImperial" />
        </div>

        <!-- Controls Section -->
        <div class="controls-section">
          <CardioControls
            :is-active="isActive"
            :is-paused="isPaused"
            @start="handleStart"
            @pause="handlePause"
            @resume="handleResume"
            @stop="handleStop"
          />
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
} from "@ionic/vue";
import { close } from "ionicons/icons";
import { useCardioWorkout } from "../../composables/useCardioWorkout";
import { useCardioSettings } from "../../composables/useCardioSettings";
import CardioMap from "./CardioMap.vue";
import CardioStatsDisplay from "./CardioStatsDisplay.vue";
import CardioControls from "./CardioControls.vue";
import { useRouter } from "vue-router";

const router = useRouter();

const {
  currentWorkout,
  isActive,
  isPaused,
  stats,
  route,
  loadActiveWorkout,
  startWorkout,
  pauseWorkout,
  resumeWorkout,
  stopWorkout,
  getCurrentLocation,
} = useCardioWorkout();

const { isImperial, loadSettings } = useCardioSettings();

const workoutName = computed(() => {
  return currentWorkout.value?.name || "Cardio Workout";
});

const currentLocation = ref<any>(null);
let statsUpdateInterval: number | null = null;

onMounted(async () => {
  await loadActiveWorkout();
  await loadSettings();

  // If no active workout, redirect to cardio page
  if (!isActive.value) {
    router.push("/cardio");
    return;
  }

  // Update stats every second
  statsUpdateInterval = window.setInterval(() => {
    if (isActive.value && !isPaused.value) {
      // Get current location for GPS workouts
      if (currentWorkout.value?.type === "cardio-gps") {
        getCurrentLocation().then((location) => {
          if (location) {
            currentLocation.value = location;
          }
        });
      }
    }
  }, 1000);
});

onUnmounted(() => {
  if (statsUpdateInterval !== null) {
    clearInterval(statsUpdateInterval);
  }
});

async function handleStart() {
  // This would typically show a modal to select GPS or manual
  // For now, default to GPS
  try {
    await startWorkout("gps", "Cardio Workout");
  } catch (error) {
    console.error("Failed to start workout:", error);
    // Show error toast
  }
}

async function handlePause() {
  await pauseWorkout();
}

async function handleResume() {
  await resumeWorkout();
}

async function handleStop() {
  try {
    await stopWorkout();
    router.push("/cardio");
  } catch (error) {
    console.error("Failed to stop workout:", error);
  }
}
</script>

<style scoped>
.cardio-workout-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.map-section {
  flex: 1;
  min-height: 300px;
  position: relative;
}

.stats-section {
  flex-shrink: 0;
  background: var(--ion-background-color);
}

.controls-section {
  flex-shrink: 0;
  background: var(--ion-background-color);
  border-top: 1px solid var(--ion-color-light);
}
</style>
