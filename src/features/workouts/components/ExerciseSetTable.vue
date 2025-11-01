<template>
  <div class="exercise-set-table">
    <div class="exercise-header">
      <h3 class="exercise-name">{{ exercise.exerciseName }}</h3>
    </div>

    <div class="sets-container">
      <div
        v-for="(set, index) in exercise.sets"
        :key="set.id"
        class="set-card-wrapper"
      >
        <div
          class="swipeable-card-container"
          @touchstart="handleTouchStart($event, set.id)"
          @touchmove="handleTouchMove($event, set.id)"
          @touchend="handleTouchEnd($event, set.id)"
          @mousedown="handleMouseDown($event, set.id)"
          @mousemove="handleMouseMove($event, set.id)"
          @mouseup="handleMouseUp($event, set.id)"
          @mouseleave="handleMouseLeave($event, set.id)"
        >
          <div
            :class="{
              'swipeable-card': true,
              'set-card': true,
              'set-card--completed': set.completed,
            }"
            :style="getRowStyle(set.id)"
            @click="handleCardClick(set.id, $event)"
          >
            <div class="set-card-content">
              <!-- Set Number and Type -->
              <div class="set-header">
                <div class="set-number-section">
                  <button
                    v-if="!set.completed"
                    class="set-type-pill"
                    :class="`set-type-pill--${set.setType || 'working'}`"
                    @click.stop="
                      handleSetTypeClick(set.id, set.setType || 'working')
                    "
                  >
                    <span class="set-number">{{ index + 1 }}</span>
                    <span class="set-type-label">
                      {{ getSetTypeLabel(set.setType || "working") }}
                    </span>
                  </button>
                  <div v-else class="set-number-display">
                    <span class="set-number">{{ index + 1 }}</span>
                    <span
                      v-if="set.setType && set.setType !== 'working'"
                      class="set-type-badge"
                      :class="`set-type-badge--${set.setType}`"
                    >
                      {{ getSetTypeLabel(set.setType) }}
                    </span>
                  </div>
                </div>

                <div class="set-actions">
                  <button
                    v-if="set.notes"
                    class="notes-indicator"
                    @click.stop="toggleNotes(set.id)"
                    :aria-label="'Notes'"
                  >
                    <ion-icon :icon="documentText" />
                  </button>
                  <button
                    v-if="!set.notes && !set.completed"
                    class="notes-button"
                    @click.stop="toggleNotes(set.id)"
                    :aria-label="'Add notes'"
                  >
                    <ion-icon :icon="documentTextOutline" />
                  </button>
                  <ion-checkbox
                    :checked="set.completed"
                    @ion-change="handleToggleCompleted(set.id)"
                    @click.stop
                    class="set-checkbox"
                  />
                </div>
              </div>

              <!-- Previous Performance -->
              <div
                v-if="previousPerformance && index === 0"
                class="previous-performance"
              >
                <span class="previous-label">Previous:</span>
                <span class="previous-value">
                  <span
                    v-if="
                      previousPerformance.weight !== undefined &&
                      previousPerformance.reps !== undefined
                    "
                  >
                    {{ previousPerformance.weight }}kg ×
                    {{ previousPerformance.reps }}
                  </span>
                  <span v-else-if="previousPerformance.weight !== undefined">
                    {{ previousPerformance.weight }}kg
                  </span>
                  <span v-else-if="previousPerformance.reps !== undefined">
                    {{ previousPerformance.reps }} reps
                  </span>
                  <span v-else>—</span>
                </span>
              </div>

              <!-- Weight Input -->
              <div class="input-group">
                <label class="input-label">Weight (kg)</label>
                <div class="input-with-buttons">
                  <button
                    class="increment-button"
                    @click.stop="adjustWeight(set.id, -2.5)"
                    :disabled="set.completed"
                    aria-label="Decrease weight"
                  >
                    <ion-icon :icon="remove" />
                  </button>
                  <ion-input
                    :ref="(el) => setInputRefs(`weight-${set.id}`, el)"
                    type="number"
                    :value="set.weight ?? ''"
                    placeholder="—"
                    :disabled="set.completed"
                    @ion-input="handleWeightChange(set.id, $event)"
                    @keydown.enter="focusNextInput(set.id, 'reps')"
                    @click.stop
                    class="set-input"
                    step="0.5"
                    min="0"
                  />
                  <button
                    class="increment-button"
                    @click.stop="adjustWeight(set.id, 2.5)"
                    :disabled="set.completed"
                    aria-label="Increase weight"
                  >
                    <ion-icon :icon="add" />
                  </button>
                </div>
              </div>

              <!-- Reps Input -->
              <div class="input-group">
                <label class="input-label">Reps</label>
                <div class="input-with-buttons">
                  <button
                    class="increment-button"
                    @click.stop="adjustReps(set.id, -1)"
                    :disabled="set.completed"
                    aria-label="Decrease reps"
                  >
                    <ion-icon :icon="remove" />
                  </button>
                  <ion-input
                    :ref="(el) => setInputRefs(`reps-${set.id}`, el)"
                    type="number"
                    :value="set.reps ?? ''"
                    placeholder="—"
                    :disabled="set.completed"
                    @ion-input="handleRepsChange(set.id, $event)"
                    @keydown.enter="focusNextInput(set.id, 'next')"
                    @click.stop
                    class="set-input"
                    min="0"
                  />
                  <button
                    class="increment-button"
                    @click.stop="adjustReps(set.id, 1)"
                    :disabled="set.completed"
                    aria-label="Increase reps"
                  >
                    <ion-icon :icon="add" />
                  </button>
                </div>
              </div>

              <!-- Quick Actions -->
              <div v-if="!set.completed && index > 0" class="quick-actions">
                <button
                  class="quick-action-button"
                  @click.stop="copyPreviousSet(set.id, index)"
                  aria-label="Copy previous set"
                >
                  <ion-icon :icon="copyOutline" />
                  <span>Copy Previous</span>
                </button>
              </div>

              <!-- Rest Timer -->
              <div
                v-if="set.completed && set.restTime && restTimers[set.id]"
                class="rest-timer"
              >
                <button
                  class="rest-timer-button"
                  :class="{
                    'rest-timer-button--running': restTimers[set.id].isRunning,
                  }"
                  @click.stop="toggleRestTimer(set.id)"
                >
                  <ion-icon
                    :icon="restTimers[set.id].isRunning ? pause : play"
                  />
                  <span class="rest-timer-text">
                    {{ formatTime(restTimers[set.id].timeRemaining) }}
                  </span>
                </button>
              </div>

              <!-- Notes Section -->
              <div v-if="expandedNotes[set.id]" class="notes-section">
                <ion-textarea
                  :value="set.notes ?? ''"
                  placeholder="Add notes for this set..."
                  @ion-input="handleNotesChange(set.id, $event)"
                  @click.stop
                  class="notes-input"
                  :rows="2"
                  auto-grow
                />
              </div>
            </div>
          </div>

          <!-- Delete Action -->
          <div
            class="delete-action"
            :class="{ 'delete-action--visible': isSwiped(set.id) }"
            @click.stop="handleDeleteSet(set.id)"
          >
            <ion-icon :icon="trash" />
            <span>Delete</span>
          </div>
        </div>
      </div>

      <!-- Add Set Button -->
      <button class="add-set-button" @click="handleAddSet">
        <ion-icon :icon="add" />
        <span>Add Set</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted, nextTick } from "vue";
import { IonInput, IonCheckbox, IonIcon, IonTextarea } from "@ionic/vue";
import {
  add,
  remove,
  trash,
  documentText,
  documentTextOutline,
  copyOutline,
  play,
  pause,
} from "ionicons/icons";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import type { WorkoutExercise } from "../types/workout.types";
import type { PreviousExercisePerformance } from "../types/workout.types";
import type { SetType } from "../types/workout.types";

interface Props {
  exercise: WorkoutExercise;
  previousPerformance?: PreviousExercisePerformance | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  addSet: [];
  updateSet: [setId: string, field: string, value: number | string | null];
  toggleCompleted: [setId: string];
  deleteSet: [setId: string];
}>();

// State management
const inputRefs = ref<Record<string, any>>({});
const expandedNotes = reactive<Record<string, boolean>>({});
const restTimers = reactive<
  Record<
    string,
    {
      timeRemaining: number;
      isRunning: boolean;
      intervalId?: number;
    }
  >
>({});

// Set type cycling
const SET_TYPES: SetType[] = [
  "working",
  "warmup",
  "dropset",
  "superset",
  "failure",
  "rpe",
];

// Swipe state management
const swipeState = reactive<
  Record<
    string,
    {
      startX: number;
      currentX: number;
      isSwiping: boolean;
      isMouseDown: boolean;
    }
  >
>({});
const SWIPE_THRESHOLD = 50; // More forgiving threshold
const DELETE_BUTTON_WIDTH = 80;

// Haptic feedback helper (optional)
async function triggerHaptic(style: ImpactStyle = ImpactStyle.Light) {
  try {
    await Haptics.impact({ style });
  } catch (error) {
    // Haptics not available (web), ignore
  }
}

function setInputRefs(key: string, el: any) {
  if (el) {
    inputRefs.value[key] = el;
  }
}

function getSetTypeLabel(setType: SetType): string {
  const labels: Record<SetType, string> = {
    working: "Work",
    warmup: "Warm",
    dropset: "Drop",
    superset: "Super",
    failure: "Fail",
    rpe: "RPE",
  };
  return labels[setType] || setType;
}

function handleSetTypeClick(setId: string, currentType: SetType) {
  const currentIndex = SET_TYPES.indexOf(currentType);
  const nextIndex = (currentIndex + 1) % SET_TYPES.length;
  const nextType = SET_TYPES[nextIndex];
  emit("updateSet", setId, "setType", nextType);
  triggerHaptic(ImpactStyle.Light);
}

function handleWeightChange(setId: string, event: Event) {
  const target = event.target as HTMLIonInputElement;
  const value = target.value;
  emit("updateSet", setId, "weight", value ? Number(value) : null);
}

function handleRepsChange(setId: string, event: Event) {
  const target = event.target as HTMLIonInputElement;
  const value = target.value;
  emit("updateSet", setId, "reps", value ? Number(value) : null);
}

function handleNotesChange(setId: string, event: Event) {
  const target = event.target as HTMLIonTextareaElement;
  const value = target.value as string;
  emit("updateSet", setId, "notes", value || null);
}

function adjustWeight(setId: string, delta: number) {
  const set = props.exercise.sets.find((s) => s.id === setId);
  if (!set || set.completed) return;

  const currentWeight = set.weight ?? 0;
  const newWeight = Math.max(0, currentWeight + delta);
  emit("updateSet", setId, "weight", newWeight);
  triggerHaptic(ImpactStyle.Light);
}

function adjustReps(setId: string, delta: number) {
  const set = props.exercise.sets.find((s) => s.id === setId);
  if (!set || set.completed) return;

  const currentReps = set.reps ?? 0;
  const newReps = Math.max(0, currentReps + delta);
  emit("updateSet", setId, "reps", newReps);
  triggerHaptic(ImpactStyle.Light);
}

function copyPreviousSet(setId: string, currentIndex: number) {
  if (currentIndex === 0) return;

  const previousSet = props.exercise.sets[currentIndex - 1];
  if (previousSet.weight !== undefined) {
    emit("updateSet", setId, "weight", previousSet.weight);
  }
  if (previousSet.reps !== undefined) {
    emit("updateSet", setId, "reps", previousSet.reps);
  }
  triggerHaptic(ImpactStyle.Medium);
}

function focusNextInput(setId: string, target: "reps" | "next") {
  const setIndex = props.exercise.sets.findIndex((s) => s.id === setId);
  if (setIndex === -1) return;

  if (target === "reps") {
    // Focus reps input of same set
    nextTick(() => {
      const repsInput = inputRefs.value[`reps-${setId}`];
      if (repsInput && repsInput.$el) {
        const input = repsInput.$el.querySelector("input");
        if (input) input.focus();
      }
    });
  } else if (target === "next") {
    // Focus weight input of next set
    const nextSetIndex = setIndex + 1;
    if (nextSetIndex < props.exercise.sets.length) {
      const nextSet = props.exercise.sets[nextSetIndex];
      nextTick(() => {
        const weightInput = inputRefs.value[`weight-${nextSet.id}`];
        if (weightInput && weightInput.$el) {
          const input = weightInput.$el.querySelector("input");
          if (input) input.focus();
        }
      });
    }
  }
}

function handleToggleCompleted(setId: string) {
  emit("toggleCompleted", setId);

  // Start rest timer if set is completed and has rest time
  nextTick(() => {
    const set = props.exercise.sets.find((s) => s.id === setId);
    if (set?.completed && set.restTime) {
      startRestTimer(setId, set.restTime);
    }

    // Auto-focus next set's weight if completed
    const setIndex = props.exercise.sets.findIndex((s) => s.id === setId);
    if (setIndex < props.exercise.sets.length - 1) {
      const nextSet = props.exercise.sets[setIndex + 1];
      nextTick(() => {
        const weightInput = inputRefs.value[`weight-${nextSet.id}`];
        if (weightInput && weightInput.$el) {
          const input = weightInput.$el.querySelector("input");
          if (input) input.focus();
        }
      });
    }
  });

  triggerHaptic(ImpactStyle.Medium);
}

function toggleNotes(setId: string) {
  expandedNotes[setId] = !expandedNotes[setId];
  triggerHaptic(ImpactStyle.Light);
}

function handleAddSet() {
  emit("addSet");
  triggerHaptic(ImpactStyle.Light);

  // Auto-focus the new set's weight input after it's added
  nextTick(() => {
    const lastSet = props.exercise.sets[props.exercise.sets.length - 1];
    if (lastSet) {
      // Copy previous set values if available
      if (props.exercise.sets.length > 1) {
        const previousSet = props.exercise.sets[props.exercise.sets.length - 2];
        if (previousSet.weight !== undefined) {
          emit("updateSet", lastSet.id, "weight", previousSet.weight);
        }
        if (previousSet.reps !== undefined) {
          emit("updateSet", lastSet.id, "reps", previousSet.reps);
        }
      }

      // Focus weight input
      setTimeout(() => {
        const weightInput = inputRefs.value[`weight-${lastSet.id}`];
        if (weightInput && weightInput.$el) {
          const input = weightInput.$el.querySelector("input");
          if (input) input.focus();
        }
      }, 100);
    }
  });
}

// Rest timer functions
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function startRestTimer(setId: string, duration: number) {
  if (restTimers[setId]?.intervalId) {
    clearInterval(restTimers[setId].intervalId);
  }

  restTimers[setId] = {
    timeRemaining: duration,
    isRunning: true,
  };

  restTimers[setId].intervalId = window.setInterval(() => {
    if (restTimers[setId]) {
      restTimers[setId].timeRemaining--;
      if (restTimers[setId].timeRemaining <= 0) {
        stopRestTimer(setId);
        triggerHaptic(ImpactStyle.Heavy);
      }
    }
  }, 1000);
}

function stopRestTimer(setId: string) {
  if (restTimers[setId]?.intervalId) {
    clearInterval(restTimers[setId].intervalId);
  }
  if (restTimers[setId]) {
    restTimers[setId].isRunning = false;
    restTimers[setId].intervalId = undefined;
  }
}

function toggleRestTimer(setId: string) {
  const timer = restTimers[setId];
  if (!timer) return;

  const set = props.exercise.sets.find((s) => s.id === setId);
  if (!set?.restTime) return;

  if (timer.isRunning) {
    stopRestTimer(setId);
  } else {
    startRestTimer(setId, timer.timeRemaining || set.restTime);
  }
  triggerHaptic(ImpactStyle.Light);
}

// Cleanup timers on unmount
onUnmounted(() => {
  Object.values(restTimers).forEach((timer) => {
    if (timer.intervalId) {
      clearInterval(timer.intervalId);
    }
  });
});

// Swipe handlers for touch
function handleTouchStart(event: TouchEvent, setId: string) {
  const touch = event.touches[0];
  if (!touch) return;

  closeOtherSwipes(setId);

  swipeState[setId] = {
    startX: touch.clientX,
    currentX: touch.clientX,
    isSwiping: false,
    isMouseDown: false,
  };
}

function handleTouchMove(event: TouchEvent, setId: string) {
  if (!swipeState[setId]) return;

  const touch = event.touches[0];
  if (!touch) return;

  const deltaX = touch.clientX - swipeState[setId].startX;

  if (deltaX < 0) {
    swipeState[setId].isSwiping = true;
    swipeState[setId].currentX = touch.clientX;
    event.preventDefault();

    // Haptic feedback when threshold is reached
    if (Math.abs(deltaX) >= SWIPE_THRESHOLD && !isSwiped(setId)) {
      triggerHaptic(ImpactStyle.Light);
    }
  }
}

function handleTouchEnd(event: TouchEvent, setId: string) {
  if (!swipeState[setId]) return;
  finishSwipe(setId);
}

// Swipe handlers for mouse (desktop)
function handleMouseDown(event: MouseEvent, setId: string) {
  if (event.button !== 0) return;

  closeOtherSwipes(setId);

  swipeState[setId] = {
    startX: event.clientX,
    currentX: event.clientX,
    isSwiping: false,
    isMouseDown: true,
  };
}

function handleMouseMove(event: MouseEvent, setId: string) {
  if (!swipeState[setId] || !swipeState[setId].isMouseDown) return;

  const deltaX = event.clientX - swipeState[setId].startX;

  if (deltaX < 0) {
    swipeState[setId].isSwiping = true;
    swipeState[setId].currentX = event.clientX;
    event.preventDefault();
  }
}

function handleMouseUp(event: MouseEvent, setId: string) {
  if (!swipeState[setId]) return;
  swipeState[setId].isMouseDown = false;
  finishSwipe(setId);
}

function handleMouseLeave(event: MouseEvent, setId: string) {
  if (!swipeState[setId]) return;
  swipeState[setId].isMouseDown = false;
  finishSwipe(setId);
}

function finishSwipe(setId: string) {
  if (!swipeState[setId]) return;

  const deltaX = swipeState[setId].currentX - swipeState[setId].startX;

  if (deltaX < -SWIPE_THRESHOLD) {
    swipeState[setId].currentX = swipeState[setId].startX - DELETE_BUTTON_WIDTH;
    triggerHaptic(ImpactStyle.Medium);
  } else {
    resetSwipe(setId);
  }

  swipeState[setId].isSwiping = false;
}

function resetSwipe(setId: string) {
  if (swipeState[setId]) {
    swipeState[setId].currentX = swipeState[setId].startX;
  }
}

function closeOtherSwipes(currentSetId: string) {
  Object.keys(swipeState).forEach((setId) => {
    if (setId !== currentSetId && isSwiped(setId)) {
      resetSwipe(setId);
    }
  });
}

function getRowStyle(setId: string): string {
  if (!swipeState[setId]) {
    return "transform: translateX(0);";
  }

  const deltaX = swipeState[setId].currentX - swipeState[setId].startX;
  const translateX = Math.max(-DELETE_BUTTON_WIDTH, Math.min(0, deltaX));

  return `transform: translateX(${translateX}px); transition: ${
    swipeState[setId].isSwiping ? "none" : "transform 0.25s ease-out"
  };`;
}

function isSwiped(setId: string): boolean {
  if (!swipeState[setId]) return false;
  const deltaX = swipeState[setId].currentX - swipeState[setId].startX;
  return deltaX < -SWIPE_THRESHOLD;
}

function handleCardClick(setId: string, event: MouseEvent) {
  if (swipeState[setId] && swipeState[setId].isSwiping) {
    return;
  }

  if (isSwiped(setId)) {
    const target = event.target as HTMLElement;
    if (!target.closest(".set-type-pill") && !target.closest(".set-actions")) {
      resetSwipe(setId);
    }
  }
}

function handleDeleteSet(setId: string) {
  emit("deleteSet", setId);
  triggerHaptic(ImpactStyle.Heavy);
  setTimeout(() => {
    delete swipeState[setId];
    if (restTimers[setId]?.intervalId) {
      clearInterval(restTimers[setId].intervalId);
    }
    delete restTimers[setId];
  }, 100);
}
</script>

<style scoped>
.exercise-set-table {
  background: var(--card-background);
  border-radius: var(--radius-card);
  border: var(--card-border-width) solid var(--card-border-color);
  box-shadow: var(--shadow-card);
  margin-bottom: var(--spacing-sm);
  overflow: hidden;
}

.exercise-header {
  padding: var(--spacing-base);
  background: var(--color-background-elevated);
  border-bottom: var(--border-width-thin) solid var(--color-border);
}

.exercise-name {
  font-size: var(--typography-body-size);
  font-weight: var(--typography-body-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.sets-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
}

.set-card-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-md);
}

.set-card {
  background: var(--card-background);
  border-radius: var(--radius-md);
  border: var(--border-width-thin) solid var(--color-border);
  transition: all 0.2s ease;
}

.set-card--completed {
  background: var(--color-success-50);
  opacity: 0.85;
}

.swipeable-card-container {
  position: relative;
  display: flex;
  min-height: 100%;
  user-select: none;
  -webkit-user-select: none;
  touch-action: pan-y;
}

.swipeable-card {
  position: relative;
  z-index: 1;
  will-change: transform;
  flex: 1;
  min-width: 100%;
  border-radius: var(--radius-md);
}

.set-card-content {
  padding: var(--spacing-base);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.set-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-sm);
}

.set-number-section {
  display: flex;
  align-items: center;
}

.set-type-pill {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  border: 2px solid transparent;
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  font-weight: var(--typography-body-weight-semibold);
  font-size: var(--typography-small-size);
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px; /* Touch target */
}

.set-type-pill:hover {
  background: var(--color-primary-200);
  transform: scale(1.05);
}

.set-type-pill--warmup {
  background: var(--color-warning-100);
  color: var(--color-warning-700);
  border-color: var(--color-warning-300);
}

.set-type-pill--warmup:hover {
  background: var(--color-warning-200);
}

.set-type-pill--dropset {
  background: var(--color-error-100);
  color: var(--color-error-700);
  border-color: var(--color-error-300);
}

.set-type-pill--dropset:hover {
  background: var(--color-error-200);
}

.set-type-pill--superset {
  background: var(--color-info-100);
  color: var(--color-info-700);
  border-color: var(--color-info-300);
}

.set-type-pill--superset:hover {
  background: var(--color-info-200);
}

.set-type-pill--failure {
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  border-color: var(--color-primary-300);
}

.set-type-pill--rpe {
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  border-color: var(--color-primary-300);
}

.set-number {
  font-size: var(--typography-body-size);
  font-weight: var(--typography-body-weight-bold);
}

.set-type-label {
  font-size: var(--typography-small-size);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.set-number-display {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.set-type-badge {
  font-size: 9px;
  font-weight: var(--font-weight-semibold);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1;
}

.set-type-badge--warmup {
  background: var(--color-warning-100);
  color: var(--color-warning-700);
}

.set-type-badge--dropset {
  background: var(--color-error-100);
  color: var(--color-error-700);
}

.set-type-badge--superset {
  background: var(--color-info-100);
  color: var(--color-info-700);
}

.set-type-badge--failure,
.set-type-badge--rpe {
  background: var(--color-primary-100);
  color: var(--color-primary-700);
}

.set-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.notes-indicator,
.notes-button {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.notes-indicator {
  color: var(--color-primary-600);
}

.notes-button:hover,
.notes-indicator:hover {
  background: var(--color-background-elevated);
  color: var(--color-primary-600);
}

.set-checkbox {
  min-width: 44px;
  min-height: 44px;
}

.previous-performance {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs);
  background: var(--color-background-elevated);
  border-radius: var(--radius-sm);
  font-size: var(--typography-small-size);
}

.previous-label {
  color: var(--color-text-tertiary);
  font-weight: var(--typography-body-weight-medium);
}

.previous-value {
  color: var(--color-text-secondary);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.input-label {
  font-size: var(--typography-small-size);
  font-weight: var(--typography-body-weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-with-buttons {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.increment-button {
  background: var(--color-background-elevated);
  border: var(--border-width-thin) solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  cursor: pointer;
  padding: var(--spacing-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.increment-button:hover:not(:disabled) {
  background: var(--color-primary-100);
  border-color: var(--color-primary-300);
  color: var(--color-primary-700);
}

.increment-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.increment-button ion-icon {
  font-size: 20px;
}

.set-input {
  flex: 1;
  --padding-start: var(--spacing-sm);
  --padding-end: var(--spacing-sm);
  --padding-top: var(--spacing-sm);
  --padding-bottom: var(--spacing-sm);
  min-height: 44px;
  font-size: var(--typography-body-size);
  font-weight: var(--typography-body-weight-medium);
}

.set-input input {
  text-align: center;
}

.quick-actions {
  display: flex;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-xs);
}

.quick-action-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-background-elevated);
  border: var(--border-width-thin) solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-size: var(--typography-small-size);
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
}

.quick-action-button:hover {
  background: var(--color-primary-100);
  border-color: var(--color-primary-300);
  color: var(--color-primary-700);
}

.quick-action-button ion-icon {
  font-size: 16px;
}

.rest-timer {
  margin-top: var(--spacing-xs);
}

.rest-timer-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-base);
  background: var(--color-success-100);
  border: 2px solid var(--color-success-300);
  border-radius: var(--radius-md);
  color: var(--color-success-700);
  font-weight: var(--typography-body-weight-semibold);
  font-size: var(--typography-body-size);
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  justify-content: center;
  min-height: 44px;
}

.rest-timer-button:hover {
  background: var(--color-success-200);
  border-color: var(--color-success-400);
}

.rest-timer-button--running {
  background: var(--color-success-200);
  animation: pulse 2s ease-in-out infinite;
}

.rest-timer-button ion-icon {
  font-size: 20px;
}

.rest-timer-text {
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.05em;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.notes-section {
  margin-top: var(--spacing-xs);
}

.notes-input {
  --padding-start: var(--spacing-sm);
  --padding-end: var(--spacing-sm);
  --padding-top: var(--spacing-sm);
  --padding-bottom: var(--spacing-sm);
  font-size: var(--typography-small-size);
  border: var(--border-width-thin) solid var(--color-border);
  border-radius: var(--radius-sm);
}

.delete-action {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 80px;
  background: var(--color-error-500);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  z-index: 0;
  opacity: 0;
  transition: opacity 0.2s ease;
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}

.delete-action--visible {
  opacity: 1;
}

.delete-action ion-icon {
  font-size: 24px;
}

.delete-action span {
  font-size: 10px;
  font-weight: var(--typography-body-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.add-set-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-base);
  background: linear-gradient(
    135deg,
    var(--color-primary-500) 0%,
    var(--color-primary-600) 100%
  );
  color: white;
  font-weight: var(--typography-body-weight-semibold);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 48px;
  margin-top: var(--spacing-xs);
}

.add-set-button:hover {
  background: linear-gradient(
    135deg,
    var(--color-primary-400) 0%,
    var(--color-primary-500) 100%
  );
  transform: translateY(-1px);
  box-shadow: var(--shadow-card);
}

.add-set-button ion-icon {
  font-size: 20px;
}

/* Desktop: Keep table layout for larger screens */
@media (min-width: 768px) {
  .sets-container {
    padding: var(--spacing-base);
  }

  .set-card-content {
    flex-direction: row;
    align-items: center;
    gap: var(--spacing-base);
  }

  .input-group {
    flex: 1;
    max-width: 150px;
  }

  .set-header {
    min-width: 120px;
  }

  .previous-performance {
    margin-right: auto;
    margin-left: var(--spacing-base);
  }
}

/* Mobile optimizations */
@media (max-width: 767px) {
  .sets-container {
    gap: var(--spacing-sm);
  }

  .set-card-content {
    gap: var(--spacing-base);
  }
}
</style>
