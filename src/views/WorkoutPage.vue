<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Workout</ion-title>
        <ion-buttons slot="end">
          <ion-button v-if="currentWorkout && workoutState === 'active'" @click="showFinishModal = true">
            Finish
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <!-- Empty State -->
      <div v-if="workoutState === 'empty'" class="empty-state">
        <WorkoutStartButtons
          @start-regular="handleStartRegular"
          @start-interval="handleStartInterval"
        />
      </div>

      <!-- Regular Workout View -->
      <RegularWorkoutView
        v-else-if="workoutState === 'active' && currentWorkout?.type === 'regular'"
        :workout="currentWorkout"
        :statistics="statistics"
        @add-exercise="showExerciseModal = true"
        @add-set="handleAddSet"
        @update-set="handleUpdateSet"
        @toggle-completed="handleToggleCompleted"
        @delete-set="handleDeleteSet"
      />

      <!-- Interval Workout View -->
      <IntervalWorkoutView
        v-else-if="workoutState === 'active' && currentWorkout?.type === 'interval'"
        :workout="currentWorkout"
        @finish="showFinishModal = true"
        @update-progress="handleUpdateIntervalProgress"
      />

      <!-- Workout Completed View -->
      <WorkoutCompletedScreen
        v-else-if="workoutState === 'completed' && completedWorkout && completedStats"
        :workout="completedWorkout"
        :statistics="completedStats"
        @done="handleCompletedDone"
      />

      <!-- Regular Workout Start Modal -->
      <ion-modal
        :is-open="showStartRegularModal"
        @did-dismiss="showStartRegularModal = false"
      >
        <ion-header>
          <ion-toolbar>
            <ion-title>Start Regular Workout</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <FormField
            v-model="newWorkoutName"
            label="Workout Name"
            placeholder="Enter workout name"
          />
          <div class="button-group">
            <AppButton expand="block" @click="handleStartRegularWorkout">
              Start
            </AppButton>
            <AppButton
              expand="block"
              fill="outline"
              @click="showStartRegularModal = false"
            >
              Cancel
            </AppButton>
          </div>
        </ion-content>
      </ion-modal>

      <!-- Interval Workout Config Modal -->
      <ion-modal
        :is-open="showStartIntervalModal"
        @did-dismiss="showStartIntervalModal = false"
      >
        <ion-header>
          <ion-toolbar>
            <ion-title>Start Interval Workout</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="showStartIntervalModal = false">Cancel</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <IntervalWorkoutConfig
            ref="intervalConfigRef"
            @start="handleStartIntervalWorkout"
            @cancel="showStartIntervalModal = false"
            @open-exercise-selector="openIntervalExerciseSelector"
          />
        </ion-content>
      </ion-modal>

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
          <div class="button-group">
            <AppButton expand="block" @click="handleFinishWorkout">
              Finish
            </AppButton>
            <AppButton
              expand="block"
              fill="outline"
              @click="showFinishModal = false"
            >
              Cancel
            </AppButton>
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonModal,
} from "@ionic/vue";
import { useWorkout } from "@/features/workouts/composables/useWorkout";
import type { Exercise } from "@/features/exercises/types/exercise.types";
import type { Workout, WorkoutStatistics } from "@/features/workouts/types/workout.types";
import type { IntervalConfig } from "@/features/workouts/types/interval.types";
import { useExerciseLibrary } from "@/features/exercises/composables/useExerciseLibrary";
import WorkoutStartButtons from "@/features/workouts/components/WorkoutStartButtons.vue";
import RegularWorkoutView from "@/features/workouts/components/RegularWorkoutView.vue";
import IntervalWorkoutView from "@/features/workouts/components/IntervalWorkoutView.vue";
import IntervalWorkoutConfig from "@/features/workouts/components/IntervalWorkoutConfig.vue";
import WorkoutCompletedScreen from "@/features/workouts/components/WorkoutCompletedScreen.vue";
import ExerciseSelector from "@/features/exercises/components/ExerciseSelector.vue";
import AppButton from "@/components/atoms/AppButton.vue";
import FormField from "@/components/molecules/FormField.vue";

const {
  currentWorkout,
  statistics,
  loadActiveWorkout,
  createRegularWorkout,
  createIntervalWorkout,
  updateIntervalProgress,
  addExercise,
  addSet,
  updateSet,
  toggleSetCompleted,
  deleteSet,
  finishWorkout,
} = useWorkout();

const { exercises, loadExercises } = useExerciseLibrary();

// Modal states
const showExerciseModal = ref(false);
const showFinishModal = ref(false);
const showStartRegularModal = ref(false);
const showStartIntervalModal = ref(false);
const newWorkoutName = ref("");
const intervalConfigRef = ref<InstanceType<typeof IntervalWorkoutConfig> | null>(null);

// Completed workout state
const completedWorkout = ref<Workout | null>(null);
const completedStats = ref<WorkoutStatistics | null>(null);

// Workout state machine
const workoutState = computed<'empty' | 'active' | 'completed'>(() => {
  if (completedWorkout.value) return 'completed';
  if (currentWorkout.value) return 'active';
  return 'empty';
});

onMounted(async () => {
  await loadActiveWorkout();
  await loadExercises();
});

// Regular Workout Handlers
function handleStartRegular() {
  newWorkoutName.value = `Workout - ${new Date().toLocaleDateString()}`;
  showStartRegularModal.value = true;
}

async function handleStartRegularWorkout() {
  if (!newWorkoutName.value.trim()) return;
  await createRegularWorkout(newWorkoutName.value);
  newWorkoutName.value = "";
  showStartRegularModal.value = false;
}

// Interval Workout Handlers
function handleStartInterval() {
  showStartIntervalModal.value = true;
}

async function handleStartIntervalWorkout(config: {
  name: string
  workDuration: number
  restDuration: number
  rounds: number
  exercises: any[]
}) {
  const intervalConfig: IntervalConfig = {
    workDuration: config.workDuration,
    restDuration: config.restDuration,
    rounds: config.rounds,
    exercises: config.exercises,
    autoAdvance: true
  };
  
  await createIntervalWorkout(config.name, intervalConfig);
  showStartIntervalModal.value = false;
}

function openIntervalExerciseSelector() {
  showExerciseModal.value = true;
}

function handleUpdateIntervalProgress(progress: any) {
  updateIntervalProgress(progress);
}

function handleAddExercise(exercise: Exercise) {
  if (showStartIntervalModal.value && intervalConfigRef.value) {
    // Adding exercise to interval config
    intervalConfigRef.value.addExercise({
      exerciseId: exercise.exerciseId,
      name: exercise.name
    });
  } else {
    // Adding exercise to regular workout
    addExercise(exercise.exerciseId, exercise.name);
  }
  showExerciseModal.value = false;
}

function handleAddSet(exerciseId: string, setData: any) {
  addSet(exerciseId, setData);
}

function handleUpdateSet(exerciseId: string, setId: string, updates: any) {
  updateSet(exerciseId, setId, updates);
}

function handleToggleCompleted(exerciseId: string, setId: string) {
  toggleSetCompleted(exerciseId, setId);
}

function handleDeleteSet(exerciseId: string, setId: string) {
  deleteSet(exerciseId, setId);
}

async function handleFinishWorkout() {
  try {
    // Save completed workout data before finishing
    // Deep clone to remove Vue reactivity
    if (currentWorkout.value && statistics.value) {
      completedWorkout.value = JSON.parse(JSON.stringify(currentWorkout.value));
      completedStats.value = JSON.parse(JSON.stringify(statistics.value));
    }
    
    await finishWorkout();
    showFinishModal.value = false;
  } catch (error) {
    console.error("Failed to finish workout:", error);
  }
}

async function handleCompletedDone(notes: string) {
  // Save notes if provided
  if (completedWorkout.value && notes) {
    completedWorkout.value.notes = notes;
    // TODO: Save notes to workout history
  }
  
  // Clear completed workout state
  completedWorkout.value = null;
  completedStats.value = null;
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

.button-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}
</style>
