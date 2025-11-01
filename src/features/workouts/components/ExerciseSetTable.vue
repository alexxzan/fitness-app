<template>
  <div class="exercise-set-table">
    <div class="exercise-header">
      <h3 class="exercise-name">{{ exercise.exerciseName }}</h3>
    </div>
    
    <div class="table-container">
      <table class="sets-table">
        <thead>
          <tr>
            <th class="col-number">#</th>
            <th class="col-type">Type</th>
            <th class="col-previous">Previous</th>
            <th class="col-weight">Weight</th>
            <th class="col-reps">Reps</th>
            <th class="col-checkbox"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(set, index) in exercise.sets"
            :key="set.id"
            :class="{ 'completed': set.completed }"
            class="set-row"
          >
            <td class="col-number">{{ index + 1 }}</td>
            <td class="col-type">
              <ion-select
                :value="set.setType || 'working'"
                interface="popover"
                @ion-change="handleSetTypeChange(set.id, $event)"
                :disabled="set.completed"
              >
                <ion-select-option value="working">Work</ion-select-option>
                <ion-select-option value="warmup">Warm</ion-select-option>
                <ion-select-option value="dropset">Drop</ion-select-option>
                <ion-select-option value="superset">Super</ion-select-option>
                <ion-select-option value="failure">Fail</ion-select-option>
                <ion-select-option value="rpe">RPE</ion-select-option>
              </ion-select>
            </td>
            <td class="col-previous">
              <span v-if="previousPerformance">
                <span v-if="previousPerformance.weight !== undefined && previousPerformance.reps !== undefined">
                  {{ previousPerformance.weight }}kg × {{ previousPerformance.reps }}
                </span>
                <span v-else-if="previousPerformance.weight !== undefined">
                  {{ previousPerformance.weight }}kg
                </span>
                <span v-else-if="previousPerformance.reps !== undefined">
                  {{ previousPerformance.reps }} reps
                </span>
                <span v-else>—</span>
              </span>
              <span v-else class="no-data">—</span>
            </td>
            <td class="col-weight">
              <ion-input
                type="number"
                :value="set.weight ?? ''"
                placeholder="—"
                :disabled="set.completed"
                @ion-input="handleWeightChange(set.id, $event)"
                class="compact-input"
              />
              <span class="unit">kg</span>
            </td>
            <td class="col-reps">
              <ion-input
                type="number"
                :value="set.reps ?? ''"
                placeholder="—"
                :disabled="set.completed"
                @ion-input="handleRepsChange(set.id, $event)"
                class="compact-input"
              />
            </td>
            <td class="col-checkbox">
              <ion-checkbox
                :checked="set.completed"
                @ion-change="handleToggleCompleted(set.id)"
              />
            </td>
          </tr>
          <tr class="add-set-row" @click="handleAddSet">
            <td colspan="6" class="add-set-cell">
              <ion-icon :icon="add" />
              <span>Add Set</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonSelect, IonSelectOption, IonInput, IonCheckbox, IonIcon } from '@ionic/vue'
import { add } from 'ionicons/icons'
import type { WorkoutExercise } from '../types/workout.types'
import type { PreviousExercisePerformance } from '../types/workout.types'
import type { SetType } from '../types/workout.types'

interface Props {
  exercise: WorkoutExercise
  previousPerformance?: PreviousExercisePerformance | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  addSet: []
  updateSet: [setId: string, field: string, value: number | string | null]
  toggleCompleted: [setId: string]
}>()

function handleWeightChange(setId: string, event: Event) {
  const target = event.target as HTMLIonInputElement
  const value = target.value
  emit('updateSet', setId, 'weight', value ? Number(value) : null)
}

function handleRepsChange(setId: string, event: Event) {
  const target = event.target as HTMLIonInputElement
  const value = target.value
  emit('updateSet', setId, 'reps', value ? Number(value) : null)
}

function handleSetTypeChange(setId: string, event: CustomEvent) {
  const value = event.detail.value
  emit('updateSet', setId, 'setType', value)
}

function handleToggleCompleted(setId: string) {
  emit('toggleCompleted', setId)
}

function handleAddSet() {
  emit('addSet')
}
</script>

<style scoped>
.exercise-set-table {
  background: var(--color-background);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  margin-bottom: var(--spacing-xs);
}

.exercise-header {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-background-elevated);
  border-bottom: var(--border-width-thin) solid var(--color-border);
}

.exercise-name {
  font-size: var(--typography-body-size);
  font-weight: var(--typography-body-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.table-container {
  overflow-x: auto;
}

.sets-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--typography-small-size);
}

.sets-table thead {
  background: var(--color-background-elevated);
  position: sticky;
  top: 0;
  z-index: 1;
}

.sets-table th {
  padding: var(--spacing-xs);
  text-align: left;
  font-weight: var(--typography-body-weight-semibold);
  font-size: var(--typography-small-size);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: var(--border-width-thin) solid var(--color-border);
}

.sets-table td {
  padding: var(--spacing-xs);
  border-bottom: var(--border-width-thin) solid var(--color-border);
}

.set-row {
  transition: background-color 0.15s ease;
}

.set-row:hover {
  background: var(--color-background-elevated);
}

.set-row.completed {
  background: var(--color-success-50);
  opacity: 0.8;
}

.set-row.completed td {
  color: var(--color-text-secondary);
}

.col-number {
  width: 32px;
  text-align: center;
  font-weight: var(--typography-body-weight-semibold);
  color: var(--color-text-secondary);
}

.col-type {
  width: 80px;
}

.col-type ion-select {
  --padding-start: var(--spacing-xs);
  --padding-end: var(--spacing-xs);
  --padding-top: var(--spacing-xs);
  --padding-bottom: var(--spacing-xs);
  font-size: var(--typography-small-size);
  min-height: 32px;
  max-width: 100%;
}

.col-previous {
  width: 90px;
  color: var(--color-text-tertiary);
  font-size: var(--typography-small-size);
}

.col-previous .no-data {
  color: var(--color-text-tertiary);
}

.col-weight,
.col-reps {
  width: 80px;
}

.compact-input {
  --padding-start: var(--spacing-xs);
  --padding-end: var(--spacing-xs);
  --padding-top: var(--spacing-xs);
  --padding-bottom: var(--spacing-xs);
  font-size: var(--typography-small-size);
  min-height: 32px;
}

.compact-input input {
  text-align: center;
  padding: 0 !important;
}

.unit {
  font-size: var(--typography-small-size);
  color: var(--color-text-tertiary);
  margin-left: 2px;
}

.col-checkbox {
  width: 48px;
  text-align: center;
}

.add-set-row {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.add-set-row:hover {
  background: var(--color-background-elevated);
}

.add-set-cell {
  text-align: center;
  padding: var(--spacing-sm) !important;
  color: var(--color-primary-600);
  font-weight: var(--typography-body-weight-medium);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}

.add-set-cell ion-icon {
  font-size: 18px;
}

@media (max-width: 768px) {
  .col-previous {
    display: none;
  }
  
  .table-container {
    overflow-x: scroll;
    -webkit-overflow-scrolling: touch;
  }
}
</style>
