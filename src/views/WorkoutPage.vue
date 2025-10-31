<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Workout</ion-title>
        <ion-buttons slot="end">
          <ion-button v-if="currentWorkout" @click="showFinishModal = true">
            Finish
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div v-if="!currentWorkout" class="empty-state">
        <h2>No active workout</h2>
        <AppButton @click="startWorkout">Start New Workout</AppButton>
      </div>

      <div v-else class="workout-container">
        <ion-item>
          <ion-label>
            <h2>{{ currentWorkout.name }}</h2>
            <p v-if="statistics">{{ statistics.totalSets }} sets completed</p>
          </ion-label>
        </ion-item>

        <SetTracker
          v-for="exercise in currentWorkout.exercises"
          :key="exercise.id"
          :exercise="exercise"
          @add-set="handleAddSet(exercise.id)"
          @update-set="
            (setId, field, value) =>
              handleUpdateSet(exercise.id, { setId, field, value })
          "
          @toggle-completed="
            (setId) => handleToggleCompleted(exercise.id, setId)
          "
          @delete-set="(setId) => handleDeleteSet(exercise.id, setId)"
        />

        <ion-fab vertical="bottom" horizontal="end" slot="fixed">
          <ion-fab-button @click="showExerciseModal = true">
            <ion-icon :icon="add" />
          </ion-fab-button>
        </ion-fab>
      </div>

      <!-- Exercise Selection Modal -->
      <ion-modal
        :is-open="showExerciseModal"
        @did-dismiss="showExerciseModal = false"
      >
        <ion-header>
          <ion-toolbar>
            <ion-title>Add Exercise</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="showExerciseModal = false">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ExerciseSelector
            :exercises="exercises"
            @select="handleAddExercise"
          />
        </ion-content>
      </ion-modal>

      <!-- Finish Workout Modal -->
      <ion-modal
        :is-open="showFinishModal"
        @did-dismiss="showFinishModal = false"
      >
        <ion-header>
          <ion-toolbar>
            <ion-title>Finish Workout</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <p>Are you sure you want to finish this workout?</p>
          <div v-if="statistics" class="workout-summary">
            <h3>Summary</h3>
            <p>Total Sets: {{ statistics.totalSets }}</p>
            <p>Total Reps: {{ statistics.totalReps }}</p>
            <p>Total Volume: {{ statistics.totalVolume }} kg</p>
            <p>Duration: {{ statistics.duration }} minutes</p>
          </div>
          <div class="button-group">
            <AppButton expand="block" @click="handleFinishWorkout"
              >Finish</AppButton
            >
            <AppButton
              expand="block"
              fill="outline"
              @click="showFinishModal = false"
              >Cancel</AppButton
            >
          </div>
        </ion-content>
      </ion-modal>

      <!-- Start Workout Modal -->
      <ion-modal
        :is-open="showStartModal"
        @did-dismiss="showStartModal = false"
      >
        <ion-header>
          <ion-toolbar>
            <ion-title>Start New Workout</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <FormField
            v-model="newWorkoutName"
            label="Workout Name"
            placeholder="Enter workout name"
          />
          <div class="button-group">
            <AppButton expand="block" @click="handleStartWorkout"
              >Start</AppButton
            >
            <AppButton
              expand="block"
              fill="outline"
              @click="showStartModal = false"
              >Cancel</AppButton
            >
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonItem,
  IonLabel,
  IonFab,
  IonFabButton,
  IonIcon,
  IonModal,
} from "@ionic/vue";
import { add } from "ionicons/icons";
import { useWorkout } from "@/features/workouts/composables/useWorkout";
import type { Exercise } from "@/features/exercises/types/exercise.types";
import { useExerciseLibrary } from "@/features/exercises/composables/useExerciseLibrary";
import SetTracker from "@/features/workouts/components/SetTracker.vue";
import ExerciseSelector from "@/features/exercises/components/ExerciseSelector.vue";
import AppButton from "@/components/atoms/AppButton.vue";
import FormField from "@/components/molecules/FormField.vue";

const {
  currentWorkout,
  statistics,
  loadActiveWorkout,
  createWorkout,
  addExercise,
  addSet,
  updateSet,
  toggleSetCompleted,
  deleteSet,
  finishWorkout,
} = useWorkout();

const { exercises, loadExercises } = useExerciseLibrary();

const showExerciseModal = ref(false);
const showFinishModal = ref(false);
const showStartModal = ref(false);
const newWorkoutName = ref("");

onMounted(async () => {
  await loadActiveWorkout();
  await loadExercises();
});

async function startWorkout() {
  showStartModal.value = true;
}

async function handleStartWorkout() {
  if (!newWorkoutName.value.trim()) return;
  await createWorkout(newWorkoutName.value);
  newWorkoutName.value = "";
  showStartModal.value = false;
}

function handleAddExercise(exercise: Exercise) {
  addExercise(exercise.exerciseId, exercise.name);
  showExerciseModal.value = false;
}

function handleAddSet(exerciseId: string) {
  addSet(exerciseId, {
    reps: undefined,
    weight: undefined,
    restTime: undefined,
  });
}

function handleUpdateSet(
  exerciseId: string,
  payload: { setId: string; field: string; value: number | null }
) {
  updateSet(exerciseId, payload.setId, {
    [payload.field]: payload.value,
  } as any);
}

function handleToggleCompleted(exerciseId: string, setId: string) {
  toggleSetCompleted(exerciseId, setId);
}

function handleDeleteSet(exerciseId: string, setId: string) {
  deleteSet(exerciseId, setId);
}

async function handleFinishWorkout() {
  try {
    await finishWorkout();
    showFinishModal.value = false;
  } catch (error) {
    console.error("Failed to finish workout:", error);
  }
}
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: var(--spacing-xl);
  text-align: center;
  gap: var(--spacing-lg);
}

.empty-state h2 {
  font-size: var(--typography-h2-size);
  font-weight: var(--typography-h2-weight);
  color: var(--color-text-primary);
  margin: 0;
}

.workout-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
  padding: var(--spacing-base);
}

.workout-summary {
  margin: var(--spacing-base) 0;
  padding: var(--spacing-base);
  background: var(--color-background-secondary);
  border-radius: var(--radius-card);
  border: var(--border-width-thin) solid var(--color-border);
}

.workout-summary h3 {
  font-size: var(--typography-h3-size);
  font-weight: var(--typography-h3-weight);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.workout-summary p {
  font-size: var(--typography-body-size);
  color: var(--color-text-secondary);
  margin: var(--spacing-sm) 0;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}
</style>
