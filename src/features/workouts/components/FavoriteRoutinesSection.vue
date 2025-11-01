<template>
  <div v-if="routines.length > 0" class="favorite-routines-section">
    <h2 class="section-title">Favorite Routines</h2>
    <div class="routines-list">
      <MediaRoutineCard
        v-for="routine in routines"
        :key="routine.id"
        :routine="routine"
        @click="$emit('startRoutine', routine)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WorkoutRoutine } from "../types/workout.types";
import MediaRoutineCard from "./MediaRoutineCard.vue";

interface Props {
  routines?: WorkoutRoutine[];
}

const props = withDefaults(defineProps<Props>(), {
  routines: () => [],
});

const emit = defineEmits<{
  startRoutine: [routine: WorkoutRoutine];
}>();
</script>

<style scoped>
.favorite-routines-section {
  margin-bottom: var(--spacing-2xl);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-base) 0;
  padding: 0 var(--spacing-base);
}

.routines-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
  padding: 0 var(--spacing-base);
}
</style>
