<template>
  <ion-modal :is-open="isOpen" @did-dismiss="handleClose">
    <ion-header>
      <ion-toolbar>
        <ion-title>Edit Exercise</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleClose">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="exercise-info">
        <h3>{{ exercise.exerciseName }}</h3>
      </div>

      <FormField
        v-model.number="targetSets"
        type="number"
        label="Target Sets"
        placeholder="e.g., 3"
      />

      <FormField
        v-model="targetReps"
        label="Target Reps"
        placeholder="e.g., 8-10 or 5"
      />

      <FormField
        v-model.number="targetWeight"
        type="number"
        label="Target Weight (kg)"
        placeholder="e.g., 80"
      />

      <FormField
        v-model.number="restTime"
        type="number"
        label="Rest Time (seconds)"
        placeholder="e.g., 90"
      />

      <FormField
        v-model="notes"
        label="Notes (Optional)"
        placeholder="Add any notes..."
      />

      <div class="button-group">
        <AppButton expand="block" @click="handleSave">Save</AppButton>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
} from "@ionic/vue";
import FormField from "@/components/molecules/FormField.vue";
import AppButton from "@/components/atoms/AppButton.vue";
import type { RoutineExercise } from "../../types/workout.types";

interface Props {
  isOpen: boolean;
  exercise: RoutineExercise;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  save: [exercise: RoutineExercise];
  close: [];
}>();

const targetSets = ref<number | undefined>(undefined);
const targetReps = ref("");
const targetWeight = ref<number | undefined>(undefined);
const restTime = ref<number | undefined>(undefined);
const notes = ref("");

watch(
  () => props.exercise,
  (newExercise) => {
    if (newExercise) {
      targetSets.value = newExercise.targetSets;
      targetReps.value = newExercise.targetReps || "";
      targetWeight.value = newExercise.targetWeight;
      restTime.value = newExercise.restTime;
      notes.value = newExercise.notes || "";
    }
  },
  { immediate: true }
);

function handleSave() {
  const updatedExercise: RoutineExercise = {
    ...props.exercise,
    targetSets: targetSets.value,
    targetReps: targetReps.value || undefined,
    targetWeight: targetWeight.value,
    restTime: restTime.value,
    notes: notes.value || undefined,
  };

  emit("save", updatedExercise);
}

function handleClose() {
  emit("close");
}
</script>

<style scoped>
.exercise-info {
  margin-bottom: var(--spacing-lg);
}

.exercise-info h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.button-group {
  margin-top: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
}
</style>

