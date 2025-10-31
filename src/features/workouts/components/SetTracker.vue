<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>{{ exercise.exerciseName }}</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <div v-for="(set, index) in exercise.sets" :key="set.id" class="set-item">
        <div class="set-header">
          <span class="set-number">{{ index + 1 }}</span>
          <ion-checkbox
            :checked="set.completed"
            @ion-change="toggleCompleted(set.id)"
          />
        </div>
        <div class="set-inputs">
        <SetInput
          :model-value="set.reps ?? null"
          label="Reps"
          :disabled="set.completed"
          @update:model-value="updateSet(set.id, 'reps', $event)"
        />
        <SetInput
          :model-value="set.weight ?? null"
          label="Weight"
          unit="kg"
          :disabled="set.completed"
          @update:model-value="updateSet(set.id, 'weight', $event)"
        />
        <SetInput
          :model-value="set.restTime ?? null"
          label="Rest"
          unit="sec"
          :disabled="set.completed"
          @update:model-value="updateSet(set.id, 'restTime', $event)"
        />
        </div>
        <AppButton
          fill="clear"
          color="danger"
          size="small"
          @click="deleteSet(set.id)"
        >
          Remove
        </AppButton>
      </div>
      <AppButton
        expand="block"
        fill="outline"
        @click="addSet"
      >
        Add Set
      </AppButton>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCheckbox } from '@ionic/vue'
import type { WorkoutExercise, WorkoutSet } from '../types/workout.types'
import SetInput from '@/components/molecules/SetInput.vue'
import AppButton from '@/components/atoms/AppButton.vue'

interface Props {
  exercise: WorkoutExercise
}

const props = defineProps<Props>()

const emit = defineEmits<{
  addSet: []
  updateSet: [setId: string, field: keyof WorkoutSet, value: number | null]
  toggleCompleted: [setId: string]
  deleteSet: [setId: string]
}>()

function addSet() {
  emit('addSet')
}

function updateSet(setId: string, field: keyof WorkoutSet, value: number | null) {
  emit('updateSet', setId, field, value)
}

function toggleCompleted(setId: string) {
  emit('toggleCompleted', setId)
}

function deleteSet(setId: string) {
  emit('deleteSet', setId)
}
</script>

<style scoped>
.set-item {
  margin-bottom: var(--spacing-base);
  padding-bottom: var(--spacing-base);
  border-bottom: var(--border-width-thin) solid var(--color-border);
  transition: var(--transition-border);
}

.set-item:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.set-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.set-number {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-lg);
  color: var(--color-text-primary);
}

.set-inputs {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

@media (min-width: 768px) {
  .set-inputs {
    flex-direction: row;
  }
}
</style>

