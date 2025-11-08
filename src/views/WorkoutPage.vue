<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button
            v-if="
              currentWorkout &&
              workoutState === 'active' &&
              currentWorkout?.type === 'regular'
            "
            @click="handleCancelWorkout"
            color="danger"
          >
            Cancel
          </ion-button>
        </ion-buttons>
        <ion-title>Workout</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleToggleTheme">
            <ion-icon :icon="isDark ? sunny : moon" slot="icon-only" />
          </ion-button>
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
          <WorkoutStatsDashboard
            :total-workouts="stats.totalWorkouts"
            :total-volume="stats.totalVolume"
            :current-streak="stats.currentStreak"
            :this-week-workouts="stats.thisWeekWorkouts"
          />

          <!-- Recent Workouts -->
          <RecentWorkoutsSection
            :workouts="recentWorkouts"
            @view-all="handleViewAllWorkouts"
            @workout-click="handleWorkoutClick"
            @repeat-workout="handleRepeatWorkout"
          />

          <!-- My Workout Programs -->
          <MyWorkoutProgramsSection
            :programs="enabledPrograms"
            @add-program="showAddProgramModal = true"
            @start-workout="handleStartWorkoutFromProgram"
            @remove-program="handleRemoveProgram"
            @rename-program="handleRenameProgram"
            @copy-program="handleCopyProgram"
          />

          <!-- Quick Start Buttons -->
          <WorkoutStartButtons
            @start-regular="handleStartRegular"
            @start-interval="handleStartInterval"
          />

          <!-- Exercises -->
          <ExercisesSection />
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
        @replace-exercise="handleReplaceExercise"
        @delete-exercise="handleDeleteExercise"
        @link-superset="handleLinkSuperset"
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
        :title="exerciseToReplaceId ? 'Replace Exercise' : 'Add Exercise'"
        @select="handleAddExercise"
        @close="
          () => {
            showExerciseModal = false;
            exerciseToReplaceId = null;
          }
        "
      />

      <!-- Superset Selector Modal -->
      <SupersetSelectorModal
        :is-open="showSupersetSelectorModal"
        :exercises="currentWorkout?.exercises || []"
        :current-exercise-id="exerciseToLinkId || ''"
        @select="handleSelectSupersetExercise"
        @close="
          () => {
            showSupersetSelectorModal = false;
            exerciseToLinkId = null;
          }
        "
      />

      <!-- Finish Workout Modal -->
      <FinishWorkoutModal
        :is-open="showFinishModal"
        :has-routine-changes="hasRoutineChanges"
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

      <!-- Add Program Modal -->
      <AddProgramModal
        :is-open="showAddProgramModal"
        @close="showAddProgramModal = false"
        @select-template="handleAddProgramFromTemplate"
        @create-custom="handleCreateCustomProgram"
      />

      <!-- Create Custom Program Modal -->
      <CreateCustomProgramModal
        :is-open="showCreateCustomProgramModal"
        :exercises="exercises"
        @save="handleSaveCustomProgram"
        @close="showCreateCustomProgramModal = false"
      />

      <!-- Cancel Workout Alert -->
      <AlertDialog
        :is-open="showCancelAlert"
        :header="alertOptions.header"
        :message="alertOptions.message"
        :buttons="alertOptions.buttons"
        @dismiss="showCancelAlert = false"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
} from "@ionic/vue";
import AlertDialog from "@/components/molecules/AlertDialog.vue";
import { useAlert } from "@/shared/composables/useAlert";
import { close, moon, sunny } from "ionicons/icons";
import { useWorkout } from "@/features/workouts/composables/useWorkout";
import { useRoutine } from "@/features/workouts/composables/useRoutine";
import { useProgram } from "@/features/workouts/composables/useProgram";
import { useTheme } from "@/shared/composables/useTheme";
import type { Exercise } from "@/features/exercises/types/exercise.types";
import type {
  Workout,
  WorkoutStatistics,
  WorkoutTemplate,
} from "@/features/workouts/types/workout.types";
import type { IntervalConfig } from "@/features/workouts/types/interval.types";
import { useExerciseLibrary } from "@/features/exercises/composables/useExerciseLibrary";
import WorkoutStartButtons from "@/features/workouts/components/start/WorkoutStartButtons.vue";
import RegularWorkoutView from "@/features/workouts/components/active/RegularWorkoutView.vue";
import IntervalWorkoutView from "@/features/workouts/components/active/IntervalWorkoutView.vue";
import WorkoutCompletedScreen from "@/features/workouts/components/active/WorkoutCompletedScreen.vue";
import StartRegularWorkoutModal from "@/features/workouts/components/start/StartRegularWorkoutModal.vue";
import StartIntervalWorkoutModal from "@/features/workouts/components/start/StartIntervalWorkoutModal.vue";
import ExerciseSelectorModal from "@/features/workouts/components/selection/ExerciseSelectorModal.vue";
import SupersetSelectorModal from "@/features/workouts/components/selection/SupersetSelectorModal.vue";
import FinishWorkoutModal from "@/features/workouts/components/completion/FinishWorkoutModal.vue";
import RoutineSelector from "@/features/workouts/components/routines/RoutineSelector.vue";
import WorkoutStatsDashboard from "@/features/workouts/components/dashboard/WorkoutStatsDashboard.vue";
import RecentWorkoutsSection from "@/features/workouts/components/dashboard/RecentWorkoutsSection.vue";
import { useWorkoutCelebration } from "@/features/workouts/composables/useWorkoutCelebration";
import ActiveWorkoutResumeCard from "@/features/workouts/components/dashboard/ActiveWorkoutResumeCard.vue";
import ExercisesSection from "@/features/workouts/components/dashboard/ExercisesSection.vue";
import MyWorkoutProgramsSection from "@/features/workouts/components/dashboard/MyWorkoutProgramsSection.vue";
import AddProgramModal from "@/features/workouts/components/programs/AddProgramModal.vue";
import CreateCustomProgramModal from "@/features/workouts/components/programs/CreateCustomProgramModal.vue";
import type { WorkoutRoutine } from "@/features/workouts/types/workout.types";
import { WorkoutRepository } from "@/features/workouts/repositories/workout.repository";

const router = useRouter();

const {
  currentWorkout,
  statistics,
  hasRoutineChanges,
  loadActiveWorkout,
  createRegularWorkout,
  createIntervalWorkout,
  createWorkoutFromRoutine,
  repeatWorkout,
  updateIntervalProgress,
  addExercise,
  addSet,
  updateSet,
  toggleSetCompleted,
  deleteSet,
  replaceExercise,
  linkExercisesAsSuperset,
  removeExercise,
  saveWorkoutChangesToRoutine,
  finishWorkout,
  discardWorkout,
} = useWorkout();

const { exercises, loadExercises } = useExerciseLibrary();
const { createRoutineFromTemplate } = useRoutine();
const {
  programs,
  enabledPrograms,
  loadPrograms,
  getProgramById,
  createProgramFromTemplate,
  createCustomProgram,
  deleteProgram,
  renameProgram,
  copyProgram,
} = useProgram();
const { isDark, toggleTheme } = useTheme();

// Modal states
const showExerciseModal = ref(false);
const showFinishModal = ref(false);
const showStartRegularModal = ref(false);
const showStartIntervalModal = ref(false);
const showRoutineSelector = ref(false);
const showAddProgramModal = ref(false);
const showCreateCustomProgramModal = ref(false);
const showSupersetSelectorModal = ref(false);
const exerciseToReplaceId = ref<string | null>(null);
const exerciseToLinkId = ref<string | null>(null);
const intervalModalRef = ref<InstanceType<
  typeof StartIntervalWorkoutModal
> | null>(null);

// Alert dialog
const {
  isOpen: showCancelAlert,
  alertOptions,
  showDestructiveConfirm,
  showAlert,
} = useAlert();

// Completed workout state
const completedWorkout = ref<Workout | null>(null);
const completedStats = ref<WorkoutStatistics | null>(null);

// Real data for empty state
const recentWorkouts = ref<Workout[]>([]);

// Workout stats
const {
  loadWorkoutHistory,
  calculateWorkoutCount,
  calculateTotalVolume,
  calculateStreak,
  getWeeklyStats,
} = useWorkoutCelebration();

const stats = ref({
  totalWorkouts: 0,
  totalVolume: 0,
  currentStreak: 0,
  thisWeekWorkouts: 0,
});

// Workout state machine
const workoutState = computed<"empty" | "active" | "completed">(() => {
  if (completedWorkout.value) return "completed";
  if (currentWorkout.value) return "active";
  return "empty";
});

async function loadRecentWorkouts() {
  try {
    recentWorkouts.value = await WorkoutRepository.getRecentWorkouts(10);
  } catch (error) {
    console.error("Failed to load recent workouts:", error);
    recentWorkouts.value = [];
  }
}

async function loadWorkoutStats() {
  try {
    await loadWorkoutHistory();
    stats.value = {
      totalWorkouts: calculateWorkoutCount(),
      totalVolume: Math.round(calculateTotalVolume()),
      currentStreak: calculateStreak(),
      thisWeekWorkouts: getWeeklyStats(),
    };
  } catch (error) {
    console.error("Failed to load workout stats:", error);
    // Keep default values (0)
  }
}

onMounted(async () => {
  await loadActiveWorkout();
  await loadExercises();
  await loadPrograms();
  await loadRecentWorkouts();
  await loadWorkoutStats();

  // If active workout exists, redirect to full-screen workout page
  if (currentWorkout.value) {
    router.replace("/active-workout");
  }
});

// Watch for workout creation and navigate to full-screen page
watch(
  () => currentWorkout.value,
  (newWorkout) => {
    if (newWorkout && workoutState.value === "active") {
      router.replace("/active-workout");
    }
  }
);

// Routine Handlers
function handleStartFromRoutine() {
  showRoutineSelector.value = true;
}

async function handleSelectRoutine(routine: any) {
  await createWorkoutFromRoutine(routine);
  showRoutineSelector.value = false;
  // Navigation to full-screen page will happen via watch on currentWorkout
}

async function handleSelectTemplate(template: any) {
  // Create routine from template, then start workout
  const routine = await createRoutineFromTemplate(template);
  await createWorkoutFromRoutine(routine);
  showRoutineSelector.value = false;
  // Navigation to full-screen page will happen via watch on currentWorkout
}

// Program Handlers
async function handleAddProgramFromTemplate(template: WorkoutTemplate) {
  try {
    await createProgramFromTemplate(template);
    showAddProgramModal.value = false;
  } catch (error) {
    console.error("Failed to add program:", error);
    showAlert({
      header: "Error",
      message: "Failed to add program. Please try again.",
      buttons: [{ text: "OK", role: "confirm" }],
    });
  }
}

function handleCreateCustomProgram() {
  showAddProgramModal.value = false;
  showCreateCustomProgramModal.value = true;
}

async function handleSaveCustomProgram(data: {
  name: string;
  description?: string;
  routines: WorkoutRoutine[];
}) {
  try {
    await createCustomProgram(data.name, data.description, data.routines);
    showCreateCustomProgramModal.value = false;
  } catch (error) {
    console.error("Failed to create custom program:", error);
    showAlert({
      header: "Error",
      message:
        error instanceof Error
          ? error.message
          : "Failed to create custom program. Please try again.",
      buttons: [{ text: "OK", role: "confirm" }],
    });
  }
}

async function handleStartWorkoutFromProgram(
  routine: WorkoutRoutine,
  programId: string
) {
  // Fetch fresh program data from database to ensure we use the latest routine
  // This prevents using stale cached data after a save
  const freshProgram = await getProgramById(programId);
  if (!freshProgram) {
    return;
  }

  // Find the routine in the fresh program data
  const freshRoutine = freshProgram.workouts.find((r) => r.id === routine.id);
  if (!freshRoutine) {
    // Fallback to using the passed routine if fresh data not found
    await createWorkoutFromRoutine(routine, programId);
    return;
  }

  await createWorkoutFromRoutine(freshRoutine, programId);
  // Navigation to full-screen page will happen via watch on currentWorkout
}

async function handleRemoveProgram(program: any) {
  await deleteProgram(program.id);
}

async function handleRenameProgram(program: any) {
  // TODO: Replace with a proper input dialog component
  // For now, using a simple prompt as a workaround
  const newName = window.prompt("Rename Program", program.name);
  if (newName && newName.trim().length > 0) {
    try {
      await renameProgram(program.id, newName.trim());
    } catch (error) {
      console.error("Failed to rename program:", error);
      showAlert({
        header: "Error",
        message: "Failed to rename program. Please try again.",
        buttons: [{ text: "OK", role: "confirm" }],
      });
    }
  }
}

async function handleCopyProgram(program: any) {
  try {
    await copyProgram(program);
  } catch (error) {
    console.error("Failed to copy program:", error);
  }
}

// Regular Workout Handlers
function handleStartRegular() {
  showStartRegularModal.value = true;
}

async function handleStartRegularWorkout(name: string) {
  await createRegularWorkout(name);
  showStartRegularModal.value = false;
  // Navigation to full-screen page will happen via watch on currentWorkout
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
  // Navigation to full-screen page will happen via watch on currentWorkout
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
  } else if (exerciseToReplaceId.value) {
    // Replacing an exercise
    replaceExercise(
      exerciseToReplaceId.value,
      exercise.exerciseId,
      exercise.name
    );
    exerciseToReplaceId.value = null;
  } else {
    // Adding exercise to regular workout
    addExercise(exercise.exerciseId, exercise.name);
  }
  showExerciseModal.value = false;
}

function handleAddSet(exerciseId: string, setData: any) {
  // Ensure setType defaults to 'working' if not provided
  const setWithType = {
    ...setData,
    setType: setData.setType || "working",
  };
  addSet(exerciseId, setWithType);
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

function handleReplaceExercise(exerciseId: string) {
  exerciseToReplaceId.value = exerciseId;
  showExerciseModal.value = true;
}

function handleDeleteExercise(exerciseId: string) {
  removeExercise(exerciseId);
}

function handleLinkSuperset(exerciseId: string) {
  exerciseToLinkId.value = exerciseId;
  showSupersetSelectorModal.value = true;
}

function handleSelectSupersetExercise(targetExerciseId: string) {
  if (exerciseToLinkId.value) {
    linkExercisesAsSuperset(exerciseToLinkId.value, targetExerciseId);
    exerciseToLinkId.value = null;
  }
}

async function handleFinishWorkout(saveToRoutine?: boolean) {
  try {
    // Save to routine if requested
    if (saveToRoutine && hasRoutineChanges.value) {
      try {
        const saved = await saveWorkoutChangesToRoutine();
        if (!saved) {
          // Routine not found (may have been deleted)
          showAlert({
            header: "Couldn't Save to Routine",
            message:
              "The routine associated with this workout could not be found. It may have been deleted.",
            buttons: [{ text: "OK", role: "confirm" }],
          });
        }
      } catch (error) {
        console.error("Failed to save changes to routine:", error);
        // Show alert to user that routine save failed
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An error occurred while saving to the routine.";
        showAlert({
          header: "Couldn't Save to Routine",
          message: errorMessage,
          buttons: [{ text: "OK", role: "confirm" }],
        });
        // Continue with workout finish even if routine save fails
      }
    }

    // Save completed workout data before finishing
    // Deep clone to remove Vue reactivity
    if (currentWorkout.value && statistics.value) {
      completedWorkout.value = JSON.parse(JSON.stringify(currentWorkout.value));
      completedStats.value = JSON.parse(JSON.stringify(statistics.value));
    }

    await finishWorkout();
    console.log("Workout finished successfully");
    showFinishModal.value = false;
  } catch (error) {
    console.error("Failed to finish workout:", error);
    // Show error to user
    showAlert({
      header: "Failed to Complete Workout",
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while completing the workout.",
      buttons: [{ text: "OK", role: "confirm" }],
    });
  }
}

async function handleCancelWorkout() {
  showDestructiveConfirm({
    header: "Cancel Workout",
    message:
      "Are you sure you want to cancel this workout? All progress will be lost.",
    confirmText: "Cancel Workout",
    cancelText: "Keep Working Out",
    onConfirm: async () => {
      try {
        await discardWorkout();
      } catch (error) {
        console.error("Failed to cancel workout:", error);
      }
    },
  });
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

  // Refresh recent workouts and stats to show the newly completed workout
  await loadRecentWorkouts();
  await loadWorkoutStats();
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

async function handleRepeatWorkout(workout: Workout) {
  try {
    await repeatWorkout(workout);
    // Navigation to full-screen page will happen via watch on currentWorkout
  } catch (error) {
    console.error("Failed to repeat workout:", error);
  }
}

async function handleToggleTheme() {
  await toggleTheme();
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
