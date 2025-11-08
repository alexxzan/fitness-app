<template>
  <ion-card @click="$emit('click')">
    <ion-card-header>
      <ion-card-title>{{ workoutName }}</ion-card-title>
      <ion-card-subtitle>{{ formattedDate }}</ion-card-subtitle>
    </ion-card-header>
    <ion-card-content>
      <div class="workout-stats">
        <div class="stat">
          <ion-icon :icon="location" />
          <span>{{ distanceDisplay }}</span>
        </div>
        <div class="stat">
          <ion-icon :icon="time" />
          <span>{{ durationDisplay }}</span>
        </div>
        <div class="stat">
          <ion-icon :icon="speedometer" />
          <span>{{ paceDisplay }}</span>
        </div>
        <div v-if="calories > 0" class="stat">
          <ion-icon :icon="flame" />
          <span>{{ calories }} cal</span>
        </div>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonIcon,
} from "@ionic/vue";
import { location, time, speedometer, flame } from "ionicons/icons";
import type { Workout } from "@/features/workouts/types/workout.types";
import { RouteCalculatorService } from "../../services/route-calculator.service";
import { useCardioSettings } from "../../composables/useCardioSettings";

interface Props {
  workout: Workout;
}

const props = defineProps<Props>();

defineEmits<{
  click: [];
}>();

const { isImperial } = useCardioSettings();

const workoutName = computed(() => {
  return props.workout.name || "Cardio Workout";
});

const formattedDate = computed(() => {
  if (!props.workout.startTime) return "";
  const date = new Date(props.workout.startTime);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

const distanceDisplay = computed(() => {
  if (!props.workout.cardioData) return "0 km";
  return RouteCalculatorService.formatDistance(
    props.workout.cardioData.distance,
    isImperial.value
  );
});

const durationDisplay = computed(() => {
  if (!props.workout.startTime || !props.workout.endTime) return "0:00";
  const start = new Date(props.workout.startTime);
  const end = new Date(props.workout.endTime);
  const duration = Math.floor((end.getTime() - start.getTime()) / 1000);
  return RouteCalculatorService.formatDuration(duration);
});

const paceDisplay = computed(() => {
  if (!props.workout.cardioData || props.workout.cardioData.averagePace === 0) {
    return "--:--";
  }
  return RouteCalculatorService.formatPace(
    props.workout.cardioData.averagePace,
    isImperial.value
  );
});

const calories = computed(() => {
  return props.workout.cardioData?.calories || 0;
});
</script>

<style scoped>
.workout-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
}

.stat {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
}

.stat ion-icon {
  color: var(--ion-color-primary);
}
</style>

