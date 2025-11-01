<template>
  <div class="workout-timer">
    <div class="timer-display">{{ formattedDuration }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  startTime?: Date | string
  isActive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isActive: true,
})

const currentTime = ref<Date>(new Date())
let intervalId: number | null = null

const duration = computed(() => {
  if (!props.startTime) return 0

  const start = typeof props.startTime === 'string' 
    ? new Date(props.startTime) 
    : props.startTime
  
  const elapsed = currentTime.value.getTime() - start.getTime()
  return Math.max(0, Math.floor(elapsed / 1000)) // Duration in seconds
})

const formattedDuration = computed(() => {
  const totalSeconds = duration.value
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

function updateTime() {
  currentTime.value = new Date()
}

onMounted(() => {
  if (props.isActive) {
    updateTime()
    intervalId = window.setInterval(updateTime, 1000)
  }
})

onUnmounted(() => {
  if (intervalId !== null) {
    clearInterval(intervalId)
  }
})
</script>

<style scoped>
.workout-timer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xs) var(--spacing-sm);
}

.timer-display {
  font-size: var(--typography-h2-size);
  font-weight: var(--typography-h2-weight);
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
  letter-spacing: 0.02em;
}
</style>
