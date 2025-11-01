<template>
  <div class="media-routine-card" @click="$emit('click', routine)">
    <!-- Image Section -->
    <div class="routine-image-container">
      <div class="routine-placeholder-image">
        <div class="placeholder-pattern"></div>
        <ion-icon :icon="star" class="placeholder-icon" />
      </div>
      <div class="routine-badges-container">
        <div
          v-if="routine.difficulty"
          class="routine-difficulty-badge"
          :class="difficultyClass"
        >
          <ion-icon :icon="difficultyIcon" />
          <span>{{ routine.difficulty }}</span>
        </div>
        <div class="routine-favorite-badge">
          <ion-icon :icon="star" />
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="routine-content">
      <div class="routine-header">
        <h3 class="routine-name">{{ routine.name }}</h3>
        <div class="routine-type-tag" v-if="routine.type === 'template'">
          Template
        </div>
      </div>
      <p v-if="routine.description" class="routine-description">
        {{ routine.description }}
      </p>
      <div class="routine-stats-row">
        <div v-if="routine.estimatedDuration" class="stat-chip">
          <ion-icon :icon="time" />
          <span>{{ routine.estimatedDuration }}m</span>
        </div>
        <div v-if="routine.exercises.length > 0" class="stat-chip">
          <ion-icon :icon="barbell" />
          <span>{{ routine.exercises.length }}</span>
        </div>
        <div v-if="routine.tags && routine.tags.length > 0" class="stat-chip">
          <ion-icon :icon="pricetag" />
          <span>{{ routine.tags[0] }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { IonIcon } from "@ionic/vue";
import {
  star,
  time,
  barbell,
  pricetag,
  trendingUp,
  pulse,
  fitness,
} from "ionicons/icons";
import type { WorkoutRoutine } from "../types/workout.types";

interface Props {
  routine: WorkoutRoutine;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  click: [routine: WorkoutRoutine];
}>();

const difficultyClass = computed(() => {
  const difficulty = props.routine.difficulty?.toLowerCase();
  if (difficulty === "beginner") return "badge-beginner";
  if (difficulty === "intermediate") return "badge-intermediate";
  if (difficulty === "advanced") return "badge-advanced";
  return "";
});

const difficultyIcon = computed(() => {
  const difficulty = props.routine.difficulty?.toLowerCase();
  if (difficulty === "beginner") return fitness;
  if (difficulty === "intermediate") return trendingUp;
  if (difficulty === "advanced") return pulse;
  return fitness;
});
</script>

<style scoped>
.media-routine-card {
  background: var(--card-background);
  border-radius: var(--radius-card);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition: var(--transition-shadow);
  display: flex;
  flex-direction: column;
  border: var(--card-border-width) solid var(--card-border-color);
}

.media-routine-card:active {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(1px);
}

.routine-image-container {
  position: relative;
  width: 100%;
  height: 100px;
  overflow: hidden;
  background: linear-gradient(
    135deg,
    var(--color-warning-500) 0%,
    var(--color-warning-600) 50%,
    var(--color-warning-700) 100%
  );
}

.routine-placeholder-image {
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
  font-size: 40px;
  color: rgba(255, 255, 255, 0.25);
  position: relative;
  z-index: 1;
}

.routine-badges-container {
  position: absolute;
  top: var(--spacing-xs);
  right: var(--spacing-xs);
  display: flex;
  gap: var(--spacing-xs);
  z-index: 2;
}

.routine-difficulty-badge {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  color: var(--color-text-primary);
  padding: 4px var(--spacing-xs);
  border-radius: var(--radius-button);
  font-size: 9px;
  font-weight: var(--font-weight-semibold);
  text-transform: capitalize;
  display: flex;
  align-items: center;
  gap: 3px;
  letter-spacing: 0.5px;
}

.routine-difficulty-badge ion-icon {
  font-size: 10px;
}

.badge-beginner {
  background: rgba(34, 197, 94, 0.8);
}

.badge-intermediate {
  background: rgba(245, 158, 11, 0.8);
}

.badge-advanced {
  background: rgba(239, 68, 68, 0.8);
}

.routine-favorite-badge {
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.routine-favorite-badge ion-icon {
  font-size: 10px;
  color: var(--color-warning-400);
}

.routine-content {
  padding: var(--spacing-sm) var(--spacing-base);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.routine-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-xs);
}

.routine-name {
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

.routine-type-tag {
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  color: var(--color-text-tertiary);
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 8px;
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.routine-description {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: var(--line-height-normal);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.routine-stats-row {
  display: flex;
  gap: var(--spacing-xs);
  align-items: center;
  flex-wrap: wrap;
  margin-top: var(--spacing-xs);
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 3px;
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  padding: 3px var(--spacing-xs);
  border-radius: 10px;
  font-size: 9px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
}

.stat-chip ion-icon {
  font-size: 10px;
  color: var(--color-warning-600);
}
</style>
