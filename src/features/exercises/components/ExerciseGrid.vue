<template>
  <ion-grid class="exercise-grid">
    <ion-row>
      <ion-col
        v-for="exercise in exercises"
        :key="exercise.exerciseId"
        size="6"
        size-md="4"
        size-lg="3"
      >
        <ExerciseCard
          :exercise="exercise"
          :show-thumbnail="true"
          :is-favorite="isFavorite(exercise.exerciseId)"
          :can-add-to-workout="canAddToWorkout"
          @click="$emit('exercise-click', exercise)"
          @toggle-favorite="$emit('toggle-favorite', exercise)"
          @add-to-workout="$emit('add-to-workout', exercise)"
        />
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script setup lang="ts">
import { IonGrid, IonRow, IonCol } from '@ionic/vue'
import ExerciseCard from './ExerciseCard.vue'
import type { Exercise } from '../types/exercise.types'

interface Props {
  exercises: Exercise[]
  favoriteIds?: string[]
  canAddToWorkout?: boolean
}

interface Emits {
  (e: 'exercise-click', exercise: Exercise): void
  (e: 'toggle-favorite', exercise: Exercise): void
  (e: 'add-to-workout', exercise: Exercise): void
}

const props = withDefaults(defineProps<Props>(), {
  favoriteIds: () => [],
  canAddToWorkout: false
})

const emit = defineEmits<Emits>()

function isFavorite(exerciseId: string): boolean {
  return props.favoriteIds?.includes(exerciseId) ?? false
}
</script>

<style scoped>
.exercise-grid {
  padding: var(--spacing-base);
  --ion-grid-padding: var(--spacing-sm);
  --ion-grid-padding-xs: var(--spacing-sm);
  --ion-grid-padding-sm: var(--spacing-sm);
  --ion-grid-padding-md: var(--spacing-sm);
  --ion-grid-padding-lg: var(--spacing-sm);
  --ion-grid-padding-xl: var(--spacing-sm);
}
</style>

