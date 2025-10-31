<template>
  <div class="interval-config">
    <div class="config-content">
      <FormField
        v-model="workoutName"
        label="Workout Name"
        placeholder="HIIT Workout"
      />

      <div class="config-section">
        <h3 class="section-title">Interval Settings</h3>
        
        <FormField
          v-model.number="workDuration"
          type="number"
          label="Work Duration (seconds)"
          placeholder="30"
        />

        <FormField
          v-model.number="restDuration"
          type="number"
          label="Rest Duration (seconds)"
          placeholder="10"
        />

        <FormField
          v-model.number="rounds"
          type="number"
          label="Number of Rounds"
          placeholder="5"
        />
      </div>

      <div class="config-section">
        <h3 class="section-title">Exercises</h3>
        <p class="section-description">Add exercises to rotate through during intervals</p>
        
        <div v-if="selectedExercises.length > 0" class="exercise-list">
          <div
            v-for="(exercise, index) in selectedExercises"
            :key="exercise.exerciseId"
            class="exercise-item"
          >
            <span class="exercise-number">{{ index + 1 }}</span>
            <span class="exercise-name">{{ exercise.exerciseName }}</span>
            <button
              class="remove-button"
              @click="removeExercise(index)"
              type="button"
            >
              ×
            </button>
          </div>
        </div>

        <AppButton
          expand="block"
          fill="outline"
          @click="emit('openExerciseSelector')"
        >
          + Add Exercise
        </AppButton>
      </div>

      <div class="button-group">
        <AppButton
          expand="block"
          :disabled="!isValid"
          @click="handleStart"
        >
          Start Workout
        </AppButton>
        <AppButton
          expand="block"
          fill="outline"
          @click="emit('cancel')"
        >
          Cancel
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import FormField from '@/components/molecules/FormField.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import type { IntervalExercise } from '../types/interval.types'

interface Props {
  exercises?: IntervalExercise[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  start: [config: {
    name: string
    workDuration: number
    restDuration: number
    rounds: number
    exercises: IntervalExercise[]
  }]
  cancel: []
  openExerciseSelector: []
  addExercise: [exercise: IntervalExercise]
}>()

const workoutName = ref('Interval Workout')
const workDuration = ref(30)
const restDuration = ref(10)
const rounds = ref(5)
const selectedExercises = ref<IntervalExercise[]>(props.exercises || [])

const isValid = computed(() => {
  return (
    workoutName.value.trim().length > 0 &&
    workDuration.value > 0 &&
    restDuration.value > 0 &&
    rounds.value > 0 &&
    selectedExercises.value.length > 0
  )
})

function removeExercise(index: number) {
  selectedExercises.value.splice(index, 1)
}

function handleStart() {
  if (!isValid.value) return

  emit('start', {
    name: workoutName.value,
    workDuration: workDuration.value,
    restDuration: restDuration.value,
    rounds: rounds.value,
    exercises: selectedExercises.value.map((ex, idx) => ({
      ...ex,
      order: idx
    }))
  })
}

// Method to add exercise from parent
function addExercise(exercise: { exerciseId: string, name: string }) {
  selectedExercises.value.push({
    exerciseId: exercise.exerciseId,
    exerciseName: exercise.name,
    order: selectedExercises.value.length
  })
}

// Expose method for parent component
defineExpose({
  addExercise
})
</script>

<style scoped>
.interval-config {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.config-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  overflow-y: auto;
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.section-title {
  font-size: var(--typography-h3-size);
  font-weight: var(--typography-h3-weight);
  color: var(--color-text-primary);
  margin: 0;
}

.section-description {
  font-size: var(--typography-small-size);
  color: var(--color-text-secondary);
  margin: 0;
  margin-top: calc(var(--spacing-xs) * -1);
}

.exercise-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.exercise-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background-color: var(--color-background-secondary);
  border-radius: var(--radius-base);
  border: var(--border-width-thin) solid var(--color-border);
}

.exercise-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  flex-shrink: 0;
}

.exercise-name {
  flex: 1;
  font-size: var(--typography-body-size);
  color: var(--color-text-primary);
}

.remove-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background-color: transparent;
  color: var(--color-error);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  border-radius: var(--radius-base);
  transition: var(--transition-background);
  line-height: 1;
  padding: 0;
}

.remove-button:hover {
  background-color: var(--color-error-lighter);
}

.remove-button:active {
  background-color: var(--color-error-light);
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: auto;
  padding-top: var(--spacing-lg);
}
</style>

