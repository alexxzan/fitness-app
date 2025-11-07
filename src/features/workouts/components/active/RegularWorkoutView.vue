<template>
  <div class="regular-workout-view">
    <div class="workout-header">
      <div class="header-content">
        <div class="workout-info">
          <h2 class="workout-name">{{ workout.name }}</h2>
          <div class="quick-stats" v-if="statistics">
            <span>{{ statistics.totalSets }} sets</span>
            <span v-if="statistics.totalVolume > 0"
              >{{ Math.round(statistics.totalVolume) }}kg</span
            >
          </div>
        </div>
        <WorkoutTimer :start-time="workout.startTime" :is-active="true" />
      </div>
    </div>

    <div class="workout-container">
      <ion-list>
        <ion-reorder-group
          :disabled="!isReordering"
          @ionReorderStart="handleIonReorderStart"
          @ionReorderEnd="handleReorderEnd"
        >
          <ion-item
            v-for="exercise in sortedExercises"
            :key="exercise.id"
            :ref="(el) => setExerciseItemRef(exercise.id, el)"
            :data-exercise-id="exercise.id"
            class="exercise-item"
          >
            <ExerciseSetTable
              :exercise="exercise"
              :all-exercises="workout.exercises"
              :previous-performance="previousPerformances[exercise.exerciseId]"
              :is-collapsed="collapseStates[exercise.id] ?? false"
              :is-reordering="isReordering"
              @update:collapsed="(value) => updateCollapseState(exercise.id, value)"
              @add-set="handleAddSet(exercise.id)"
              @update-set="
                (setId, field, value) =>
                  handleUpdateSet(exercise.id, { setId, field, value })
              "
              @toggle-completed="(setId) => handleToggleCompleted(exercise.id, setId)"
              @delete-set="(setId) => handleDeleteSet(exercise.id, setId)"
              @start-rest-timer="handleStartRestTimer"
              @replace-exercise="() => emit('replaceExercise', exercise.id)"
              @delete-exercise="() => emit('deleteExercise', exercise.id)"
              @link-superset="() => emit('linkSuperset', exercise.id)"
              @unlink-superset="() => emit('unlinkSuperset', exercise.id)"
              @long-press="handleLongPress"
            />
          </ion-item>
        </ion-reorder-group>
      </ion-list>

      <!-- Add Exercise Button -->
      <button class="add-exercise-button" @click="emit('addExercise')">
        <ion-icon :icon="add" />
        <span>Add Exercise</span>
      </button>
    </div>

    <!-- Rest Timer -->
    <RestTimerBottom
      :is-active="restTimer.isActive && !props.workout.endTime"
      :time-remaining="restTimer.timeRemaining"
      :exercise-name="restTimer.exerciseName"
      @adjust-time="handleAdjustRestTime"
      @skip="handleSkipRest"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch, computed, nextTick } from "vue";
import { IonIcon, IonList, IonReorderGroup, IonReorder, IonItem } from "@ionic/vue";
import { add } from "ionicons/icons";
import ExerciseSetTable from "../tracking/ExerciseSetTable.vue";
import WorkoutTimer from "../tracking/WorkoutTimer.vue";
import RestTimerBottom from "../tracking/RestTimerBottom.vue";
import type { Workout, WorkoutStatistics } from "../../types/workout.types";
import { usePreviousExercisePerformance } from "../../composables/usePreviousExercisePerformance";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

interface Props {
  workout: Workout;
  statistics: WorkoutStatistics | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  addExercise: [];
  addSet: [exerciseId: string, setData: any];
  updateSet: [exerciseId: string, setId: string, updates: any];
  toggleCompleted: [exerciseId: string, setId: string];
  deleteSet: [exerciseId: string, setId: string];
  replaceExercise: [exerciseId: string];
  deleteExercise: [exerciseId: string];
  linkSuperset: [exerciseId: string];
  unlinkSuperset: [exerciseId: string];
  reorderExercises: [newOrder: string[]];
}>();

const { loadWorkoutHistory, getPreviousPerformances } =
  usePreviousExercisePerformance();
const previousPerformances = ref<Record<string, any>>({});

// Reorder state
const isReordering = ref(false);
const collapseStates = reactive<Record<string, boolean>>({});
const previousCollapseStates = ref<Record<string, boolean>>({});
const longPressedExerciseId = ref<string | null>(null);
const exerciseItemRefs = ref<Record<string, any>>({});

// Sort exercises by order property
const sortedExercises = computed(() => {
  return [...props.workout.exercises].sort((a, b) => a.order - b.order);
});

// Rest timer state
const restTimer = reactive<{
  isActive: boolean;
  timeRemaining: number;
  exerciseName: string;
  intervalId?: number;
}>({
  isActive: false,
  timeRemaining: 0,
  exerciseName: "",
});

// Load workout history and get previous performances
// Force reload to ensure we get the most recent completed workouts
onMounted(async () => {
  await loadWorkoutHistory(true);
  updatePreviousPerformances();
});

// Reload history when workout ID changes (new workout started)
watch(
  () => props.workout.id,
  async (newId, oldId) => {
    // If this is a new workout (different ID), reload history to get latest completed workouts
    if (newId && newId !== oldId) {
      await loadWorkoutHistory(true);
      updatePreviousPerformances();
    }
  }
);

// Update previous performances when exercises change
watch(
  () => props.workout.exercises,
  () => {
    updatePreviousPerformances();
  },
  { deep: true }
);

function updatePreviousPerformances() {
  const exerciseIds = props.workout.exercises.map((ex) => ex.exerciseId);
  previousPerformances.value = getPreviousPerformances(exerciseIds);
}

function handleAddSet(exerciseId: string) {
  const exercise = props.workout.exercises.find((ex) => ex.id === exerciseId);
  if (!exercise) return;

  // Copy the last set's values, or use defaults
  const lastSet = exercise.sets[exercise.sets.length - 1];

  emit("addSet", exerciseId, {
    reps: lastSet?.reps,
    weight: lastSet?.weight,
    restTime: lastSet?.restTime,
    setType: lastSet?.setType || "working",
  });
}

function handleUpdateSet(
  exerciseId: string,
  payload: { setId: string; field: string; value: number | string | null }
) {
  emit("updateSet", exerciseId, payload.setId, {
    [payload.field]: payload.value,
  });
}

function handleToggleCompleted(exerciseId: string, setId: string) {
  emit("toggleCompleted", exerciseId, setId);
}

function handleDeleteSet(exerciseId: string, setId: string) {
  emit("deleteSet", exerciseId, setId);
}

function handleStartRestTimer(exerciseName: string, duration: number) {
  // Stop any existing timer
  if (restTimer.intervalId) {
    clearInterval(restTimer.intervalId);
  }

  restTimer.isActive = true;
  restTimer.timeRemaining = duration;
  restTimer.exerciseName = exerciseName;

  // Start countdown
  restTimer.intervalId = window.setInterval(() => {
    if (restTimer.timeRemaining > 0) {
      restTimer.timeRemaining--;
    } else {
      stopRestTimer();
      try {
        Haptics.impact({ style: ImpactStyle.Heavy });
      } catch (error) {
        // Haptics not available
      }
    }
  }, 1000);
}

function handleAdjustRestTime(delta: number) {
  restTimer.timeRemaining = Math.max(0, restTimer.timeRemaining + delta);
}

function handleSkipRest() {
  stopRestTimer();
}

function stopRestTimer() {
  if (restTimer.intervalId) {
    clearInterval(restTimer.intervalId);
    restTimer.intervalId = undefined;
  }
  restTimer.isActive = false;
  restTimer.timeRemaining = 0;
  restTimer.exerciseName = "";
}

// Watch for workout changes to stop timer if workout is being completed
watch(
  () => props.workout,
  () => {
    // Stop timer if workout is being completed (endTime is set)
    if (props.workout.endTime) {
      stopRestTimer();
    }
  },
  { deep: true }
);

function setExerciseItemRef(exerciseId: string, el: any) {
  if (el) {
    exerciseItemRefs.value[exerciseId] = el;
  }
}

// Reorder handlers
function handleReorderStart(exerciseId: string) {
  // Store the long-pressed exercise ID
  longPressedExerciseId.value = exerciseId;
  
  // Store current collapse states for ALL exercises
  // This ensures we know which were expanded (false) vs collapsed (true)
  previousCollapseStates.value = {};
  props.workout.exercises.forEach((exercise) => {
    // Store the current state (true if collapsed, false if expanded)
    // If not set, default to false (expanded)
    previousCollapseStates.value[exercise.id] = collapseStates[exercise.id] ?? false;
  });
  
  // Collapse all exercises during reorder
  props.workout.exercises.forEach((exercise) => {
    collapseStates[exercise.id] = true;
  });
  
  isReordering.value = true;
  
  // Scroll to the long-pressed exercise after collapsing
  // Wait for DOM updates and collapse animations
  nextTick(() => {
    setTimeout(() => {
      if (longPressedExerciseId.value) {
        // Find element using data attribute (most reliable)
        const element = document.querySelector(
          `[data-exercise-id="${longPressedExerciseId.value}"]`
        ) as HTMLElement;
        
        if (element) {
          // Find the ion-content scroll container
          const scrollContainer = element.closest('ion-content');
          
          if (scrollContainer) {
            // Get the scroll element from ion-content
            const scrollElement = (scrollContainer as any).$el?.querySelector('.inner-scroll') ||
                                 scrollContainer.shadowRoot?.querySelector('.inner-scroll');
            
            if (scrollElement) {
              // Calculate scroll position to center the element
              const elementRect = element.getBoundingClientRect();
              const containerRect = scrollElement.getBoundingClientRect();
              const currentScrollTop = scrollElement.scrollTop;
              
              // Position relative to scroll container
              const elementTop = elementRect.top - containerRect.top + currentScrollTop;
              const containerHeight = containerRect.clientHeight;
              const elementHeight = elementRect.height;
              
              // Center the element
              const targetScroll = elementTop - (containerHeight / 2) + (elementHeight / 2);
              
              scrollElement.scrollTo({
                top: Math.max(0, targetScroll),
                behavior: 'smooth'
              });
            } else {
              // Fallback: use native scrollIntoView
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          } else {
            // Fallback: use native scrollIntoView
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }
    }, 350); // Wait for collapse animations to complete
  });
}

function handleIonReorderStart() {
  // Trigger haptic feedback when user actually starts dragging
  // This is a direct user gesture event, so haptics will work
  triggerHaptic(ImpactStyle.Medium);
}

function handleReorderEnd(event: CustomEvent) {
  const { from, to, complete } = event.detail;
  
  // Get current exercise order
  const currentOrder = sortedExercises.value.map((ex) => ex.id);
  
  // Reorder the array
  const item = currentOrder[from];
  currentOrder.splice(from, 1);
  currentOrder.splice(to, 0, item);
  
  // Emit the reorder event to update the workout state
  emit("reorderExercises", currentOrder);
  
  // Complete the reorder - let Ionic handle DOM reordering
  // This ensures proper scroll behavior is maintained
  complete();
  
  // Wait for DOM updates before restoring collapse states
  nextTick(() => {
    // Restore previous collapse states for all exercises
    // Exercises that were expanded (false) will expand again
    // Exercises that were collapsed (true) will remain collapsed
    props.workout.exercises.forEach((exercise) => {
      const previousState = previousCollapseStates.value[exercise.id];
      // If state was stored, restore it; otherwise default to expanded (false)
      collapseStates[exercise.id] = previousState ?? false;
    });
    
    isReordering.value = false;
    previousCollapseStates.value = {};
    longPressedExerciseId.value = null;
    triggerHaptic(ImpactStyle.Light);
  });
}

function updateCollapseState(exerciseId: string, value: boolean) {
  if (!isReordering.value) {
    collapseStates[exerciseId] = value;
  }
}

function handleLongPress(exerciseId: string) {
  if (!isReordering.value) {
    handleReorderStart(exerciseId);
  }
}

function triggerHaptic(style: ImpactStyle = ImpactStyle.Light) {
  try {
    Haptics.impact({ style });
  } catch (error) {
    // Haptics not available (web), ignore
  }
}

// Cleanup on unmount
onUnmounted(() => {
  stopRestTimer();
});
</script>

<style scoped>
.regular-workout-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.workout-header {
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-background);
  border-bottom: var(--border-width-thin) solid var(--color-border);
  position: relative;
  z-index: 10;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.workout-info {
  flex: 1;
  min-width: 0;
}

.workout-name {
  font-size: var(--typography-h3-size);
  font-weight: var(--typography-h3-weight);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.quick-stats {
  display: flex;
  gap: var(--spacing-sm);
  font-size: var(--typography-small-size);
  color: var(--color-text-secondary);
}

.quick-stats span {
  display: inline-block;
}

.workout-container {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-xs);
  flex: 1;
  padding-bottom: 100px; /* Space for rest timer */
  min-height: 0; /* Allow flex child to shrink */
}

.workout-container ion-list {
  width: 100%;
  padding: 0;
}

.workout-container ion-list::part(container) {
  padding: 0;
}

.add-exercise-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-base);
  background: linear-gradient(
    135deg,
    var(--color-success-500) 0%,
    var(--color-success-600) 100%
  );
  color: white;
  font-weight: var(--typography-body-weight-semibold);
  font-size: var(--typography-body-size);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 56px;
  margin-top: var(--spacing-base);
  box-shadow: var(--shadow-card);
}

.add-exercise-button:hover {
  background: linear-gradient(
    135deg,
    var(--color-success-400) 0%,
    var(--color-success-500) 100%
  );
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.add-exercise-button ion-icon {
  font-size: 24px;
}

.exercise-item {
  --padding-start: 0;
  --padding-end: 0;
  --inner-padding-end: 0;
  --inner-padding-start: 0;
  --padding-top: 0;
  --padding-bottom: 0;
  width: 100%;
}

.exercise-item::part(native) {
  padding: 0;
  width: 100%;
}

.exercise-item .exercise-card {
  width: 100%;
  margin-bottom: var(--spacing-sm);
}
</style>
