<template>
  <div class="cardio-history">
    <ion-list v-if="history.length > 0">
      <CardioWorkoutCard
        v-for="workout in history"
        :key="workout.id"
        :workout="workout"
        @click="handleWorkoutClick(workout)"
      />
    </ion-list>
    <div v-else class="empty-state">
      <ion-icon :icon="fitness" size="large" />
      <h2>No Cardio Workouts Yet</h2>
      <p>Start tracking your cardio workouts to see them here.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonList, IonIcon } from "@ionic/vue";
import { fitness } from "ionicons/icons";
import CardioWorkoutCard from "./CardioWorkoutCard.vue";
import type { Workout } from "@/features/workouts/types/workout.types";

interface Props {
  history: Workout[];
}

defineProps<Props>();

const emit = defineEmits<{
  workoutClick: [workout: Workout];
}>();

function handleWorkoutClick(workout: Workout) {
  emit("workoutClick", workout);
}
</script>

<style scoped>
.cardio-history {
  padding: var(--spacing-base);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  text-align: center;
}

.empty-state ion-icon {
  color: var(--ion-color-medium);
  margin-bottom: var(--spacing-base);
}

.empty-state h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--ion-color-dark);
  margin-bottom: var(--spacing-sm);
}

.empty-state p {
  font-size: var(--font-size-base);
  color: var(--ion-color-medium);
}
</style>

