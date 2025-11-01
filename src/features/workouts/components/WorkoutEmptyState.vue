<template>
  <div class="workout-empty-state">
    <div class="workout-type-buttons">
      <WorkoutStartButtons
        @start-regular="emit('startRegular')"
        @start-interval="emit('startInterval')"
      />
    </div>

    <div class="workout-options">
      <AppButton
        expand="block"
        fill="outline"
        @click="emit('createCustom')"
      >
        Create Custom Workout
      </AppButton>
      <AppButton
        expand="block"
        @click="emit('browseTemplates')"
      >
        Browse Templates
      </AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import WorkoutStartButtons from './WorkoutStartButtons.vue'
import AppButton from '@/components/atoms/AppButton.vue'

const emit = defineEmits<{
  startRegular: []
  startInterval: []
  createCustom: []
  browseTemplates: []
}>()
</script>

<style scoped>
.workout-empty-state {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  padding: var(--spacing-lg);
  height: 100%;
}

.workout-type-buttons {
  width: 100%;
}

.workout-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  width: 100%;
}
</style>

