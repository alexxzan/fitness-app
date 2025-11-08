<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Cardio</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="showManualEntry = true">
            <ion-icon :icon="add" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="cardio-page">
        <!-- Active Workout Section -->
        <div v-if="isActive" class="active-workout-section">
          <ion-card>
            <ion-card-header>
              <ion-card-title>Active Workout</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <CardioStatsDisplay :stats="stats" :is-imperial="isImperial" />
              <div class="workout-actions">
                <ion-button expand="block" @click="goToActiveWorkout">
                  Continue Workout
                </ion-button>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Start Workout Section -->
        <div v-else class="start-section">
          <ion-card>
            <ion-card-content>
              <h2>Start a Cardio Workout</h2>
              <p>Track your runs, walks, and cycling with GPS</p>
              <div class="start-buttons">
                <ion-button expand="block" color="primary" @click="startGPSWorkout">
                  <ion-icon :icon="location" slot="start" />
                  Start GPS Workout
                </ion-button>
                <ion-button expand="block" fill="outline" @click="showManualEntry = true">
                  <ion-icon :icon="create" slot="start" />
                  Manual Entry
                </ion-button>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Recent Workouts Section -->
        <div v-if="recentWorkouts.length > 0" class="recent-section">
          <ion-card>
            <ion-card-header>
              <ion-card-title>Recent Workouts</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <CardioHistoryList
                :history="recentWorkouts"
                @workout-click="handleWorkoutClick"
              />
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Manual Entry Modal -->
        <ManualCardioEntry
          :is-open="showManualEntry"
          @close="showManualEntry = false"
          @saved="handleWorkoutSaved"
        />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from "@ionic/vue";
import { add, location, create } from "ionicons/icons";
import { useCardioWorkout } from "@/features/cardio/composables/useCardioWorkout";
import { CardioRepository } from "@/features/cardio/repositories/cardio.repository";
import { useCardioSettings } from "@/features/cardio/composables/useCardioSettings";
import CardioStatsDisplay from "@/features/cardio/components/active/CardioStatsDisplay.vue";
import CardioHistoryList from "@/features/cardio/components/history/CardioHistoryList.vue";
import ManualCardioEntry from "@/features/cardio/components/entry/ManualCardioEntry.vue";
import type { Workout } from "@/features/workouts/types/workout.types";

const router = useRouter();

const {
  isActive,
  isPaused,
  stats,
  loadActiveWorkout,
  startWorkout,
} = useCardioWorkout();

const { isImperial, settings, loadSettings } = useCardioSettings();

const recentWorkouts = ref<Workout[]>([]);
const showManualEntry = ref(false);

onMounted(async () => {
  await loadActiveWorkout();
  await loadSettings();
  await loadRecentWorkouts();
});

async function loadRecentWorkouts() {
  recentWorkouts.value = await CardioRepository.getRecentWorkouts(5);
}

async function startGPSWorkout() {
  try {
    await startWorkout("gps", "Cardio Workout");
    router.push("/active-workout");
  } catch (error) {
    console.error("Failed to start GPS workout:", error);
    // TODO: Show error toast
  }
}

function goToActiveWorkout() {
  router.push("/active-workout");
}

function handleWorkoutClick(workout: Workout) {
  // TODO: Navigate to workout detail page
  console.log("Workout clicked:", workout.id);
}

function handleWorkoutSaved(workout: Workout) {
  loadRecentWorkouts();
  showManualEntry.value = false;
}
</script>

<style scoped>
.cardio-page {
  padding: var(--spacing-base);
}

.active-workout-section,
.start-section,
.recent-section {
  margin-bottom: var(--spacing-base);
}

.start-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-base);
}

.workout-actions {
  margin-top: var(--spacing-base);
}

h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-sm);
}

p {
  color: var(--ion-color-medium);
  margin-bottom: var(--spacing-base);
}
</style>
