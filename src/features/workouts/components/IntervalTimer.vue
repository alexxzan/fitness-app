<template>
  <div class="interval-timer" :class="`interval-timer--${phase}`">
    <div class="timer-content">
      <div class="phase-label">{{ phaseLabel }}</div>
      <div class="timer-display">{{ formattedTime }}</div>
      <div v-if="exerciseName" class="exercise-name">{{ exerciseName }}</div>
      <div class="round-indicator">
        Round {{ currentRound }} of {{ totalRounds }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentTime: number
  phase: 'work' | 'rest'
  currentRound: number
  totalRounds: number
  exerciseName?: string
}

const props = defineProps<Props>()

const phaseLabel = computed(() => {
  return props.phase === 'work' ? 'WORK' : 'REST'
})

const formattedTime = computed(() => {
  const minutes = Math.floor(props.currentTime / 60)
  const seconds = props.currentTime % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})
</script>

<style scoped>
.interval-timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  border-radius: var(--radius-card);
  transition: var(--transition-background), var(--transition-color);
  min-height: 300px;
}

.interval-timer--work {
  background: linear-gradient(135deg, var(--color-error-600) 0%, var(--color-error-700) 100%);
  color: white;
}

.interval-timer--rest {
  background: linear-gradient(135deg, var(--color-success-600) 0%, var(--color-success-700) 100%);
  color: white;
}

.timer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  text-align: center;
  width: 100%;
}

.phase-label {
  font-size: var(--typography-h2-size);
  font-weight: var(--typography-h2-weight);
  letter-spacing: var(--letter-spacing-wider);
  text-transform: uppercase;
  opacity: 0.95;
  animation: pulse 2s ease-in-out infinite;
}

.timer-display {
  font-size: var(--font-size-6xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  font-variant-numeric: tabular-nums;
  letter-spacing: var(--letter-spacing-tight);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.exercise-name {
  font-size: var(--typography-h3-size);
  font-weight: var(--typography-h3-weight);
  opacity: 0.9;
  max-width: 80%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.round-indicator {
  font-size: var(--typography-h4-size);
  font-weight: var(--typography-h4-weight);
  opacity: 0.85;
  margin-top: var(--spacing-sm);
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.95;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.02);
  }
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .interval-timer {
    min-height: 400px;
    padding: var(--spacing-3xl);
  }

  .phase-label {
    font-size: var(--font-size-3xl);
  }

  .timer-display {
    font-size: 8rem;
  }

  .exercise-name {
    font-size: var(--typography-h2-size);
  }

  .round-indicator {
    font-size: var(--typography-h3-size);
  }
}

/* Small screens */
@media (max-width: 480px) {
  .timer-display {
    font-size: var(--font-size-5xl);
  }

  .phase-label {
    font-size: var(--typography-h3-size);
  }
}
</style>

