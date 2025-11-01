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
  background: linear-gradient(
    135deg,
    var(--color-primary-500) 0%,
    var(--color-primary-600) 50%,
    var(--color-primary-700) 100%
  );
  color: var(--color-text-primary);
}

.start-button--primary:hover {
  background: linear-gradient(
    135deg,
    var(--color-primary-400) 0%,
    var(--color-primary-500) 50%,
    var(--color-primary-600) 100%
  );
  box-shadow: var(--shadow-card-hover);
}

.start-button--primary:active {
  background: linear-gradient(
    135deg,
    var(--color-primary-600) 0%,
    var(--color-primary-700) 50%,
    var(--color-primary-800) 100%
  );
}

.start-button--secondary {
  background: linear-gradient(
    135deg,
    var(--color-primary-600) 0%,
    var(--color-primary-700) 50%,
    var(--color-primary-800) 100%
  );
  color: var(--color-text-primary);
}

.start-button--secondary:hover {
  background: linear-gradient(
    135deg,
    var(--color-primary-500) 0%,
    var(--color-primary-600) 50%,
    var(--color-primary-700) 100%
  );
  box-shadow: var(--shadow-card-hover);
}

.start-button--secondary:active {
  background: linear-gradient(
    135deg,
    var(--color-primary-700) 0%,
    var(--color-primary-800) 50%,
    var(--color-primary-900) 100%
  );
}

.start-button--routine {
  background: linear-gradient(
    135deg,
    var(--color-secondary-700) 0%,
    var(--color-secondary-800) 50%,
    var(--color-secondary-900) 100%
  );
  color: var(--color-text-primary);
}

.start-button--routine:hover {
  background: linear-gradient(
    135deg,
    var(--color-secondary-600) 0%,
    var(--color-secondary-700) 50%,
    var(--color-secondary-800) 100%
  );
  box-shadow: var(--shadow-card-hover);
}

.start-button--routine:active {
  background: linear-gradient(
    135deg,
    var(--color-secondary-800) 0%,
    var(--color-secondary-900) 50%,
    var(--color-secondary-950) 100%
  );
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
