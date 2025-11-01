<template>
  <AppCard
    :button="true"
    @click="$emit('click', workout)"
    class="media-workout-card"
  >
    <!-- Image Section -->
    <div class="workout-image-container">
      <div class="workout-placeholder-image">
        <div class="placeholder-pattern"></div>
        <ion-icon :icon="workoutTypeIcon" class="placeholder-icon" />
      </div>
      <div class="workout-date-badge">
        <ion-icon :icon="calendar" />
        <span>{{ formattedDate }}</span>
      </div>
      <div class="workout-type-badge" :class="workoutTypeClass">
        <ion-icon :icon="workoutTypeIcon" />
        <span>{{ workout.type === "interval" ? "HIIT" : "Strength" }}</span>
      </div>
      <div v-if="workout.completed" class="workout-completed-badge">
        <ion-icon :icon="checkmarkCircle" />
      </div>
    </div>

    <!-- Content Section -->
    <div class="workout-content">
      <div class="workout-header">
        <h3 class="workout-title">{{ workout.name }}</h3>
        <div class="workout-status">
          <div v-if="workout.completed" class="status-chip status-complete">
            <ion-icon :icon="checkmark" />
            <span>Complete</span>
          </div>
        </div>
      </div>

      <div class="workout-stats-grid">
        <div class="stat-box">
          <ion-icon :icon="barbellIcon" class="stat-icon" />
          <div class="stat-content">
            <span class="stat-value">{{ workout.exercises.length }}</span>
            <span class="stat-label">Exercises</span>
          </div>
        </div>
        <div v-if="totalSets > 0" class="stat-box">
          <ion-icon :icon="layers" class="stat-icon" />
          <div class="stat-content">
            <span class="stat-value">{{ totalSets }}</span>
            <span class="stat-label">Sets</span>
          </div>
        </div>
        <div v-if="duration > 0" class="stat-box">
          <ion-icon :icon="time" class="stat-icon" />
          <div class="stat-content">
            <span class="stat-value">{{ duration }}</span>
            <span class="stat-label">Min</span>
          </div>
        </div>
        <div v-if="totalVolume > 0" class="stat-box stat-box-highlight">
          <ion-icon :icon="fitness" class="stat-icon" />
          <div class="stat-content">
            <span class="stat-value">{{ totalVolume }}kg</span>
            <span class="stat-label">Volume</span>
          </div>
        </div>
      </div>
    </div>
  </AppCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { IonIcon } from "@ionic/vue";
import {
  barbell,
  layers,
  time,
  fitness,
  flash,
  calendar,
  checkmarkCircle,
  checkmark,
} from "ionicons/icons";
import type { Workout } from "../types/workout.types";
import AppCard from "@/components/atoms/AppCard.vue";

interface Props {
  workout: Workout;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  click: [workout: Workout];
}>();

const workoutTypeIcon = computed(() => {
  return props.workout.type === "interval" ? flash : barbell;
});

const workoutTypeClass = computed(() => {
  return props.workout.type === "interval" ? "badge-interval" : "badge-regular";
});

const formattedDate = computed(() => {
  const date = new Date(props.workout.createdAt);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
});

const totalSets = computed(() => {
  return props.workout.exercises.reduce(
    (total, ex) => total + ex.sets.length,
    0
  );
});

const duration = computed(() => {
  if (!props.workout.startTime) return 0;
  const start = new Date(props.workout.startTime);
  const end = props.workout.endTime
    ? new Date(props.workout.endTime)
    : new Date();
  return Math.round((end.getTime() - start.getTime()) / 1000 / 60);
});

const totalVolume = computed(() => {
  if (props.workout.type !== "regular") return 0;
  let volume = 0;
  props.workout.exercises.forEach((exercise) => {
    exercise.sets.forEach((set) => {
      if (set.completed && set.reps && set.weight) {
        volume += set.reps * set.weight;
      }
    });
  });
  return Math.round(volume);
});

const barbellIcon = barbell;
</script>

<style scoped>
.media-workout-card {
  overflow: hidden;
  margin-top: 0;
}

.workout-image-container {
  position: relative;
  width: 100%;
  height: 110px;
  overflow: hidden;
  background: linear-gradient(
    135deg,
    var(--color-primary-600) 0%,
    var(--color-primary-700) 50%,
    var(--color-primary-800) 100%
  );
}

.workout-placeholder-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.placeholder-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 8px,
    rgba(255, 255, 255, 0.04) 8px,
    rgba(255, 255, 255, 0.04) 16px
  );
}

.placeholder-icon {
  font-size: 48px;
  color: rgba(255, 255, 255, 0.25);
  position: relative;
  z-index: 1;
}

.workout-date-badge {
  position: absolute;
  top: var(--spacing-xs);
  left: var(--spacing-xs);
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  color: var(--color-text-primary);
  padding: 4px var(--spacing-xs);
  border-radius: var(--radius-button);
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 3px;
}

.workout-date-badge ion-icon {
  font-size: 12px;
}

.workout-type-badge {
  position: absolute;
  top: var(--spacing-xs);
  right: var(--spacing-xs);
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  color: var(--color-text-primary);
  padding: 4px var(--spacing-xs);
  border-radius: var(--radius-button);
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 3px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.workout-type-badge ion-icon {
  font-size: 12px;
}

.workout-completed-badge {
  position: absolute;
  bottom: var(--spacing-xs);
  right: var(--spacing-xs);
  width: 24px;
  height: 24px;
  background: rgba(34, 197, 94, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4);
}

.workout-completed-badge ion-icon {
  font-size: 14px;
  color: white;
}

.workout-content {
  padding: var(--spacing-sm) var(--spacing-base);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.workout-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-sm);
}

.workout-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-tight);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-chip {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px var(--spacing-xs);
  border-radius: 10px;
  font-size: 9px;
  font-weight: var(--font-weight-semibold);
  white-space: nowrap;
}

.status-chip ion-icon {
  font-size: 10px;
}

.status-complete {
  background: rgba(34, 197, 94, 0.15);
  color: var(--color-success-600);
}

.workout-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-xs);
  margin-top: var(--spacing-xs);
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--spacing-xs);
  background: var(--color-background-secondary);
  border-radius: var(--radius-button);
  border: 1px solid var(--color-border);
}

.stat-box-highlight {
  background: linear-gradient(
    135deg,
    rgba(29, 185, 84, 0.1) 0%,
    rgba(29, 185, 84, 0.05) 100%
  );
  border-color: rgba(29, 185, 84, 0.2);
}

.stat-icon {
  font-size: 14px;
  color: var(--color-primary-600);
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.stat-value {
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: 1;
}

.stat-label {
  font-size: 9px;
  color: var(--color-text-tertiary);
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

@media (max-width: 375px) {
  .workout-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
