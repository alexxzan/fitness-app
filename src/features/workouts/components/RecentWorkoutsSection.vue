<template>
  <div class="recent-workouts-section">
    <div class="section-header">
      <h2 class="section-title">Recent Workouts</h2>
      <ion-button
        v-if="workouts.length > 0"
        fill="clear"
        size="small"
        @click="$emit('viewAll')"
      >
        View All
      </ion-button>
    </div>

    <div v-if="workouts.length === 0" class="empty-state">
      <p class="empty-text">No recent workouts</p>
      <p class="empty-hint">Start your first workout to see it here</p>
    </div>

    <div v-else class="workouts-list">
      <div
        v-for="workout in workouts"
        :key="workout.id"
        class="workout-card-wrapper"
      >
        <MediaWorkoutCard
          :workout="workout"
          @click="handleWorkoutClick(workout)"
        />
        <ion-button
          class="repeat-button"
          fill="clear"
          size="small"
          @click.stop="handleRepeatWorkout(workout)"
        >
          <ion-icon :icon="refresh" slot="start" />
          Repeat
        </ion-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonButton, IonIcon } from "@ionic/vue";
import { refresh } from "ionicons/icons";
import type { Workout } from "../types/workout.types";
import MediaWorkoutCard from "./MediaWorkoutCard.vue";

interface Props {
  workouts?: Workout[];
}

const props = withDefaults(defineProps<Props>(), {
  workouts: () => [],
});

const emit = defineEmits<{
  viewAll: [];
  workoutClick: [workout: Workout];
  repeatWorkout: [workout: Workout];
}>();

function handleWorkoutClick(workout: Workout) {
  emit("workoutClick", workout);
}

function handleRepeatWorkout(workout: Workout) {
  emit("repeatWorkout", workout);
}
</script>

<style scoped>
.recent-workouts-section {
  margin-bottom: var(--spacing-lg);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--spacing-base) var(--spacing-base) var(--spacing-base);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.empty-state {
  padding: var(--spacing-xl) var(--spacing-base);
  text-align: center;
}

.empty-text {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-xs) 0;
}

.empty-hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  margin: 0;
}

.workouts-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
  padding: 0 var(--spacing-base);
}

.workout-card-wrapper {
  position: relative;
}

.repeat-button {
  position: absolute;
  bottom: var(--spacing-sm);
  right: var(--spacing-sm);
  --background: rgba(0, 0, 0, 0.7);
  --color: var(--color-text-primary);
  --padding-start: var(--spacing-sm);
  --padding-end: var(--spacing-sm);
  font-size: var(--font-size-xs);
  z-index: 10;
  backdrop-filter: blur(8px);
}

.repeat-button ion-icon {
  font-size: 16px;
}
</style>
