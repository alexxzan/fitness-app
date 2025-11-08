<template>
  <transition
    :css="false"
    @enter="onEnterTransition"
    @leave="onLeaveTransition"
    appear
  >
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
            <ion-button
              v-if="
                currentWorkout &&
                workoutState === 'active' &&
                currentWorkout?.type !== 'cardio-gps' &&
                currentWorkout?.type !== 'cardio-manual'
              "
              @click="showFinishModal = true"
            >
              Finish
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content :fullscreen="true">
        <!-- Cardio Workout View -->
        <ActiveCardioWorkout
          v-if="
            workoutState === 'active' &&
            (currentWorkout?.type === 'cardio-gps' ||
              currentWorkout?.type === 'cardio-manual')
          "
        />

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
          @replace-exercise="handleReplaceExercise"
          @delete-exercise="handleDeleteExercise"
          @link-superset="handleLinkSuperset"
          @unlink-superset="handleUnlinkSuperset"
          @reorder-exercises="handleReorderExercises"
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
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { createAnimation } from "@ionic/vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
} from "@ionic/vue";
import AlertDialog from "@/components/molecules/AlertDialog.vue";
import { useAlert } from "@/shared/composables/useAlert";
import { useWorkout } from "@/features/workouts/composables/useWorkout";
import type { Exercise } from "@/features/exercises/types/exercise.types";
import type {
  Workout,
  WorkoutStatistics,
} from "@/features/workouts/types/workout.types";
import { useExerciseLibrary } from "@/features/exercises/composables/useExerciseLibrary";
import RegularWorkoutView from "@/features/workouts/components/active/RegularWorkoutView.vue";
import IntervalWorkoutView from "@/features/workouts/components/active/IntervalWorkoutView.vue";
import WorkoutCompletedScreen from "@/features/workouts/components/active/WorkoutCompletedScreen.vue";
import ExerciseSelectorModal from "@/features/workouts/components/selection/ExerciseSelectorModal.vue";
import SupersetSelectorModal from "@/features/workouts/components/selection/SupersetSelectorModal.vue";
import FinishWorkoutModal from "@/features/workouts/components/completion/FinishWorkoutModal.vue";
import ActiveCardioWorkout from "@/features/cardio/components/active/ActiveCardioWorkout.vue";

const router = useRouter();

const {
  currentWorkout,
  statistics,
  hasRoutineChanges,
  loadActiveWorkout,
  updateIntervalProgress,
  addExercise,
  addSet,
  updateSet,
  toggleSetCompleted,
  deleteSet,
  replaceExercise,
  linkExercisesAsSuperset,
  unlinkSuperset,
  removeExercise,
  reorderExercises,
  saveWorkoutChangesToRoutine,
  finishWorkout,
  discardWorkout,
} = useWorkout();

const { exercises, loadExercises } = useExerciseLibrary();

// Modal states
const showExerciseModal = ref(false);
const showFinishModal = ref(false);
const showSupersetSelectorModal = ref(false);
const exerciseToReplaceId = ref<string | null>(null);
const exerciseToLinkId = ref<string | null>(null);

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

// Workout state machine
const workoutState = computed<"active" | "completed">(() => {
  if (completedWorkout.value) return "completed";
  if (currentWorkout.value) return "active";
  return "active"; // Default to active if no workout (shouldn't happen)
});

onMounted(async () => {
  await loadActiveWorkout();
  await loadExercises();

  // If no active workout and no completed workout to show, redirect to regular workout page
  // (Don't redirect if we're showing a completion screen)
  if (!currentWorkout.value && !completedWorkout.value) {
    router.replace("/workout");
  }
});

function handleAddExercise(exercise: Exercise) {
  if (exerciseToReplaceId.value) {
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

function handleUnlinkSuperset(exerciseId: string) {
  try {
    unlinkSuperset(exerciseId);
  } catch (error) {
    console.error("Failed to unlink superset:", error);
    showAlert({
      header: "Failed to Unlink Superset",
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while unlinking the superset.",
      buttons: [{ text: "OK", role: "confirm" }],
    });
  }
}

function handleSelectSupersetExercise(targetExerciseId: string) {
  if (exerciseToLinkId.value) {
    linkExercisesAsSuperset(exerciseToLinkId.value, targetExerciseId);
    exerciseToLinkId.value = null;
  }
}

function handleReorderExercises(newOrder: string[]) {
  reorderExercises(newOrder);
}

function handleUpdateIntervalProgress(progress: any) {
  updateIntervalProgress(progress);
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

    // Save completed workout data BEFORE finishing (so we have the data before currentWorkout is cleared)
    // Deep clone to remove Vue reactivity
    if (currentWorkout.value && statistics.value) {
      completedWorkout.value = JSON.parse(JSON.stringify(currentWorkout.value));
      completedStats.value = JSON.parse(JSON.stringify(statistics.value));
    }

    await finishWorkout();
    console.log("Workout finished successfully");
    showFinishModal.value = false;

    // Don't redirect here - let the WorkoutCompletedScreen show
    // The redirect will happen when user clicks "Done" in handleCompletedDone
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
        router.replace("/workout");
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

  // Redirect to regular workout page after clearing state
  router.replace("/workout");
}

// Ionic native transition animations
function onEnterTransition(el: Element, done: () => void) {
  const animation = createAnimation()
    .addElement(el)
    .duration(300)
    .easing("cubic-bezier(0.25, 0.46, 0.45, 0.94)")
    .fromTo("transform", "translateY(100%)", "translateY(0%)")
    .fromTo("opacity", "0", "1")
    .onFinish(() => done());

  animation.play();
}

function onLeaveTransition(el: Element, done: () => void) {
  const animation = createAnimation()
    .addElement(el)
    .duration(250)
    .easing("cubic-bezier(0.55, 0.06, 0.68, 0.19)")
    .fromTo("transform", "translateY(0%)", "translateY(100%)")
    .fromTo("opacity", "1", "0")
    .onFinish(() => done());

  animation.play();
}
</script>

<style scoped>
/* Full-screen workout page - no additional styles needed */
</style>
