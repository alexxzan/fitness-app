<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Workout</ion-title>
        <ion-buttons slot="end">
          <ion-button
            v-if="currentWorkout && workoutState === 'active'"
            @click="showFinishModal = true"
          >
            Finish
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <!-- Empty State -->
      <div v-if="workoutState === 'empty'" class="empty-state">
        <div class="empty-state-content">
          <!-- Active Workout Resume Card -->
          <ActiveWorkoutResumeCard
            :show="false"
            @resume="handleResumeWorkout"
          />

          <!-- Statistics Dashboard -->
          <WorkoutStatsDashboard />

          <!-- Recent Workouts -->
          <RecentWorkoutsSection
            :workouts="mockRecentWorkouts"
            @view-all="handleViewAllWorkouts"
            @workout-click="handleWorkoutClick"
            @repeat-workout="handleRepeatWorkout"
          />

          <!-- Quick Start Buttons -->
          <WorkoutStartButtons
            @start-from-routine="handleStartFromRoutine"
            @start-regular="handleStartRegular"
            @start-interval="handleStartInterval"
          />

          <!-- Favorite Routines -->
          <FavoriteRoutinesSection
            :routines="mockFavoriteRoutines"
            @start-routine="handleStartFromRoutineSelection"
          />
        </div>
      </div>

      <!-- Regular Workout View -->
      <RegularWorkoutView
        v-else-if="
          workoutState === 'active' && currentWorkout?.type === 'regular'
        "
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
        v-else-if="
          workoutState === 'active' && currentWorkout?.type === 'interval'
        "
        :workout="currentWorkout"
        @finish="showFinishModal = true"
        @update-progress="handleUpdateIntervalProgress"
      />

      <!-- Workout Completed View -->
      <WorkoutCompletedScreen
        v-else-if="
          workoutState === 'completed' && completedWorkout && completedStats
        "
        :workout="completedWorkout"
        :statistics="completedStats"
        @done="handleCompletedDone"
      />

      <!-- Regular Workout Start Modal -->
      <StartRegularWorkoutModal
        :is-open="showStartRegularModal"
        @start="handleStartRegularWorkout"
        @cancel="showStartRegularModal = false"
      />

      <!-- Interval Workout Config Modal -->
      <StartIntervalWorkoutModal
        :is-open="showStartIntervalModal"
        ref="intervalModalRef"
        @start="handleStartIntervalWorkout"
        @cancel="showStartIntervalModal = false"
        @open-exercise-selector="openIntervalExerciseSelector"
      />

      <!-- Exercise Selection Modal -->
      <ExerciseSelectorModal
        :is-open="showExerciseModal"
        :exercises="exercises"
        @select="handleAddExercise"
        @close="showExerciseModal = false"
      />

      <!-- Finish Workout Modal -->
      <FinishWorkoutModal
        :is-open="showFinishModal"
        @finish="handleFinishWorkout"
        @cancel="showFinishModal = false"
      />

      <!-- Routine Selector Modal -->
      <RoutineSelector
        :is-open="showRoutineSelector"
        @close="showRoutineSelector = false"
        @select-routine="handleSelectRoutine"
        @select-template="handleSelectTemplate"
      />
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
} from "@ionic/vue";
import { useWorkout } from "@/features/workouts/composables/useWorkout";
import { useRoutine } from "@/features/workouts/composables/useRoutine";
import type { Exercise } from "@/features/exercises/types/exercise.types";
import type {
  Workout,
  WorkoutStatistics,
} from "@/features/workouts/types/workout.types";
import type { IntervalConfig } from "@/features/workouts/types/interval.types";
import { useExerciseLibrary } from "@/features/exercises/composables/useExerciseLibrary";
import WorkoutStartButtons from "@/features/workouts/components/WorkoutStartButtons.vue";
import RegularWorkoutView from "@/features/workouts/components/RegularWorkoutView.vue";
import IntervalWorkoutView from "@/features/workouts/components/IntervalWorkoutView.vue";
import WorkoutCompletedScreen from "@/features/workouts/components/WorkoutCompletedScreen.vue";
import StartRegularWorkoutModal from "@/features/workouts/components/StartRegularWorkoutModal.vue";
import StartIntervalWorkoutModal from "@/features/workouts/components/StartIntervalWorkoutModal.vue";
import ExerciseSelectorModal from "@/features/workouts/components/ExerciseSelectorModal.vue";
import FinishWorkoutModal from "@/features/workouts/components/FinishWorkoutModal.vue";
import RoutineSelector from "@/features/workouts/components/RoutineSelector.vue";
import WorkoutStatsDashboard from "@/features/workouts/components/WorkoutStatsDashboard.vue";
import RecentWorkoutsSection from "@/features/workouts/components/RecentWorkoutsSection.vue";
import ActiveWorkoutResumeCard from "@/features/workouts/components/ActiveWorkoutResumeCard.vue";
import FavoriteRoutinesSection from "@/features/workouts/components/FavoriteRoutinesSection.vue";
import type { WorkoutRoutine } from "@/features/workouts/types/workout.types";

const {
  currentWorkout,
  statistics,
  loadActiveWorkout,
  createRegularWorkout,
  createIntervalWorkout,
  createWorkoutFromRoutine,
  updateIntervalProgress,
  addExercise,
  addSet,
  updateSet,
  toggleSetCompleted,
  deleteSet,
  finishWorkout,
} = useWorkout();

const { exercises, loadExercises } = useExerciseLibrary();
const { createRoutineFromTemplate } = useRoutine();

// Modal states
const showExerciseModal = ref(false);
const showFinishModal = ref(false);
const showStartRegularModal = ref(false);
const showStartIntervalModal = ref(false);
const showRoutineSelector = ref(false);
const intervalModalRef = ref<InstanceType<
  typeof StartIntervalWorkoutModal
> | null>(null);

// Completed workout state
const completedWorkout = ref<Workout | null>(null);
const completedStats = ref<WorkoutStatistics | null>(null);

// Mock data for empty state
const mockRecentWorkouts = ref<Workout[]>([
  {
    id: "mock-1",
    name: "Push Day",
    type: "regular",
    exercises: [
      {
        id: "ex-1",
        exerciseId: "1",
        exerciseName: "Bench Press",
        sets: [
          { id: "set-1", reps: 8, weight: 80, completed: true },
          { id: "set-2", reps: 8, weight: 80, completed: true },
          { id: "set-3", reps: 6, weight: 85, completed: true },
        ],
        order: 1,
      },
      {
        id: "ex-2",
        exerciseId: "2",
        exerciseName: "Overhead Press",
        sets: [
          { id: "set-4", reps: 10, weight: 50, completed: true },
          { id: "set-5", reps: 8, weight: 55, completed: true },
        ],
        order: 2,
      },
    ],
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(
      Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000
    ).toISOString(),
    completed: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-2",
    name: "Pull Day",
    type: "regular",
    exercises: [
      {
        id: "ex-3",
        exerciseId: "3",
        exerciseName: "Deadlift",
        sets: [
          { id: "set-6", reps: 5, weight: 140, completed: true },
          { id: "set-7", reps: 5, weight: 145, completed: true },
        ],
        order: 1,
      },
      {
        id: "ex-4",
        exerciseId: "4",
        exerciseName: "Pull-ups",
        sets: [
          { id: "set-8", reps: 10, completed: true },
          { id: "set-9", reps: 8, completed: true },
        ],
        order: 2,
      },
    ],
    startTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(
      Date.now() - 4 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000
    ).toISOString(),
    completed: true,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
]);

const mockFavoriteRoutines = ref<WorkoutRoutine[]>([
  {
    id: "routine-1",
    name: "Push Pull Legs",
    description: "Classic 3-day split for balanced muscle development",
    exercises: [],
    type: "custom",
    isFavorite: true,
    estimatedDuration: 60,
    difficulty: "intermediate",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "routine-2",
    name: "Full Body HIIT",
    description: "High-intensity interval training for full body conditioning",
    exercises: [],
    type: "custom",
    isFavorite: true,
    estimatedDuration: 30,
    difficulty: "advanced",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]);

// Workout state machine
const workoutState = computed<"empty" | "active" | "completed">(() => {
  if (completedWorkout.value) return "completed";
  if (currentWorkout.value) return "active";
  return "empty";
});

onMounted(async () => {
  await loadActiveWorkout();
  await loadExercises();
});

// Routine Handlers
function handleStartFromRoutine() {
  showRoutineSelector.value = true;
}

async function handleSelectRoutine(routine: any) {
  await createWorkoutFromRoutine(routine);
  showRoutineSelector.value = false;
}

async function handleSelectTemplate(template: any) {
  // Create routine from template, then start workout
  const routine = await createRoutineFromTemplate(template);
  await createWorkoutFromRoutine(routine);
  showRoutineSelector.value = false;
}

// Regular Workout Handlers
function handleStartRegular() {
  showStartRegularModal.value = true;
}

async function handleStartRegularWorkout(name: string) {
  await createRegularWorkout(name);
  showStartRegularModal.value = false;
}

// Interval Workout Handlers
function handleStartInterval() {
  showStartIntervalModal.value = true;
}

async function handleStartIntervalWorkout(config: {
  name: string;
  workDuration: number;
  restDuration: number;
  rounds: number;
  exercises: any[];
}) {
  const intervalConfig: IntervalConfig = {
    workDuration: config.workDuration,
    restDuration: config.restDuration,
    rounds: config.rounds,
    exercises: config.exercises,
    autoAdvance: true,
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
  if (showStartIntervalModal.value && intervalModalRef.value) {
    // Adding exercise to interval config
    intervalModalRef.value.addExercise({
      exerciseId: exercise.exerciseId,
      name: exercise.name,
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

// New empty state handlers
function handleResumeWorkout() {
  // TODO: Load and resume incomplete workout
  console.log("Resume workout");
}

function handleViewAllWorkouts() {
  // TODO: Navigate to workout history page
  console.log("View all workouts");
}

function handleWorkoutClick(workout: Workout) {
  // TODO: Navigate to workout detail or show workout info
  console.log("Workout clicked:", workout);
}

function handleRepeatWorkout(workout: Workout) {
  // TODO: Create new workout based on this one
  console.log("Repeat workout:", workout);
  // For now, open routine selector if it was from a routine
  if (workout.routineId || workout.routineTemplateId) {
    handleStartFromRoutine();
  } else {
    // Otherwise, just create a regular workout with same name
    createRegularWorkout(`${workout.name} (Repeat)`);
  }
}

function handleStartFromRoutineSelection(routine: WorkoutRoutine) {
  // Create workout from the selected routine
  createWorkoutFromRoutine(routine);
}
</script>

<style scoped>
.empty-state {
  height: 100%;
}

.empty-state-content {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-base) 0;
  gap: 0;
}
</style>
