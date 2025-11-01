<template>
  <div class="workout-start-buttons">
    <div class="button-container">
      <button
        class="start-button start-button--routine"
        @click="emit('startFromRoutine')"
      >
        <span class="button-text">
          <span class="button-title">From Routine</span>
          <span class="button-description">Use saved program</span>
        </span>
      </button>
      <button
        class="start-button start-button--primary"
        @click="emit('startRegular')"
      >
        <span class="button-text">
          <span class="button-title">Regular</span>
          <span class="button-description">Sets & reps</span>
        </span>
      </button>
      <button
        class="start-button start-button--secondary"
        @click="emit('startInterval')"
      >
        <span class="button-text">
          <span class="button-title">Interval</span>
          <span class="button-description">HIIT training</span>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  startFromRoutine: [];
  startRegular: [];
  startInterval: [];
}>();
</script>

<style scoped>
.workout-start-buttons {
  width: 100%;
}

.button-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  width: 100%;
}

.start-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-base);
  min-height: auto;
  border: none;
  border-radius: var(--radius-button);
  box-shadow: var(--shadow-button);
  cursor: pointer;
  transition: var(--transition-all);
  font-family: var(--font-family-base);
  text-align: left;
  flex: 1;
}

.start-button:active {
  transform: translateY(1px);
  box-shadow: var(--shadow-button-active);
}

.start-button--primary {
  background-color: var(--color-primary);
  color: white;
}

.start-button--primary:hover {
  background-color: var(--color-primary-hover);
  box-shadow: var(--shadow-card-hover);
}

.start-button--primary:active {
  background-color: var(--color-primary-active);
}

.start-button--secondary {
  background-color: var(--color-secondary);
  color: white;
}

.start-button--secondary:hover {
  background-color: var(--color-secondary-hover);
  box-shadow: var(--shadow-card-hover);
}

.start-button--secondary:active {
  background-color: var(--color-secondary-active);
}

.start-button--routine {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.start-button--routine:hover {
  background: linear-gradient(135deg, #5568d3 0%, #653a8c 100%);
  box-shadow: var(--shadow-card-hover);
}

.start-button--routine:active {
  background: linear-gradient(135deg, #4a59bd 0%, #563177 100%);
}

.button-icon {
  font-size: var(--font-size-lg);
  flex-shrink: 0;
  line-height: 1;
}

.button-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.button-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

.button-description {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-normal);
  opacity: 0.9;
  line-height: var(--line-height-normal);
}
</style>
