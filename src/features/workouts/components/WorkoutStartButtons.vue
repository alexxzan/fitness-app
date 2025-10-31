<template>
  <div class="workout-start-buttons">
    <h2 class="title">Start a Workout</h2>
    <div class="button-container">
      <button class="start-button start-button--primary" @click="emit('startRegular')">
        <span class="button-icon">💪</span>
        <span class="button-text">
          <span class="button-title">Regular Workout</span>
          <span class="button-description">Track sets, reps & weight</span>
        </span>
      </button>
      <button class="start-button start-button--secondary" @click="emit('startInterval')">
        <span class="button-icon">⏱️</span>
        <span class="button-text">
          <span class="button-title">Interval Workout</span>
          <span class="button-description">Timer-based HIIT training</span>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  startRegular: []
  startInterval: []
}>()
</script>

<style scoped>
.workout-start-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: var(--spacing-xl);
  gap: var(--spacing-2xl);
}

.title {
  font-size: var(--typography-h2-size);
  font-weight: var(--typography-h2-weight);
  line-height: var(--typography-h2-line-height);
  color: var(--color-text-primary);
  margin: 0;
  text-align: center;
}

.button-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  width: 100%;
  max-width: 400px;
}

.start-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
  padding: var(--spacing-lg) var(--spacing-xl);
  min-height: var(--button-height-lg);
  border: none;
  border-radius: var(--radius-button);
  box-shadow: var(--shadow-button);
  cursor: pointer;
  transition: var(--transition-all);
  font-family: var(--font-family-base);
  text-align: left;
  width: 100%;
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

.button-icon {
  font-size: var(--font-size-3xl);
  flex-shrink: 0;
  line-height: 1;
}

.button-text {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  flex: 1;
}

.button-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

.button-description {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-normal);
  opacity: 0.9;
  line-height: var(--line-height-normal);
}

/* Tablet and larger */
@media (min-width: 768px) {
  .button-container {
    flex-direction: row;
    max-width: 800px;
  }

  .start-button {
    flex: 1;
    flex-direction: column;
    text-align: center;
    padding: var(--spacing-2xl) var(--spacing-lg);
    min-height: 200px;
  }

  .button-text {
    align-items: center;
    gap: var(--spacing-sm);
  }

  .button-icon {
    font-size: var(--font-size-6xl);
  }

  .button-title {
    font-size: var(--font-size-xl);
  }
}
</style>

