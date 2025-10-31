<template>
  <div class="interval-workout-view">
    <div class="workout-info">
      <h2 class="workout-name">{{ workout.name }}</h2>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
      </div>
      <p class="progress-text">
        {{ completedIntervals }} of {{ totalIntervals }} intervals completed
      </p>
    </div>

    <IntervalTimer
      :current-time="currentTime"
      :phase="currentPhase"
      :current-round="currentRound"
      :total-rounds="workout.intervalConfig?.rounds || 1"
      :exercise-name="currentExercise?.exerciseName"
    />

    <div class="controls">
      <AppButton
        v-if="!isPaused && !isComplete"
        expand="block"
        size="large"
        @click="handlePause"
      >
        Pause
      </AppButton>
      <AppButton
        v-else-if="isPaused"
        expand="block"
        size="large"
        @click="handleResume"
      >
        Resume
      </AppButton>
      <AppButton
        v-if="isComplete"
        expand="block"
        size="large"
        @click="emit('finish')"
      >
        Complete Workout
      </AppButton>

      <div class="secondary-controls">
        <AppButton
          v-if="!isComplete"
          fill="outline"
          size="small"
          @click="handleSkip"
        >
          Skip Interval
        </AppButton>
        <AppButton
          v-if="!isComplete"
          fill="outline"
          size="small"
          color="danger"
          @click="emit('finish')"
        >
          End Early
        </AppButton>
      </div>
    </div>

    <div v-if="workout.intervalConfig" class="exercise-list">
      <details>
        <summary class="exercise-list-header">Exercise Rotation</summary>
        <div class="exercise-list-content">
          <div
            v-for="(exercise, index) in workout.intervalConfig.exercises"
            :key="exercise.exerciseId"
            class="exercise-list-item"
            :class="{ 'exercise-list-item--current': index === currentExerciseIndex }"
          >
            <span class="exercise-index">{{ index + 1 }}</span>
            <span class="exercise-name-text">{{ exercise.exerciseName }}</span>
          </div>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import IntervalTimer from './IntervalTimer.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import { useIntervalTimer } from '../composables/useIntervalTimer'
import type { Workout } from '../types/workout.types'

interface Props {
  workout: Workout
}

const props = defineProps<Props>()

const emit = defineEmits<{
  finish: []
  updateProgress: [progress: any]
}>()

if (!props.workout.intervalConfig) {
  throw new Error('Workout must have interval configuration')
}

const {
  currentTime,
  currentPhase,
  currentRound,
  currentExercise,
  currentExerciseIndex,
  completedIntervals,
  isPaused,
  isComplete,
  totalIntervals,
  progressPercentage,
  startTimer,
  pauseTimer,
  resumeTimer,
  skipInterval,
  stopTimer,
  getProgress
} = useIntervalTimer(props.workout.intervalConfig, props.workout.intervalProgress)

function handlePause() {
  pauseTimer()
  emit('updateProgress', getProgress())
}

function handleResume() {
  resumeTimer()
}

function handleSkip() {
  skipInterval()
  emit('updateProgress', getProgress())
}

// Auto-save progress periodically
let progressInterval: number | null = null

onMounted(() => {
  // Start the timer automatically
  startTimer()

  // Save progress every 5 seconds
  progressInterval = window.setInterval(() => {
    if (!isPaused.value && !isComplete.value) {
      emit('updateProgress', getProgress())
    }
  }, 5000)
})

onUnmounted(() => {
  stopTimer()
  if (progressInterval) {
    clearInterval(progressInterval)
  }
  // Save final progress
  emit('updateProgress', getProgress())
})

// Watch for completion
watch(isComplete, (complete) => {
  if (complete) {
    emit('updateProgress', getProgress())
  }
})
</script>

<style scoped>
.interval-workout-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  padding: var(--spacing-base);
  height: 100%;
  overflow-y: auto;
}

.workout-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.workout-name {
  font-size: var(--typography-h3-size);
  font-weight: var(--typography-h3-weight);
  color: var(--color-text-primary);
  margin: 0;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: var(--color-background-secondary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  transition: width var(--transition-base);
  border-radius: var(--radius-full);
}

.progress-text {
  font-size: var(--typography-small-size);
  color: var(--color-text-secondary);
  text-align: center;
  margin: 0;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.secondary-controls {
  display: flex;
  gap: var(--spacing-sm);
}

.secondary-controls > * {
  flex: 1;
}

.exercise-list {
  margin-top: auto;
  border: var(--border-width-thin) solid var(--color-border);
  border-radius: var(--radius-card);
  overflow: hidden;
}

.exercise-list-header {
  padding: var(--spacing-md) var(--spacing-base);
  background-color: var(--color-background-secondary);
  cursor: pointer;
  font-size: var(--typography-body-size);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  list-style: none;
  user-select: none;
}

.exercise-list-header::-webkit-details-marker {
  display: none;
}

.exercise-list-header::before {
  content: '▶';
  display: inline-block;
  margin-right: var(--spacing-sm);
  transition: var(--transition-transform);
}

details[open] .exercise-list-header::before {
  transform: rotate(90deg);
}

.exercise-list-content {
  display: flex;
  flex-direction: column;
}

.exercise-list-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-base);
  border-top: var(--border-width-thin) solid var(--color-border);
  transition: var(--transition-background);
}

.exercise-list-item--current {
  background-color: var(--color-primary-lighter);
  font-weight: var(--font-weight-semibold);
}

.exercise-index {
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

.exercise-list-item--current .exercise-index {
  background-color: var(--color-primary-hover);
}

.exercise-name-text {
  flex: 1;
  font-size: var(--typography-body-size);
  color: var(--color-text-primary);
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .interval-workout-view {
    padding: var(--spacing-lg);
  }

  .secondary-controls {
    max-width: 500px;
    margin: 0 auto;
    width: 100%;
  }
}
</style>

