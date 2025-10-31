<template>
  <div class="regular-workout-view">
    <div class="workout-header">
      <ion-item lines="none">
        <ion-label>
          <h2>{{ workout.name }}</h2>
          <p v-if="statistics">{{ statistics.totalSets }} sets completed</p>
        </ion-label>
      </ion-item>
    </div>

    <div class="workout-container">
      <SetTracker
        v-for="exercise in workout.exercises"
        :key="exercise.id"
        :exercise="exercise"
        @add-set="handleAddSet(exercise.id)"
        @update-set="
          (setId, field, value) =>
            handleUpdateSet(exercise.id, { setId, field, value })
        "
        @toggle-completed="(setId) => handleToggleCompleted(exercise.id, setId)"
        @delete-set="(setId) => handleDeleteSet(exercise.id, setId)"
      />
    </div>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="emit('addExercise')">
        <ion-icon :icon="add" />
      </ion-fab-button>
    </ion-fab>
  </div>
</template>

<script setup lang="ts">
import { IonItem, IonLabel, IonFab, IonFabButton, IonIcon } from '@ionic/vue'
import { add } from 'ionicons/icons'
import SetTracker from './SetTracker.vue'
import type { Workout, WorkoutStatistics } from '../types/workout.types'

interface Props {
  workout: Workout
  statistics: WorkoutStatistics | null
}

defineProps<Props>()

const emit = defineEmits<{
  addExercise: []
  addSet: [exerciseId: string, setData: any]
  updateSet: [exerciseId: string, setId: string, updates: any]
  toggleCompleted: [exerciseId: string, setId: string]
  deleteSet: [exerciseId: string, setId: string]
}>()

function handleAddSet(exerciseId: string) {
  emit('addSet', exerciseId, {
    reps: undefined,
    weight: undefined,
    restTime: undefined,
  })
}

function handleUpdateSet(
  exerciseId: string,
  payload: { setId: string; field: string; value: number | null }
) {
  emit('updateSet', exerciseId, payload.setId, {
    [payload.field]: payload.value,
  })
}

function handleToggleCompleted(exerciseId: string, setId: string) {
  emit('toggleCompleted', exerciseId, setId)
}

function handleDeleteSet(exerciseId: string, setId: string) {
  emit('deleteSet', exerciseId, setId)
}
</script>

<style scoped>
.regular-workout-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.workout-header {
  padding: var(--spacing-sm) 0;
  background-color: var(--color-background);
  border-bottom: var(--border-width-thin) solid var(--color-border);
}

.workout-header ion-item {
  --padding-start: var(--spacing-base);
  --padding-end: var(--spacing-base);
}

.workout-header h2 {
  font-size: var(--typography-h3-size);
  font-weight: var(--typography-h3-weight);
  color: var(--color-text-primary);
  margin: 0;
}

.workout-header p {
  font-size: var(--typography-small-size);
  color: var(--color-text-secondary);
  margin: var(--spacing-xs) 0 0 0;
}

.workout-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
  padding: var(--spacing-base);
  overflow-y: auto;
  flex: 1;
  padding-bottom: 80px; /* Space for FAB */
}
</style>

