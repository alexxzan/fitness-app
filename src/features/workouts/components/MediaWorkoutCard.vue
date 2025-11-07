<template>
  <AppCard
    :button="true"
    @click="$emit('click', workout)"
    class="media-workout-card"
  >
    <!-- Image Section -->
    <div class="workout-image-container">
      <img
        :src="workoutImageUrl"
        :alt="workout.type === 'interval' ? 'HIIT Workout' : 'Strength Workout'"
        class="workout-image"
      />
      <div class="image-overlay"></div>
      
      <!-- Badges -->
      <div class="badges-container">
        <div class="workout-date-badge">
          <ion-icon :icon="calendar" />
          <span>{{ formattedDate }}</span>
        </div>
        <div class="workout-type-badge" :class="workoutTypeClass">
          <ion-icon :icon="workoutTypeIcon" />
          <span>{{ workout.type === "interval" ? "HIIT" : "Strength" }}</span>
        </div>
      </div>

      <!-- PR Badge -->
      <div v-if="hasPRs" class="pr-badge">
        <ion-icon :icon="trophy" />
        <span>PR</span>
      </div>

      <!-- Repeat Button -->
      <ion-button
        v-if="showRepeatButton"
        class="repeat-button"
        fill="clear"
        size="small"
        @click.stop="$emit('repeat', workout)"
      >
        <ion-icon :icon="refresh" slot="start" />
        <span>Repeat</span>
      </ion-button>
    </div>

    <!-- Content Section -->
    <div class="workout-content">
      <div class="workout-header">
        <div class="workout-title-section">
          <h3 class="workout-title">{{ workout.name }}</h3>
          <div v-if="workout.completed" class="status-chip status-complete">
            <ion-icon :icon="checkmark" />
            <span>Complete</span>
          </div>
        </div>
      </div>

      <div class="workout-stats-grid">
        <div class="stat-box">
          <div class="stat-icon-wrapper">
            <ion-icon :icon="barbellIcon" class="stat-icon" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ workout.exercises.length }}</span>
            <span class="stat-label">Exercises</span>
          </div>
        </div>
        <div v-if="totalSets > 0" class="stat-box">
          <div class="stat-icon-wrapper">
            <ion-icon :icon="layers" class="stat-icon" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ totalSets }}</span>
            <span class="stat-label">Sets</span>
          </div>
        </div>
        <div v-if="duration > 0" class="stat-box">
          <div class="stat-icon-wrapper">
            <ion-icon :icon="time" class="stat-icon" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ duration }}</span>
            <span class="stat-label">Minutes</span>
          </div>
        </div>
        <div v-if="totalVolume > 0" class="stat-box stat-box-highlight">
          <div class="stat-icon-wrapper">
            <ion-icon :icon="fitness" class="stat-icon stat-icon-highlight" />
          </div>
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
import { IonIcon, IonButton } from "@ionic/vue";
import {
  barbell,
  layers,
  time,
  fitness,
  flash,
  calendar,
  checkmark,
  refresh,
  trophy,
} from "ionicons/icons";
import type { Workout } from "../types/workout.types";
import AppCard from "@/components/atoms/AppCard.vue";

interface Props {
  workout: Workout;
  showRepeatButton?: boolean;
  hasPRs?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showRepeatButton: false,
  hasPRs: false,
});

const emit = defineEmits<{
  click: [workout: Workout];
  repeat: [workout: Workout];
}>();

const workoutTypeIcon = computed(() => {
  return props.workout.type === "interval" ? flash : barbell;
});

const workoutTypeClass = computed(() => {
  return props.workout.type === "interval" ? "badge-interval" : "badge-regular";
});

const workoutImageUrl = computed(() => {
  if (props.workout.type === "interval") {
    // HIIT workout image
    return "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop";
  } else {
    // Strength workout image
    return "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop";
  }
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
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.media-workout-card:active {
  transform: scale(0.98);
}

/* Image Container */
.workout-image-container {
  position: relative;
  width: 100%;
  height: 140px;
  overflow: hidden;
  background: linear-gradient(
    135deg,
    var(--color-primary-600) 0%,
    var(--color-primary-700) 50%,
    var(--color-primary-800) 100%
  );
}

.workout-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform var(--transition-slow);
}

.media-workout-card:active .workout-image {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.1) 50%,
    rgba(0, 0, 0, 0.3) 100%
  );
  pointer-events: none;
  z-index: 1;
}

/* Badges Container */
.badges-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--spacing-sm);
  z-index: 2;
  pointer-events: none;
}

.workout-date-badge,
.workout-type-badge {
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: var(--color-text-primary);
  padding: 6px var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
  display: flex;
  align-items: center;
  gap: 4px;
  pointer-events: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: transform var(--transition-fast), opacity var(--transition-fast);
}

html:not(.ion-palette-dark) .workout-date-badge,
html:not(.ion-palette-dark) .workout-type-badge {
  background: rgba(255, 255, 255, 0.95);
  color: var(--color-text-primary);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.workout-date-badge:active,
.workout-type-badge:active {
  transform: scale(0.95);
}

.workout-date-badge ion-icon,
.workout-type-badge ion-icon {
  font-size: 13px;
  opacity: 0.9;
}

.workout-type-badge {
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.workout-type-badge.badge-interval {
  background: rgba(245, 158, 11, 0.9);
  color: white;
}

html:not(.ion-palette-dark) .workout-type-badge.badge-interval {
  background: rgba(245, 158, 11, 0.95);
  color: white;
}

.workout-type-badge.badge-regular {
  background: rgba(23, 163, 70, 0.9);
  color: white;
}

html:not(.ion-palette-dark) .workout-type-badge.badge-regular {
  background: rgba(23, 163, 70, 0.95);
  color: white;
}

/* PR Badge */
.pr-badge {
  position: absolute;
  bottom: var(--spacing-sm);
  left: var(--spacing-sm);
  background: rgba(245, 158, 11, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: white;
  padding: 6px var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
  pointer-events: none;
}

html:not(.ion-palette-dark) .pr-badge {
  background: rgba(245, 158, 11, 0.95);
  color: white;
  box-shadow: 0 2px 12px rgba(245, 158, 11, 0.3);
}

.pr-badge ion-icon {
  font-size: 14px;
}

/* Repeat Button */
.repeat-button {
  position: absolute;
  bottom: var(--spacing-sm);
  right: var(--spacing-sm);
  --background: rgba(0, 0, 0, 0.75);
  --color: var(--color-text-primary);
  --padding-start: var(--spacing-sm);
  --padding-end: var(--spacing-md);
  --padding-top: 8px;
  --padding-bottom: 8px;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  z-index: 2;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: var(--radius-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: transform var(--transition-fast), opacity var(--transition-fast);
}

html:not(.ion-palette-dark) .repeat-button {
  --background: rgba(255, 255, 255, 0.95);
  --color: var(--color-text-primary);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.repeat-button:active {
  transform: scale(0.95);
}

.repeat-button ion-icon {
  font-size: 16px;
  margin-right: 2px;
}

/* Content Section */
.workout-content {
  padding: var(--spacing-sm) var(--spacing-base);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.workout-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.workout-title-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.workout-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-tight);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  white-space: nowrap;
  flex-shrink: 0;
}

.status-chip ion-icon {
  font-size: 12px;
}

.status-complete {
  background: rgba(34, 197, 94, 0.15);
  color: var(--color-success-600);
}

html:not(.ion-palette-dark) .status-complete {
  background: rgba(34, 197, 94, 0.1);
}

/* Stats Grid */
.workout-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-xs);
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--spacing-xs);
  background: var(--color-background-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.stat-box:active {
  transform: scale(0.95);
}

.stat-box-highlight {
  background: linear-gradient(
    135deg,
    rgba(29, 185, 84, 0.12) 0%,
    rgba(29, 185, 84, 0.06) 100%
  );
  border-color: rgba(29, 185, 84, 0.3);
  box-shadow: 0 2px 8px rgba(29, 185, 84, 0.1);
}

html:not(.ion-palette-dark) .stat-box-highlight {
  background: linear-gradient(
    135deg,
    rgba(29, 185, 84, 0.08) 0%,
    rgba(29, 185, 84, 0.04) 100%
  );
  border-color: rgba(29, 185, 84, 0.25);
}

.stat-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-base);
  background: rgba(23, 163, 70, 0.1);
  margin-bottom: 0;
}

.stat-icon {
  font-size: 14px;
  color: var(--color-primary-600);
}

.stat-icon-highlight {
  color: var(--color-success-600);
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  width: 100%;
}

.stat-value {
  font-size: 13px;
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: 1.1;
  text-align: center;
}

.stat-label {
  font-size: 9px;
  color: var(--color-text-tertiary);
  line-height: 1.1;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  text-align: center;
}

/* Responsive Design */
@media (max-width: 375px) {
  .workout-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .workout-image-container {
    height: 120px;
  }

  .workout-title {
    font-size: var(--font-size-base);
  }
}

@media (min-width: 768px) {
  .workout-image-container {
    height: 160px;
  }

  .workout-content {
    padding: var(--spacing-base) var(--spacing-lg);
  }
}
</style>
