<template>
  <div class="regular-workout-view">
    <div class="workout-header">
      <div class="header-content">
        <div class="workout-info">
          <h2 class="workout-name">{{ workout.name }}</h2>
          <div class="quick-stats" v-if="statistics">
            <span>{{ statistics.totalSets }} sets</span>
            <span v-if="statistics.totalVolume > 0"
              >{{ Math.round(statistics.totalVolume) }}kg</span
            >
          </div>
        </div>
        <WorkoutTimer :start-time="workout.startTime" :is-active="true" />
      </div>
    </div>

    <div class="workout-container">
      <ExerciseSetTable
        v-for="exercise in workout.exercises"
        :key="exercise.id"
        :exercise="exercise"
        :previous-performance="previousPerformances[exercise.exerciseId]"
        @add-set="handleAddSet(exercise.id)"
        @update-set="
          (setId, field, value) =>
            handleUpdateSet(exercise.id, { setId, field, value })
        "
        @toggle-completed="(setId) => handleToggleCompleted(exercise.id, setId)"
        @delete-set="(setId) => handleDeleteSet(exercise.id, setId)"
        @start-rest-timer="handleStartRestTimer"
        @replace-exercise="() => emit('replaceExercise', exercise.id)"
        @delete-exercise="() => emit('deleteExercise', exercise.id)"
        @link-superset="() => emit('linkSuperset', exercise.id)"
      />

      <!-- Add Exercise Button -->
      <button class="add-exercise-button" @click="emit('addExercise')">
        <ion-icon :icon="add" />
        <span>Add Exercise</span>
      </button>
    </div>

    <!-- Rest Timer -->
    <RestTimerBottom
      :is-active="restTimer.isActive && !props.workout.endTime"
      :time-remaining="restTimer.timeRemaining"
      :exercise-name="restTimer.exerciseName"
      @adjust-time="handleAdjustRestTime"
      @skip="handleSkipRest"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from "vue";
import { IonIcon } from "@ionic/vue";
import { add } from "ionicons/icons";
import ExerciseSetTable from "./ExerciseSetTable.vue";
import WorkoutTimer from "./WorkoutTimer.vue";
import RestTimerBottom from "./RestTimerBottom.vue";
import type { Workout, WorkoutStatistics } from "../types/workout.types";
import { usePreviousExercisePerformance } from "../composables/usePreviousExercisePerformance";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

interface Props {
  workout: Workout;
  statistics: WorkoutStatistics | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  addExercise: [];
  addSet: [exerciseId: string, setData: any];
  updateSet: [exerciseId: string, setId: string, updates: any];
  toggleCompleted: [exerciseId: string, setId: string];
  deleteSet: [exerciseId: string, setId: string];
  replaceExercise: [exerciseId: string];
  deleteExercise: [exerciseId: string];
  linkSuperset: [exerciseId: string];
}>();

const { loadWorkoutHistory, getPreviousPerformances } =
  usePreviousExercisePerformance();
const previousPerformances = ref<Record<string, any>>({});

// Rest timer state
const restTimer = reactive<{
  isActive: boolean;
  timeRemaining: number;
  exerciseName: string;
  intervalId?: number;
}>({
  isActive: false,
  timeRemaining: 0,
  exerciseName: "",
});

// Load workout history and get previous performances
// Force reload to ensure we get the most recent completed workouts
onMounted(async () => {
  await loadWorkoutHistory(true);
  updatePreviousPerformances();
});

// Reload history when workout ID changes (new workout started)
watch(
  () => props.workout.id,
  async (newId, oldId) => {
    // If this is a new workout (different ID), reload history to get latest completed workouts
    if (newId && newId !== oldId) {
      await loadWorkoutHistory(true);
      updatePreviousPerformances();
    }
  }
);

// Update previous performances when exercises change
watch(
  () => props.workout.exercises,
  () => {
    updatePreviousPerformances();
  },
  { deep: true }
);

function updatePreviousPerformances() {
  const exerciseIds = props.workout.exercises.map((ex) => ex.exerciseId);
  previousPerformances.value = getPreviousPerformances(exerciseIds);
}

function handleAddSet(exerciseId: string) {
  const exercise = props.workout.exercises.find((ex) => ex.id === exerciseId);
  if (!exercise) return;

  // Copy the last set's values, or use defaults
  const lastSet = exercise.sets[exercise.sets.length - 1];

  emit("addSet", exerciseId, {
    reps: lastSet?.reps,
    weight: lastSet?.weight,
    restTime: lastSet?.restTime,
    setType: lastSet?.setType || "working",
  });
}

function handleUpdateSet(
  exerciseId: string,
  payload: { setId: string; field: string; value: number | string | null }
) {
  emit("updateSet", exerciseId, payload.setId, {
    [payload.field]: payload.value,
  });
}

function handleToggleCompleted(exerciseId: string, setId: string) {
  emit("toggleCompleted", exerciseId, setId);
}

function handleDeleteSet(exerciseId: string, setId: string) {
  emit("deleteSet", exerciseId, setId);
}

function handleStartRestTimer(exerciseName: string, duration: number) {
  // Stop any existing timer
  if (restTimer.intervalId) {
    clearInterval(restTimer.intervalId);
  }

  restTimer.isActive = true;
  restTimer.timeRemaining = duration;
  restTimer.exerciseName = exerciseName;

  // Start countdown
  restTimer.intervalId = window.setInterval(() => {
    if (restTimer.timeRemaining > 0) {
      restTimer.timeRemaining--;
    } else {
      stopRestTimer();
      try {
        Haptics.impact({ style: ImpactStyle.Heavy });
      } catch (error) {
        // Haptics not available
      }
    }
  }, 1000);
}

function handleAdjustRestTime(delta: number) {
  restTimer.timeRemaining = Math.max(0, restTimer.timeRemaining + delta);
}

function handleSkipRest() {
  stopRestTimer();
}

function stopRestTimer() {
  if (restTimer.intervalId) {
    clearInterval(restTimer.intervalId);
    restTimer.intervalId = undefined;
  }
  restTimer.isActive = false;
  restTimer.timeRemaining = 0;
  restTimer.exerciseName = "";
}

// Watch for workout changes to stop timer if workout is being completed
watch(
  () => props.workout,
  () => {
    // Stop timer if workout is being completed (endTime is set)
    if (props.workout.endTime) {
      stopRestTimer();
    }
  },
  { deep: true }
);

// Cleanup on unmount
onUnmounted(() => {
  stopRestTimer();
});
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
  flex: 1;
  padding-bottom: 100px; /* Space for rest timer */
}

.add-exercise-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-base);
  background: linear-gradient(
    135deg,
    var(--color-success-500) 0%,
    var(--color-success-600) 100%
  );
  color: white;
  font-weight: var(--typography-body-weight-semibold);
  font-size: var(--typography-body-size);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 56px;
  margin-top: var(--spacing-base);
  box-shadow: var(--shadow-card);
}

.add-exercise-button:hover {
  background: linear-gradient(
    135deg,
    var(--color-success-400) 0%,
    var(--color-success-500) 100%
  );
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.add-exercise-button ion-icon {
  font-size: 24px;
}
</style>
