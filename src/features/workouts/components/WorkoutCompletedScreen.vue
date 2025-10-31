<template>
  <div class="workout-completed">
    <div class="completed-header">
      <div class="success-icon">✓</div>
      <h1 class="title">Workout Completed!</h1>
    </div>

    <div class="summary-card">
      <h2 class="workout-name">{{ workout.name }}</h2>
      <p class="workout-date">{{ formattedDate }}</p>

      <div class="stats-grid">
        <!-- Regular Workout Stats -->
        <template v-if="workout.type === 'regular'">
          <div class="stat-item">
            <span class="stat-value">{{ statistics.duration }}</span>
            <span class="stat-label">Minutes</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ statistics.totalSets }}</span>
            <span class="stat-label">Sets</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ statistics.totalReps }}</span>
            <span class="stat-label">Reps</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ statistics.totalVolume.toFixed(0) }}</span>
            <span class="stat-label">kg Lifted</span>
          </div>
        </template>

        <!-- Interval Workout Stats -->
        <template v-else-if="workout.type === 'interval'">
          <div class="stat-item">
            <span class="stat-value">{{ statistics.duration }}</span>
            <span class="stat-label">Minutes</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ workout.intervalProgress?.currentRound || 0 }}</span>
            <span class="stat-label">Rounds</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ workout.intervalProgress?.completedIntervals || 0 }}</span>
            <span class="stat-label">Intervals</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ statistics.exercisesCount }}</span>
            <span class="stat-label">Exercises</span>
          </div>
        </template>
      </div>

      <!-- Exercises List -->
      <div v-if="exerciseList.length > 0" class="exercises-section">
        <h3 class="section-title">Exercises</h3>
        <div class="exercise-list">
          <div
            v-for="(exercise, index) in exerciseList"
            :key="index"
            class="exercise-item"
          >
            <span class="exercise-bullet">•</span>
            <span class="exercise-name">{{ exercise }}</span>
          </div>
        </div>
      </div>

      <!-- Notes Input -->
      <div class="notes-section">
        <label class="notes-label" for="workout-notes">Workout Notes</label>
        <textarea
          id="workout-notes"
          v-model="notes"
          class="notes-input"
          placeholder="How did it go? Any observations?"
          rows="4"
        ></textarea>
      </div>
    </div>

    <div class="actions">
      <AppButton expand="block" @click="handleDone">
        Done
      </AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AppButton from '@/components/atoms/AppButton.vue'
import type { Workout, WorkoutStatistics } from '../types/workout.types'

interface Props {
  workout: Workout
  statistics: WorkoutStatistics
}

const props = defineProps<Props>()

const emit = defineEmits<{
  done: [notes: string]
}>()

const notes = ref(props.workout.notes || '')

const formattedDate = computed(() => {
  const date = props.workout.endTime 
    ? new Date(props.workout.endTime)
    : new Date()
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const exerciseList = computed(() => {
  if (props.workout.type === 'regular') {
    return props.workout.exercises.map(ex => ex.exerciseName)
  } else if (props.workout.type === 'interval' && props.workout.intervalConfig) {
    return props.workout.intervalConfig.exercises.map(ex => ex.exerciseName)
  }
  return []
})

function handleDone() {
  emit('done', notes.value)
}
</script>

<style scoped>
.workout-completed {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: var(--spacing-lg);
  overflow-y: auto;
  background-color: var(--color-background);
}

.completed-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-2xl);
}

.success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--color-success-600) 0%, var(--color-success-700) 100%);
  border-radius: var(--radius-full);
  font-size: var(--font-size-4xl);
  color: white;
  box-shadow: var(--shadow-lg);
}

.title {
  font-size: var(--typography-h2-size);
  font-weight: var(--typography-h2-weight);
  color: var(--color-text-primary);
  margin: 0;
  text-align: center;
}

.summary-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background-color: var(--color-surface);
  border-radius: var(--radius-card);
  border: var(--border-width-thin) solid var(--color-border);
  box-shadow: var(--shadow-card);
}

.workout-name {
  font-size: var(--typography-h3-size);
  font-weight: var(--typography-h3-weight);
  color: var(--color-text-primary);
  margin: 0;
  text-align: center;
}

.workout-date {
  font-size: var(--typography-small-size);
  color: var(--color-text-secondary);
  text-align: center;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-base);
  margin-top: var(--spacing-md);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--color-background-secondary);
  border-radius: var(--radius-base);
  border: var(--border-width-thin) solid var(--color-border);
}

.stat-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  line-height: var(--line-height-tight);
}

.stat-label {
  font-size: var(--typography-small-size);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
  margin-top: var(--spacing-xs);
}

.exercises-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: var(--border-width-thin) solid var(--color-border);
}

.section-title {
  font-size: var(--typography-h4-size);
  font-weight: var(--typography-h4-weight);
  color: var(--color-text-primary);
  margin: 0;
}

.exercise-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.exercise-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.exercise-bullet {
  color: var(--color-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.exercise-name {
  font-size: var(--typography-body-size);
  color: var(--color-text-primary);
}

.notes-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: var(--border-width-thin) solid var(--color-border);
}

.notes-label {
  font-size: var(--typography-body-size);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.notes-input {
  width: 100%;
  padding: var(--spacing-md);
  font-family: var(--font-family-base);
  font-size: var(--typography-body-size);
  color: var(--color-text-primary);
  background-color: var(--color-background);
  border: var(--border-width-thin) solid var(--color-border);
  border-radius: var(--radius-input);
  resize: vertical;
  transition: var(--transition-border);
}

.notes-input:focus {
  outline: none;
  border-color: var(--color-border-focus);
}

.notes-input::placeholder {
  color: var(--color-text-tertiary);
}

.actions {
  margin-top: var(--spacing-xl);
}

/* Tablet and larger */
@media (min-width: 768px) {
  .workout-completed {
    max-width: 600px;
    margin: 0 auto;
    padding: var(--spacing-2xl);
  }

  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .success-icon {
    width: 100px;
    height: 100px;
    font-size: var(--font-size-5xl);
  }
}
</style>

