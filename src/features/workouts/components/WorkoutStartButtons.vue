<template>
  <div class="workout-start-buttons">
    <h2 class="section-title">Quick Start</h2>
    <div class="button-container">
      <button
        class="start-button start-button--primary"
        @click="emit('startRegular')"
      >
        <div class="button-icon">
          <ion-icon :icon="barbell" />
        </div>
        <span class="button-text">
          <span class="button-title">Regular</span>
          <span class="button-description">Sets & reps</span>
        </span>
      </button>
      <button
        class="start-button start-button--secondary"
        @click="emit('startInterval')"
      >
        <div class="button-icon">
          <ion-icon :icon="flash" />
        </div>
        <span class="button-text">
          <span class="button-title">Interval</span>
          <span class="button-description">HIIT training</span>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue'
import { barbell, flash } from 'ionicons/icons'

const emit = defineEmits<{
  startRegular: [];
  startInterval: [];
}>();
</script>

<style scoped>
.workout-start-buttons {
  width: 100%;
  padding: 0 var(--spacing-base);
  margin-bottom: var(--spacing-2xl);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-base) 0;
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
  gap: var(--spacing-base);
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
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.button-icon ion-icon {
  font-size: 24px;
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
