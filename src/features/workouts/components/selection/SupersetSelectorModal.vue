<template>
  <ion-modal
    :is-open="isOpen"
    @did-dismiss="$emit('close')"
  >
    <ion-header>
      <ion-toolbar>
        <ion-title>Select Exercise for Superset</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('close')">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item
          v-for="exercise in availableExercises"
          :key="exercise.id"
          button
          @click="handleSelect(exercise.id)"
        >
          <ion-label>
            <h2>{{ exercise.exerciseName }}</h2>
            <p v-if="exercise.supersetGroupId" class="superset-hint">
              Already in a superset
            </p>
          </ion-label>
        </ion-item>
        <ion-item v-if="availableExercises.length === 0">
          <ion-label>
            <p>No available exercises</p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/vue'
import { computed } from 'vue'
import type { WorkoutExercise } from '../../types/workout.types'

interface Props {
  isOpen: boolean
  exercises: WorkoutExercise[]
  currentExerciseId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [exerciseId: string]
  close: []
}>()

const availableExercises = computed(() => {
  return props.exercises.filter(
    (ex) =>
      ex.id !== props.currentExerciseId &&
      !ex.supersetGroupId // Don't show exercises already in a superset
  )
})

function handleSelect(exerciseId: string) {
  emit('select', exerciseId)
  emit('close')
}
</script>

<style scoped>
.superset-hint {
  font-size: 0.875rem;
  color: var(--color-text-tertiary);
  font-style: italic;
}
</style>

