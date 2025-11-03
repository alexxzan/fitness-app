<template>
  <ion-list class="exercise-list-view">
    <ion-item
      v-for="exercise in exercises"
      :key="exercise.exerciseId"
      button
      @click="$emit('exercise-click', exercise)"
    >
      <!-- Thumbnail -->
      <ion-thumbnail slot="start">
        <ion-img
          v-if="exercise.gifUrl"
          :src="exercise.gifUrl"
          :alt="exercise.name"
          loading="lazy"
          class="exercise-thumbnail"
        />
        <div v-else class="exercise-placeholder">
          <ion-icon :icon="barbellOutline" class="placeholder-icon" />
        </div>
      </ion-thumbnail>

      <ion-label>
        <h2 class="exercise-name">{{ exercise.name }}</h2>
        <div v-if="showBadges" class="badges-row">
          <ion-chip
            v-for="bodyPart in exercise.bodyParts.slice(0, 2)"
            :key="bodyPart"
            size="small"
            color="primary"
          >
            <ion-label>{{ formatName(bodyPart) }}</ion-label>
          </ion-chip>
          <ion-chip v-if="exercise.bodyParts.length > 2" size="small">
            <ion-label>+{{ exercise.bodyParts.length - 2 }}</ion-label>
          </ion-chip>
        </div>
      </ion-label>

      <!-- Quick Actions -->
      <div slot="end" class="quick-actions" @click.stop>
        <ion-button
          fill="clear"
          size="small"
          @click="handleToggleFavorite(exercise)"
        >
          <ion-icon
            :icon="isFavorite(exercise.exerciseId) ? heart : heartOutline"
            :color="isFavorite(exercise.exerciseId) ? 'danger' : undefined"
            slot="icon-only"
          />
        </ion-button>
        <ion-button
          v-if="canAddToWorkout"
          fill="clear"
          size="small"
          @click="$emit('add-to-workout', exercise)"
        >
          <ion-icon :icon="add" slot="icon-only" />
        </ion-button>
      </div>
    </ion-item>
  </ion-list>
</template>

<script setup lang="ts">
import {
  IonList,
  IonItem,
  IonThumbnail,
  IonImg,
  IonLabel,
  IonChip,
  IonButton,
  IonIcon,
} from "@ionic/vue";
import { heart, heartOutline, add, barbellOutline } from "ionicons/icons";
import type { Exercise } from "../types/exercise.types";

interface Props {
  exercises: Exercise[];
  favoriteIds?: string[];
  canAddToWorkout?: boolean;
  showBadges?: boolean;
}

interface Emits {
  (e: "exercise-click", exercise: Exercise): void;
  (e: "toggle-favorite", exercise: Exercise): void;
  (e: "add-to-workout", exercise: Exercise): void;
}

const props = withDefaults(defineProps<Props>(), {
  favoriteIds: () => [],
  canAddToWorkout: false,
  showBadges: true,
});

const emit = defineEmits<Emits>();

function formatName(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function isFavorite(exerciseId: string): boolean {
  return props.favoriteIds?.includes(exerciseId) ?? false;
}

function handleToggleFavorite(exercise: Exercise) {
  emit("toggle-favorite", exercise);
}
</script>

<style scoped>
.exercise-list-view {
  padding: var(--spacing-sm);
}

.exercise-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-md);
}

.exercise-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background-secondary);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
}

.placeholder-icon {
  font-size: 32px;
  opacity: 0.5;
}

ion-item {
  --padding-start: var(--spacing-base);
  --padding-end: var(--spacing-base);
  --inner-padding-end: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  border-radius: var(--radius-md);
}

ion-item h2 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-xs);
  color: var(--color-text-primary);
}

.exercise-name {
  text-transform: capitalize;
}

.badges-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-xs);
}

.quick-actions {
  display: flex;
  gap: var(--spacing-xs);
  align-items: center;
}
</style>
