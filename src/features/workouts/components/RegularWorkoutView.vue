<template>
  <div class="regular-workout-view">
    <div class="workout-header">
      <div class="header-content">
        <div class="workout-info">
          <h2 class="workout-name">{{ workout.name }}</h2>
          <div class="quick-stats" v-if="statistics">
            <span>{{ statistics.totalSets }} sets</span>
            <span v-if="statistics.totalVolume > 0">{{ Math.round(statistics.totalVolume) }}kg</span>
          </div>
        </div>
        <WorkoutTimer 
          :start-time="workout.startTime"
          :is-active="true"
        />
      </div>
    </div>

    <div class="workout-container">
      <ExerciseSetTable
        v-for="exercise in workout.exercises"
        :key="exercise.id"
        :exercise="exercise"
        :previous-performance="previousPerformances[exercise.exerciseId]"
        @add-set="handleAddSet(exercise.id)"
        @update-set="handleUpdateSet(exercise.id, $event)"
        @toggle-completed="(setId) => handleToggleCompleted(exercise.id, setId)"
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
import { ref, onMounted, watch } from 'vue'
import { IonFab, IonFabButton, IonIcon } from '@ionic/vue'
import { add } from 'ionicons/icons'
import ExerciseSetTable from './ExerciseSetTable.vue'
import WorkoutTimer from './WorkoutTimer.vue'
import type { Workout, WorkoutStatistics } from '../types/workout.types'
import { usePreviousExercisePerformance } from '../composables/usePreviousExercisePerformance'

interface Props {
  workout: Workout
  statistics: WorkoutStatistics | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  addExercise: []
  addSet: [exerciseId: string, setData: any]
  updateSet: [exerciseId: string, setId: string, updates: any]
  toggleCompleted: [exerciseId: string, setId: string]
}>()

const { loadWorkoutHistory, getPreviousPerformances } = usePreviousExercisePerformance()
const previousPerformances = ref<Record<string, any>>({})

// Load workout history and get previous performances
onMounted(async () => {
  await loadWorkoutHistory()
  updatePreviousPerformances()
})

// Update previous performances when exercises change
watch(() => props.workout.exercises, () => {
  updatePreviousPerformances()
}, { deep: true })

function updatePreviousPerformances() {
  const exerciseIds = props.workout.exercises.map(ex => ex.exerciseId)
  previousPerformances.value = getPreviousPerformances(exerciseIds)
}

function handleAddSet(exerciseId: string) {
  const exercise = props.workout.exercises.find(ex => ex.id === exerciseId)
  if (!exercise) return

  // Copy the last set's values, or use defaults
  const lastSet = exercise.sets[exercise.sets.length - 1]
  
  emit('addSet', exerciseId, {
    reps: lastSet?.reps,
    weight: lastSet?.weight,
    restTime: lastSet?.restTime,
    setType: lastSet?.setType || 'working',
  })
}

function handleUpdateSet(
  exerciseId: string,
  payload: { setId: string; field: string; value: number | string | null }
) {
  emit('updateSet', exerciseId, payload.setId, {
    [payload.field]: payload.value,
  })
}

function handleToggleCompleted(exerciseId: string, setId: string) {
  emit('toggleCompleted', exerciseId, setId)
}
</script>

<style scoped>
.regular-workout-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.workout-header {
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-background);
  border-bottom: var(--border-width-thin) solid var(--color-border);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.workout-info {
  flex: 1;
  min-width: 0;
}

.workout-name {
  font-size: var(--typography-h3-size);
  font-weight: var(--typography-h3-weight);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.quick-stats {
  display: flex;
  gap: var(--spacing-sm);
  font-size: var(--typography-small-size);
  color: var(--color-text-secondary);
}

.quick-stats span {
  display: inline-block;
}

.workout-container {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-xs);
  overflow-y: auto;
  flex: 1;
  padding-bottom: 80px; /* Space for FAB */
}
</style>

