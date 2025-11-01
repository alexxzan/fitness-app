<template>
  <div class="my-workout-programs-section">
    <div class="section-header">
      <h2 class="section-title">My Workout Programs</h2>
      <ion-button
        v-if="programs.length > 0"
        fill="clear"
        size="small"
        @click="$emit('addProgram')"
      >
        <ion-icon :icon="add" slot="start" />
        Add Program
      </ion-button>
    </div>

    <div v-if="programs.length === 0" class="empty-state">
      <p class="empty-text">No workout programs yet</p>
      <p class="empty-hint">Add a template to get started</p>
      <ion-button fill="outline" @click="$emit('addProgram')">
        <ion-icon :icon="add" slot="start" />
        Add Program
      </ion-button>
    </div>

    <div v-else class="programs-list">
      <div
        v-for="program in programs"
        :key="program.id"
        class="program-card"
      >
        <div class="program-header">
          <h3 class="program-name">{{ program.name }}</h3>
          <ion-button
            fill="clear"
            size="small"
            @click="$emit('removeProgram', program)"
          >
            <ion-icon :icon="close" />
          </ion-button>
        </div>
        <p v-if="program.description" class="program-description">
          {{ program.description }}
        </p>
        <div class="workouts-list">
          <div
            v-for="workout in program.workouts"
            :key="workout.id"
            class="workout-item"
            @click="$emit('startWorkout', workout)"
          >
            <div class="workout-info">
              <span class="workout-name">{{ workout.name }}</span>
              <span class="workout-exercises">{{ workout.exercises.length }} exercises</span>
            </div>
            <ion-icon :icon="chevronForward" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonButton, IonIcon } from "@ionic/vue";
import { add, close, chevronForward } from "ionicons/icons";
import type { WorkoutProgram, WorkoutRoutine } from "../types/workout.types";

interface Props {
  programs?: WorkoutProgram[];
}

const props = withDefaults(defineProps<Props>(), {
  programs: () => [],
});

const emit = defineEmits<{
  addProgram: [];
  startWorkout: [routine: WorkoutRoutine];
  removeProgram: [program: WorkoutProgram];
}>();
</script>

<style scoped>
.my-workout-programs-section {
  margin-bottom: var(--spacing-lg);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--spacing-base) var(--spacing-base) var(--spacing-base);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.empty-state {
  padding: var(--spacing-xl) var(--spacing-base);
  text-align: center;
}

.empty-text {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-xs) 0;
}

.empty-hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  margin: 0 0 var(--spacing-md) 0;
}

.programs-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
  padding: 0 var(--spacing-base);
}

.program-card {
  background: var(--color-background-secondary);
  border-radius: var(--radius-card);
  border: 1px solid var(--color-border);
  padding: var(--spacing-base);
}

.program-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
}

.program-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  flex: 1;
}

.program-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-sm) 0;
  line-height: var(--line-height-normal);
}

.workouts-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.workout-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm);
  background: var(--color-background);
  border-radius: var(--radius-button);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.workout-item:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary-500);
}

.workout-item:active {
  transform: scale(0.98);
}

.workout-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.workout-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.workout-exercises {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.workout-item ion-icon {
  font-size: 18px;
  color: var(--color-text-tertiary);
}
</style>

