<template>
  <ion-modal :is-open="isOpen" @did-dismiss="$emit('close')">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ exercise?.name }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('close')">
            <ion-icon :icon="close" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content v-if="exercise" class="exercise-detail-content">
      <!-- Exercise GIF -->
      <div v-if="exercise.gifUrl" class="exercise-image-container">
        <ion-img
          :src="exercise.gifUrl"
          :alt="exercise.name"
          loading="lazy"
          class="exercise-gif"
        />
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <ion-button
          expand="block"
          color="primary"
          @click="handleAddToWorkout"
          :disabled="!canAddToWorkout"
        >
          <ion-icon :icon="add" slot="start" />
          Add to Workout
        </ion-button>
        <ion-button
          fill="outline"
          @click="toggleFavorite"
        >
          <ion-icon
            :icon="isFavorite ? heart : heartOutline"
            slot="icon-only"
            :color="isFavorite ? 'danger' : undefined"
          />
        </ion-button>
      </div>

      <!-- Exercise Information Cards -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Body Parts</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="badges-container">
            <ion-chip
              v-for="bodyPart in exercise.bodyParts"
              :key="bodyPart"
              color="primary"
            >
              <ion-label>{{ formatName(bodyPart) }}</ion-label>
            </ion-chip>
          </div>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Target Muscles</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="badges-container">
            <ion-chip
              v-for="muscle in exercise.targetMuscles"
              :key="muscle"
              color="secondary"
            >
              <ion-label>{{ formatName(muscle) }}</ion-label>
            </ion-chip>
          </div>
        </ion-card-content>
      </ion-card>

      <ion-card v-if="exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0">
        <ion-card-header>
          <ion-card-title>Secondary Muscles</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="badges-container">
            <ion-chip
              v-for="muscle in exercise.secondaryMuscles"
              :key="muscle"
              color="tertiary"
            >
              <ion-label>{{ formatName(muscle) }}</ion-label>
            </ion-chip>
          </div>
        </ion-card-content>
      </ion-card>

      <ion-card v-if="exercise.equipments && exercise.equipments.length > 0">
        <ion-card-header>
          <ion-card-title>Equipment</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="badges-container">
            <ion-chip
              v-for="equipment in exercise.equipments"
              :key="equipment"
            >
              <ion-label>{{ formatName(equipment) }}</ion-label>
            </ion-chip>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Instructions -->
      <ion-card v-if="exercise.instructions && exercise.instructions.length > 0">
        <ion-card-header>
          <ion-card-title>Instructions</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item
              v-for="(instruction, index) in exercise.instructions"
              :key="index"
            >
              <ion-label>
                <h3>Step {{ index + 1 }}</h3>
                <p>{{ instruction }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonImg,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonChip,
  IonLabel,
  IonList,
  IonItem
} from '@ionic/vue'
import { close, add, heart, heartOutline } from 'ionicons/icons'
import type { Exercise } from '../types/exercise.types'

interface Props {
  isOpen: boolean
  exercise: Exercise | null
  isFavorite?: boolean
  canAddToWorkout?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'add-to-workout', exercise: Exercise): void
  (e: 'toggle-favorite', exercise: Exercise): void
}

const props = withDefaults(defineProps<Props>(), {
  isFavorite: false,
  canAddToWorkout: true
})

const emit = defineEmits<Emits>()

function formatName(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function handleAddToWorkout() {
  if (props.exercise && props.canAddToWorkout) {
    emit('add-to-workout', props.exercise)
  }
}

function toggleFavorite() {
  if (props.exercise) {
    emit('toggle-favorite', props.exercise)
  }
}
</script>

<style scoped>
.exercise-detail-content {
  --padding-start: var(--spacing-base);
  --padding-end: var(--spacing-base);
  --padding-top: var(--spacing-base);
  --padding-bottom: var(--spacing-base);
}

.exercise-image-container {
  width: 100%;
  margin-bottom: var(--spacing-lg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-background-secondary);
}

.exercise-gif {
  width: 100%;
  height: auto;
  display: block;
}

.action-buttons {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.action-buttons ion-button {
  flex: 1;
}

.badges-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

ion-card {
  margin-bottom: var(--spacing-base);
  box-shadow: var(--shadow-card);
}

ion-card-header {
  padding-bottom: var(--spacing-sm);
}

ion-card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
}

ion-item h3 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-xs);
  color: var(--color-text-primary);
}

ion-item p {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  white-space: normal;
}
</style>

