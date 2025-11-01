<template>
  <ion-card
    :button="button"
    class="exercise-card"
    @click="$emit('click', exercise)"
  >
    <!-- Thumbnail Image -->
    <div v-if="showThumbnail" class="exercise-thumbnail-container">
      <ion-img
        v-if="exercise.gifUrl"
        :src="exercise.gifUrl"
        :alt="exercise.name"
        loading="lazy"
        class="exercise-thumbnail"
      />
      <div v-else class="exercise-placeholder">
        <ion-icon :icon="barbellOutline" class="placeholder-icon" />
        <p class="placeholder-text">No Image</p>
      </div>
      <!-- Favorite Button Overlay -->
      <div class="favorite-button-overlay" @click.stop="handleToggleFavorite">
        <ion-button fill="clear" size="small" class="favorite-button">
          <ion-icon
            :icon="isFavorite ? heart : heartOutline"
            :color="isFavorite ? 'danger' : 'light'"
            slot="icon-only"
          />
        </ion-button>
      </div>
      <!-- Add to Workout Button -->
      <div
        v-if="canAddToWorkout"
        class="add-button-overlay"
        @click.stop="handleAddToWorkout"
      >
        <ion-button
          fill="solid"
          size="small"
          color="primary"
          class="add-button"
        >
          <ion-icon :icon="add" slot="icon-only" />
        </ion-button>
      </div>
    </div>

    <ion-card-header>
      <ion-card-title>{{ exercise.name }}</ion-card-title>
      <ion-card-subtitle>
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
      </ion-card-subtitle>
    </ion-card-header>
    <ion-card-content>
      <div
        v-if="exercise.targetMuscles && exercise.targetMuscles.length > 0"
        class="tags"
      >
        <ion-chip
          v-for="muscle in exercise.targetMuscles.slice(0, 2)"
          :key="muscle"
          size="small"
          color="secondary"
        >
          <ion-label>{{ formatName(muscle) }}</ion-label>
        </ion-chip>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonImg,
  IonChip,
  IonLabel,
  IonButton,
  IonIcon,
} from "@ionic/vue";
import { heart, heartOutline, add, barbellOutline } from "ionicons/icons";
import type { Exercise } from "../types/exercise.types";

interface Props {
  exercise: Exercise;
  button?: boolean;
  showThumbnail?: boolean;
  isFavorite?: boolean;
  canAddToWorkout?: boolean;
}

interface Emits {
  (e: "click", exercise: Exercise): void;
  (e: "toggle-favorite", exercise: Exercise): void;
  (e: "add-to-workout", exercise: Exercise): void;
}

const props = withDefaults(defineProps<Props>(), {
  button: false,
  showThumbnail: false,
  isFavorite: false,
  canAddToWorkout: false,
});

const emit = defineEmits<Emits>();

function formatName(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function handleToggleFavorite() {
  emit("toggle-favorite", props.exercise);
}

function handleAddToWorkout() {
  emit("add-to-workout", props.exercise);
}
</script>

<style scoped>
.exercise-card {
  margin: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: var(--transition-shadow);
  box-shadow: var(--shadow-card);
}

.exercise-card:hover {
  box-shadow: var(--shadow-card-hover);
}

.exercise-thumbnail-container {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: var(--color-background-secondary);
}

.exercise-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.exercise-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-background-secondary);
  color: var(--color-text-secondary);
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-xs);
  opacity: 0.5;
}

.placeholder-text {
  font-size: var(--font-size-sm);
  margin: 0;
  opacity: 0.7;
}

.favorite-button-overlay {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  z-index: 1;
}

.add-button-overlay {
  position: absolute;
  bottom: var(--spacing-sm);
  right: var(--spacing-sm);
  z-index: 1;
}

.favorite-button,
.add-button {
  --background: var(--modal-backdrop-color);
  --color: var(--color-text-primary);
  backdrop-filter: blur(4px);
}

.favorite-button ion-icon[color="danger"] {
  --color: var(--color-error);
}

.tags {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
  flex-wrap: wrap;
}

ion-card-header {
  padding-bottom: var(--spacing-xs);
}

ion-card-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
  margin-bottom: var(--spacing-xs);
}

ion-card-subtitle {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}
</style>
