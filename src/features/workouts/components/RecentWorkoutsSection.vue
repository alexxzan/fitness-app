<template>
  <div class="recent-workouts-section">
    <div class="section-header">
      <h2 class="section-title">Recent Workouts</h2>
      <ion-button
        v-if="sortedWorkouts.length > 0"
        fill="clear"
        size="small"
        @click="$emit('viewAll')"
      >
        View All
      </ion-button>
    </div>

    <div v-if="sortedWorkouts.length === 0" class="empty-state">
      <p class="empty-text">No recent workouts</p>
      <p class="empty-hint">Start your first workout to see it here</p>
    </div>

    <div v-else class="workouts-list">
      <div
        v-for="workout in sortedWorkouts"
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
import { computed } from "vue";
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

// Sort workouts by date (most recent first)
const sortedWorkouts = computed(() => {
  return [...props.workouts].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });
});

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
  flex-direction: row;
  gap: var(--spacing-base);
  padding: 0 var(--spacing-base);
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scrollbar-width: thin;
  -webkit-overflow-scrolling: touch;
}

.workouts-list::-webkit-scrollbar {
  height: 4px;
}

.workouts-list::-webkit-scrollbar-track {
  background: var(--color-background-secondary);
}

.workouts-list::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 2px;
}

.workout-card-wrapper {
  position: relative;
  flex: 0 0 calc(100% - var(--spacing-base) * 2);
  max-width: calc(100% - var(--spacing-base) * 2);
  scroll-snap-align: start;
  scroll-snap-stop: always;
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
