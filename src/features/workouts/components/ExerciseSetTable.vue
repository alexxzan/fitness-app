<template>
  <div class="exercise-card">
    <!-- Exercise Header -->
    <div
      class="exercise-header"
      :class="{
        'exercise-header--collapsed': isCollapsed,
        'exercise-header--completed': isExerciseComplete,
      }"
      @click="toggleCollapse"
    >
      <div class="header-left">
        <div class="exercise-image-container">
          <ion-img
            v-if="exerciseImageUrl"
            :src="exerciseImageUrl"
            :alt="exercise.exerciseName"
            class="exercise-image"
            loading="lazy"
          />
          <ion-icon v-else :icon="barbell" class="exercise-image-icon" />
        </div>
        <div class="exercise-name-section">
          <div class="exercise-name-row">
            <h3 class="exercise-name">{{ exercise.exerciseName }}</h3>
          </div>
          <div class="exercise-summary-row" v-if="exerciseSummary">
            <div class="exercise-summary">
              <span>{{ exerciseSummary }}</span>
            </div>
            <button
              v-if="!isExerciseComplete"
              class="rest-time-button"
              @click.stop="openRestTimePicker"
              :aria-label="`Rest time: ${exerciseRestTime}s`"
            >
              <ion-icon :icon="timeOutline" />
              <span class="rest-time-value">{{ exerciseRestTime }}s</span>
            </button>
          </div>
        </div>
      </div>
      <div class="header-right">
        <button
          class="context-menu-button"
          @click.stop="openContextMenu"
          :aria-label="'Exercise options'"
        >
          <ion-icon :icon="ellipsisVertical" />
        </button>
        <button
          class="collapse-button"
          :aria-label="isCollapsed ? 'Expand' : 'Collapse'"
        >
          <ion-icon
            :icon="isCollapsed ? chevronDown : chevronUp"
            :class="{ 'rotate-180': isCollapsed }"
          />
        </button>
      </div>
    </div>

    <!-- Previous Performance Hint -->
    <div
      v-if="!isCollapsed && previousPerformance && exercise.sets.length > 0"
      class="previous-hint"
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

    <!-- Sets Table -->
    <div v-if="!isCollapsed" class="sets-table-wrapper">
      <div class="delete-actions-container" ref="deleteContainerRef">
        <template
          v-for="(set, index) in exercise.sets"
          :key="`delete-${set.id}`"
        >
          <div
            class="delete-action"
            :class="{ 'delete-action--visible': isSwiped(set.id) }"
            @click.stop="handleDeleteSet(set.id)"
            :style="getDeleteButtonStyle(index)"
          >
            <ion-icon :icon="trash" />
            <span>Delete</span>
          </div>
        </template>
      </div>
      <table class="sets-table" ref="tableRef">
        <thead>
          <tr>
            <th class="col-set-number">Set</th>
            <th class="col-prev-weight">Previous</th>
            <th class="col-weight">Weight</th>
            <th class="col-reps">Reps</th>
            <th class="col-completed">✓</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(set, index) in exercise.sets" :key="set.id">
            <tr
              :class="{
                'set-row': true,
                'set-row--completed': set.completed,
                'swipeable-row': true,
              }"
              @touchstart="handleTouchStart($event, set.id)"
              @touchmove="handleTouchMove($event, set.id)"
              @touchend="handleTouchEnd($event, set.id)"
              @mousedown="handleMouseDown($event, set.id)"
              @mousemove="handleMouseMove($event, set.id)"
              @mouseup="handleMouseUp($event, set.id)"
              @mouseleave="handleMouseLeave($event, set.id)"
              :style="getRowStyle(set.id)"
            >
              <!-- Set Number with Type Badge -->
              <td class="col-set-number">
                <button
                  class="set-number-container"
                  @click.stop="openSetTypePicker(set.id)"
                  :disabled="set.completed"
                  :aria-label="`Set ${index + 1}${
                    set.setType && set.setType !== 'working'
                      ? ` - ${getSetTypeLabel(set.setType)}`
                      : ''
                  }`"
                >
                  <span class="set-number">{{ index + 1 }}</span>
                  <span
                    v-if="set.setType && set.setType !== 'working'"
                    class="set-type-indicator"
                    :class="`set-type-indicator--${set.setType}`"
                  >
                    {{ getSetTypeShortLabel(set.setType) }}
                  </span>
                </button>
              </td>

              <!-- Previous Weight -->
              <td class="col-prev-weight">
                <span class="prev-weight-value">
                  {{ getPreviousWeight(index) }}
                </span>
              </td>

              <!-- Weight -->
              <td class="col-weight">
                <div class="input-wrapper">
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
                </div>
              </td>

              <!-- Reps -->
              <td class="col-reps">
                <div class="input-wrapper">
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
                </div>
              </td>

              <!-- Completed Checkbox -->
              <td class="col-completed">
                <AppCheckbox
                  :checked="set.completed"
                  @update:checked="
                    (checked) => {
                      handleToggleCompleted(set.id);
                    }
                  "
                  @click.stop
                />
              </td>
            </tr>
          </template>
        </tbody>
      </table>

      <!-- Add Set Button -->
      <button class="add-set-button" @click="handleAddSet">
        <ion-icon :icon="add" />
        <span>Add Set</span>
      </button>
    </div>

    <!-- Rest Time Picker Modal -->
    <ion-modal
      :is-open="showRestTimePicker"
      @did-dismiss="showRestTimePicker = false"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title>Rest Time</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showRestTimePicker = false">Done</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="picker-content">
        <div class="picker-wrapper">
          <div class="picker-values">
            <button
              v-for="(option, index) in restTimeOptionsList"
              :key="option.value"
              class="picker-option"
              :class="{
                'picker-option--selected': option.value === exerciseRestTime,
              }"
              @click="handleRestTimeChange(index)"
            >
              {{ option.text }}
            </button>
          </div>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Set Type Picker Modal -->
    <ion-modal
      :is-open="showSetTypePicker"
      @did-dismiss="showSetTypePicker = false"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title>Set Type</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showSetTypePicker = false">Done</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="picker-content">
        <div class="picker-wrapper">
          <div class="picker-values">
            <button
              v-for="setType in SET_TYPES"
              :key="setType"
              class="picker-option"
              :class="{
                'picker-option--selected': selectedSetType === setType,
              }"
              @click="handleSetTypeChange(setType)"
            >
              {{ getSetTypeLabel(setType) }}
            </button>
          </div>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Context Menu -->
    <ContentMenu
      :is-open="showContextMenu"
      :items="contextMenuItems"
      @dismiss="showContextMenu = false"
    />

    <!-- Validation Warning Modal -->
    <ion-modal
      :is-open="showWarningModal"
      @did-dismiss="handleNo"
      :backdrop-dismiss="false"
    >
      <div class="warning-notification">
        <div class="warning-content">
          <ion-icon :icon="warningOutline" class="warning-icon"></ion-icon>
          <p class="warning-text">{{ currentWarning }}</p>
          <p class="warning-question">Is this correct?</p>
        </div>
        <div class="warning-buttons">
          <ion-button fill="outline" @click="handleNo">No</ion-button>
          <ion-button @click="handleYes">Yes</ion-button>
        </div>
      </div>
    </ion-modal>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  computed,
  onUnmounted,
  nextTick,
  onMounted,
  watch,
} from "vue";
import {
  IonInput,
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonImg,
} from "@ionic/vue";
import AppCheckbox from "@/components/atoms/AppCheckbox.vue";
import ContentMenu from "@/components/molecules/ContentMenu.vue";
import type { ContentMenuItem } from "@/components/molecules/ContentMenu.vue";
import {
  add,
  trash,
  timeOutline,
  chevronUp,
  chevronDown,
  barbell,
  ellipsisVertical,
  swapHorizontal,
  link,
  warningOutline,
} from "ionicons/icons";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import type { WorkoutExercise } from "../types/workout.types";
import type { PreviousExercisePerformance } from "../types/workout.types";
import type { SetType } from "../types/workout.types";
import { ExerciseRepository } from "@/features/exercises/repositories/exercise.repository";

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
  startRestTimer: [exerciseName: string, duration: number];
  replaceExercise: [];
  deleteExercise: [];
  linkSuperset: [];
}>();

// State management
const isCollapsed = ref(false);
const inputRefs = ref<Record<string, any>>({});
const expandedNotes = reactive<Record<string, boolean>>({});
const showRestTimePicker = ref(false);
const showSetTypePicker = ref(false);
const showContextMenu = ref(false);
const exerciseRestTime = ref(60); // Default 60 seconds
const selectedSetId = ref<string | null>(null);
const selectedSetType = ref<SetType>("working");
const deleteContainerRef = ref<HTMLElement | null>(null);
const tableRef = ref<HTMLTableElement | null>(null);
const exerciseImageUrl = ref<string | null>(null);

// Validation warnings
const showWarningModal = ref(false);
const currentWarning = ref("");
const currentWarningSetId = ref<string | null>(null);
const previousSetsData = ref<Array<{ weight?: number; reps?: number }>>([]);

// Load previous sets data for the exercise
async function loadPreviousSetsData() {
  previousSetsData.value = [];

  try {
    const { WorkoutRepository } = await import(
      "../repositories/workout.repository"
    );
    const workoutHistory = await WorkoutRepository.getWorkoutHistory();

    // Find the most recent workout containing this exercise
    for (const workout of workoutHistory) {
      const exercise = workout.exercises.find(
        (ex) => ex.exerciseId === props.exercise.exerciseId
      );

      if (exercise && exercise.sets.length > 0) {
        // Get all sets with data from previous workout
        exercise.sets.forEach((set) => {
          if (
            set.completed &&
            (set.weight !== undefined || set.reps !== undefined)
          ) {
            previousSetsData.value.push({
              weight: set.weight,
              reps: set.reps,
            });
          }
        });
        break; // Use first matching workout (most recent)
      }
    }

    // Fallback to previousPerformance if we didn't find sets
    if (previousSetsData.value.length === 0 && props.previousPerformance) {
      previousSetsData.value.push({
        weight: props.previousPerformance.weight,
        reps: props.previousPerformance.reps,
      });
    }
  } catch (error) {
    console.error("Failed to load previous sets data:", error);
    // Fallback to previousPerformance
    if (props.previousPerformance) {
      previousSetsData.value.push({
        weight: props.previousPerformance.weight,
        reps: props.previousPerformance.reps,
      });
    }
  }
}

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
const SWIPE_THRESHOLD = 50;
const DELETE_BUTTON_WIDTH = 80;

// Rest time options (15-second increments)
const restTimeOptionsList = computed(() => {
  const options = [];
  for (let i = 15; i <= 300; i += 15) {
    options.push({
      text: `${i}s`,
      value: i,
    });
  }
  return options;
});

// Computed properties
const totalSetsCount = computed(() => props.exercise.sets.length);
const completedSetsCount = computed(
  () => props.exercise.sets.filter((s) => s.completed).length
);
const isExerciseComplete = computed(
  () =>
    totalSetsCount.value > 0 &&
    completedSetsCount.value === totalSetsCount.value
);
const totalVolume = computed(() => {
  return props.exercise.sets.reduce((sum, set) => {
    if (set.completed && set.weight && set.reps) {
      return sum + set.weight * set.reps;
    }
    return sum;
  }, 0);
});

const exerciseSummary = computed(() => {
  if (totalSetsCount.value === 0) return null;
  const parts: string[] = [];
  parts.push(`${completedSetsCount.value}/${totalSetsCount.value} sets`);
  if (totalVolume.value > 0) {
    parts.push(`${Math.round(totalVolume.value)}kg`);
  }
  return parts.join(" • ");
});

// Haptic feedback helper
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

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
  triggerHaptic(ImpactStyle.Light);
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

function getSetTypeShortLabel(setType: SetType): string {
  const labels: Record<SetType, string> = {
    working: "W",
    warmup: "W",
    dropset: "D",
    superset: "S",
    failure: "F",
    rpe: "R",
  };
  return labels[setType] || setType.charAt(0).toUpperCase();
}

function getPreviousWeight(index: number): string {
  // First try to get from previous workout's set at same index
  if (previousSetsData.value[index]?.weight !== undefined) {
    return `${previousSetsData.value[index].weight}kg`;
  }

  // Fallback to previous performance for first set
  if (index === 0 && props.previousPerformance?.weight) {
    return `${props.previousPerformance.weight}kg`;
  }

  // For subsequent sets in current workout, show previous set's weight
  if (index > 0) {
    const previousSet = props.exercise.sets[index - 1];
    if (previousSet.weight) {
      return `${previousSet.weight}kg`;
    }
  }

  return "—";
}

function openSetTypePicker(setId: string) {
  const set = props.exercise.sets.find((s) => s.id === setId);
  if (!set || set.completed) return;

  selectedSetId.value = setId;
  selectedSetType.value = set.setType || "working";
  showSetTypePicker.value = true;
  triggerHaptic(ImpactStyle.Light);
}

function handleSetTypeChange(setType: SetType) {
  if (selectedSetId.value) {
    emit("updateSet", selectedSetId.value, "setType", setType);
    showSetTypePicker.value = false;
    selectedSetId.value = null;
    triggerHaptic(ImpactStyle.Light);
  }
}

/**
 * Validates weight input against previous performance
 */
function validateWeight(setId: string, value: number | null): string | null {
  if (value === null || value === undefined || isNaN(value)) {
    return null;
  }

  // Absolute limits - check for obviously wrong values
  if (value > 1000) {
    return (
      "Weight seems too high. Did you mean " +
      formatSuggestedWeight(value) +
      "?"
    );
  }

  // Compare with previous performance
  if (props.previousPerformance?.weight !== undefined) {
    const previousWeight = props.previousPerformance.weight;
    if (previousWeight > 0) {
      // If current weight is more than 2x previous, it's suspicious
      if (value > previousWeight * 2) {
        const suggestedWeight = suggestCorrectWeight(value, previousWeight);
        if (suggestedWeight) {
          return `Did you mean ${suggestedWeight}kg? (Previous: ${previousWeight}kg)`;
        }
      }
    }
  }

  // Compare with previous set in current workout
  const setIndex = props.exercise.sets.findIndex((s) => s.id === setId);
  if (setIndex > 0) {
    const previousSet = props.exercise.sets[setIndex - 1];
    if (previousSet.weight !== undefined && previousSet.weight > 0) {
      if (value > previousSet.weight * 2) {
        const suggestedWeight = suggestCorrectWeight(value, previousSet.weight);
        if (suggestedWeight) {
          return `Did you mean ${suggestedWeight}kg? (Previous set: ${previousSet.weight}kg)`;
        }
      }
    }
  }

  return null;
}

/**
 * Validates reps input against previous performance
 */
function validateReps(setId: string, value: number | null): string | null {
  if (value === null || value === undefined || isNaN(value)) {
    return null;
  }

  // Absolute limits - check for obviously wrong values
  if (value > 500) {
    return "Reps seem too high. Please check your input.";
  }

  // Compare with previous performance
  if (props.previousPerformance?.reps !== undefined) {
    const previousReps = props.previousPerformance.reps;
    if (previousReps > 0) {
      // If current reps is more than 3x previous, it's suspicious (reps can vary more than weight)
      if (value > previousReps * 3) {
        return `Are you sure? Previous: ${previousReps} reps`;
      }
    }
  }

  // Compare with previous set in current workout
  const setIndex = props.exercise.sets.findIndex((s) => s.id === setId);
  if (setIndex > 0) {
    const previousSet = props.exercise.sets[setIndex - 1];
    if (previousSet.reps !== undefined && previousSet.reps > 0) {
      if (value > previousSet.reps * 3) {
        return `Are you sure? Previous set: ${previousSet.reps} reps`;
      }
    }
  }

  return null;
}

/**
 * Suggests a corrected weight based on common typos
 * E.g., 1005kg -> 105kg (when previous was 100kg), 1000kg -> 100kg
 */
function suggestCorrectWeight(
  inputWeight: number,
  referenceWeight: number
): string | null {
  const inputStr = inputWeight.toString();
  const refStr = referenceWeight.toString();

  // Case 1: Extra digit inserted anywhere (e.g., 100kg -> 1005kg, meaning 105kg)
  // Try removing each digit to see if we get something reasonable
  if (inputStr.length > refStr.length) {
    for (let i = 0; i < inputStr.length; i++) {
      const possible = Number(inputStr.slice(0, i) + inputStr.slice(i + 1));
      // Accept if it's close to reference or a reasonable progression (within 15kg)
      if (
        possible > 0 &&
        possible < 1000 &&
        Math.abs(possible - referenceWeight) <= 15
      ) {
        return `${possible}kg`;
      }
    }
  }

  // Case 2: Extra zero added at end (e.g., 100kg -> 1000kg)
  if (inputWeight > referenceWeight * 8 && inputWeight < referenceWeight * 12) {
    const possible = Math.round(inputWeight / 10);
    if (
      possible > 0 &&
      possible < 1000 &&
      Math.abs(possible - referenceWeight) <= 15
    ) {
      return `${possible}kg`;
    }
  }

  // Case 3: Very close to reference * 10 (e.g., 100kg -> 1000kg typo)
  if (inputWeight > referenceWeight * 9 && inputWeight < referenceWeight * 11) {
    return `${referenceWeight}kg`;
  }

  // Case 4: Special case for 1005 pattern (common typo: meant 105, typed 1005)
  // If input is like 1005 and reference is around 100, suggest 105
  if (
    inputStr.length === 4 &&
    inputStr.startsWith("100") &&
    referenceWeight >= 95 &&
    referenceWeight <= 110
  ) {
    // Remove middle zero: 1005 -> 105
    const altPossible = Number(inputStr[0] + inputStr.slice(2));
    if (
      altPossible >= 100 &&
      altPossible <= 120 &&
      Math.abs(altPossible - referenceWeight) <= 20
    ) {
      return `${altPossible}kg`;
    }
  }

  return null;
}

/**
 * Formats a suggested weight, removing extra digits
 */
function formatSuggestedWeight(value: number): string {
  // Try common corrections
  const valueStr = value.toString();

  // If it's 4+ digits and starts with common patterns, suggest removing first digit
  if (valueStr.length >= 4) {
    const withoutFirst = Number(valueStr.slice(1));
    if (withoutFirst < 1000 && withoutFirst > 0) {
      return `${withoutFirst}kg`;
    }

    // Try removing middle digit if it's like 1005
    if (valueStr.length === 4 && valueStr[1] === "0") {
      const possible = Number(valueStr[0] + valueStr.slice(2));
      if (possible > 0 && possible < 1000) {
        return `${possible}kg`;
      }
    }
  }

  return `${Math.round(value / 10)}kg`;
}

function handleWeightChange(setId: string, event: Event) {
  const target = event.target as HTMLIonInputElement;
  const value = target.value;
  const numValue = value ? Number(value) : null;
  emit("updateSet", setId, "weight", numValue);
}

function handleRepsChange(setId: string, event: Event) {
  const target = event.target as HTMLIonInputElement;
  const value = target.value;
  const numValue = value ? Number(value) : null;
  emit("updateSet", setId, "reps", numValue);
}

function focusNextInput(setId: string, target: "reps" | "next") {
  const setIndex = props.exercise.sets.findIndex((s) => s.id === setId);
  if (setIndex === -1) return;

  if (target === "reps") {
    nextTick(() => {
      const repsInput = inputRefs.value[`reps-${setId}`];
      if (repsInput && repsInput.$el) {
        const input = repsInput.$el.querySelector("input");
        if (input) input.focus();
      }
    });
  } else if (target === "next") {
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
  const set = props.exercise.sets.find((s) => s.id === setId);
  if (!set) return;

  // Validate when marking as completed
  if (!set.completed && (set.weight || set.reps)) {
    const weightWarning =
      set.weight !== null && set.weight !== undefined
        ? validateWeight(setId, set.weight)
        : null;
    const repsWarning =
      set.reps !== null && set.reps !== undefined
        ? validateReps(setId, set.reps)
        : null;

    if (weightWarning || repsWarning) {
      currentWarningSetId.value = setId;
      // Clean up warning message - remove suggestion parts, just keep the core warning
      const warningMessage = weightWarning || repsWarning || "";
      // Remove "Did you mean..." suggestions to keep it simple
      currentWarning.value = warningMessage
        .replace(/Did you mean [^?]+\?/g, "")
        .replace(/\s*\(.*?\)/g, "")
        .trim();

      showWarningModal.value = true;
      triggerHaptic(ImpactStyle.Medium);

      // Don't mark as completed yet - wait for user to confirm
      return;
    }
  }

  // If no warnings, proceed with completion
  emit("toggleCompleted", setId);
  handleSetCompletionFlow(setId);
  triggerHaptic(ImpactStyle.Medium);
}

function handleYes() {
  // User confirmed the value is correct, complete the set
  showWarningModal.value = false;
  if (currentWarningSetId.value) {
    const setId = currentWarningSetId.value;
    currentWarningSetId.value = null;
    currentWarning.value = "";

    // Complete the set and proceed with normal flow
    emit("toggleCompleted", setId);
    handleSetCompletionFlow(setId);
  }
}

function handleNo() {
  // User said no, don't complete the set - let them correct it
  showWarningModal.value = false;
  if (currentWarningSetId.value) {
    // Focus the input so user can correct it
    nextTick(() => {
      const set = props.exercise.sets.find(
        (s) => s.id === currentWarningSetId.value
      );
      if (set) {
        const weightInput =
          inputRefs.value[`weight-${currentWarningSetId.value}`];
        if (weightInput && weightInput.$el) {
          const input = weightInput.$el.querySelector("input");
          if (input) {
            input.focus();
            input.select();
          }
        }
      }
    });
    currentWarningSetId.value = null;
    currentWarning.value = "";
  }
}

function handleSetCompletionFlow(setId: string) {
  // Auto-focus next set's weight if completed
  nextTick(() => {
    const updatedSet = props.exercise.sets.find((s) => s.id === setId);
    if (updatedSet?.completed && exerciseRestTime.value > 0) {
      // Start global rest timer
      emit(
        "startRestTimer",
        props.exercise.exerciseName,
        exerciseRestTime.value
      );
    }

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
}

function toggleNotes(setId: string) {
  expandedNotes[setId] = !expandedNotes[setId];
  triggerHaptic(ImpactStyle.Light);
}

function handleAddSet() {
  emit("addSet");
  triggerHaptic(ImpactStyle.Light);

  nextTick(() => {
    const lastSet = props.exercise.sets[props.exercise.sets.length - 1];
    if (lastSet) {
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

function openRestTimePicker() {
  showRestTimePicker.value = true;
  triggerHaptic(ImpactStyle.Light);
}

function openContextMenu() {
  showContextMenu.value = true;
  triggerHaptic(ImpactStyle.Light);
}

const contextMenuItems = computed<ContentMenuItem[]>(() => [
  {
    text: "Replace exercise",
    icon: swapHorizontal,
    handler: () => {
      showContextMenu.value = false;
      triggerHaptic(ImpactStyle.Medium);
      emit("replaceExercise");
    },
  },
  {
    text: "Add as superset",
    icon: link,
    handler: () => {
      showContextMenu.value = false;
      triggerHaptic(ImpactStyle.Medium);
      emit("linkSuperset");
    },
  },
  {
    text: "Delete exercise",
    icon: trash,
    role: "destructive",
    handler: () => {
      showContextMenu.value = false;
      triggerHaptic(ImpactStyle.Heavy);
      emit("deleteExercise");
    },
  },
]);

function handleRestTimeChange(selectedIndex: number) {
  const selectedOption = restTimeOptionsList.value[selectedIndex];
  if (selectedOption) {
    exerciseRestTime.value = selectedOption.value;
    showRestTimePicker.value = false;
    triggerHaptic(ImpactStyle.Light);
  }
}

// Swipe handlers
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

    if (Math.abs(deltaX) >= SWIPE_THRESHOLD && !isSwiped(setId)) {
      triggerHaptic(ImpactStyle.Light);
    }
  }
}

function handleTouchEnd(event: TouchEvent, setId: string) {
  if (!swipeState[setId]) return;
  finishSwipe(setId);
}

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

function getDeleteButtonStyle(index: number): string {
  // Calculate position based on header height and row index
  // The delete container is positioned at top: 0 relative to sets-table-wrapper
  // We need to account for the table header height
  let headerHeight = 0;

  if (tableRef.value) {
    const thead = tableRef.value.querySelector("thead");
    if (thead) {
      const theadRect = thead.getBoundingClientRect();
      const tableRect = tableRef.value.getBoundingClientRect();
      headerHeight = theadRect.height;
    }
  }

  // Fallback if DOM not ready yet
  if (headerHeight === 0) {
    headerHeight = 40; // Approximate based on padding
  }

  // Calculate row height - approximate based on cell padding
  const rowHeight = 60; // Based on min-height of inputs and padding
  const top = headerHeight + index * rowHeight;

  return `top: ${top}px;`;
}

// Update delete button positions when table changes
watch(
  () => props.exercise.sets.length,
  () => {
    nextTick(() => {
      // Recalculate positions after DOM updates
      if (tableRef.value && deleteContainerRef.value) {
        const tbody = tableRef.value.querySelector("tbody");
        const containerRect = deleteContainerRef.value.getBoundingClientRect();
        if (tbody && containerRect) {
          const rows = tbody.querySelectorAll("tr");
          rows.forEach((row, index) => {
            const rowElement = row as HTMLElement;
            const rowRect = rowElement.getBoundingClientRect();
            const top = rowRect.top - containerRect.top;
            const deleteAction = deleteContainerRef.value?.children[
              index
            ] as HTMLElement;
            if (deleteAction) {
              deleteAction.style.top = `${top}px`;
            }
          });
        }
      }
    });
  }
);

// Also update on mount
onMounted(() => {
  nextTick(() => {
    if (tableRef.value && deleteContainerRef.value) {
      const tbody = tableRef.value.querySelector("tbody");
      const containerRect = deleteContainerRef.value.getBoundingClientRect();
      if (tbody && containerRect) {
        const rows = tbody.querySelectorAll("tr");
        rows.forEach((row, index) => {
          const rowElement = row as HTMLElement;
          const rowRect = rowElement.getBoundingClientRect();
          const top = rowRect.top - containerRect.top;
          const deleteAction = deleteContainerRef.value?.children[
            index
          ] as HTMLElement;
          if (deleteAction) {
            deleteAction.style.top = `${top}px`;
          }
        });
      }
    }
  });
});

function handleDeleteSet(setId: string) {
  emit("deleteSet", setId);
  triggerHaptic(ImpactStyle.Heavy);
  setTimeout(() => {
    delete swipeState[setId];
    delete expandedNotes[setId];
  }, 100);
}

// Load exercise image URL
async function loadExerciseImage() {
  if (!props.exercise.exerciseId) {
    exerciseImageUrl.value = null;
    return;
  }

  try {
    const exercise = await ExerciseRepository.getById(
      props.exercise.exerciseId
    );
    exerciseImageUrl.value = exercise?.gifUrl || null;
  } catch (error) {
    console.error("Failed to load exercise image:", error);
    exerciseImageUrl.value = null;
  }
}

// Watch for changes to exerciseId and load image
watch(
  () => props.exercise.exerciseId,
  () => {
    loadExerciseImage();
    loadPreviousSetsData();
  },
  { immediate: true }
);

// Load previous sets data on mount
onMounted(() => {
  loadPreviousSetsData();
});
</script>

<style scoped>
.exercise-card {
  background: var(--card-background);
  border-radius: var(--radius-card);
  border: var(--card-border-width) solid var(--card-border-color);
  box-shadow: var(--shadow-card);
  margin-bottom: var(--spacing-sm);
  overflow: hidden;
}

.exercise-header {
  padding: var(--spacing-sm);
  background: var(--color-background-elevated);
  border-bottom: var(--border-width-thin) solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.exercise-header:hover {
  background: var(
    --color-background-elevated-hover,
    var(--color-background-elevated)
  );
}

.exercise-header--completed {
  background: linear-gradient(
    135deg,
    var(--color-success-500) 0%,
    var(--color-success-600) 50%,
    var(--color-success-500) 100%
  );
  border-bottom-color: var(--color-success-700);
  box-shadow: inset 0 2px 4px 0 rgba(22, 163, 74, 0.3),
    0 1px 2px 0 rgba(22, 163, 74, 0.2);
  position: relative;
}

.exercise-header--completed > * {
  position: relative;
  z-index: 1;
}

.exercise-header--completed::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--color-success-300) 50%,
    transparent 100%
  );
  opacity: 0.8;
  z-index: 0;
}

.exercise-header--completed:hover {
  background: linear-gradient(
    135deg,
    var(--color-success-600) 0%,
    var(--color-success-700) 50%,
    var(--color-success-600) 100%
  );
}

/* Ensure text is readable on completed header */
.exercise-header--completed .exercise-name {
  color: var(--color-text-primary);
  font-weight: var(--typography-body-weight-bold);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.exercise-header--completed .exercise-summary {
  color: rgba(255, 255, 255, 0.9);
  font-weight: var(--typography-body-weight-medium);
}

.exercise-header--completed .rest-time-button {
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.1);
}

.exercise-header--completed .rest-time-button:hover {
  color: var(--color-text-primary);
  background: rgba(255, 255, 255, 0.2);
}

.exercise-header--completed .collapse-button {
  color: rgba(255, 255, 255, 0.9);
}

.exercise-header--completed .collapse-button:hover {
  background: rgba(255, 255, 255, 0.15);
  color: var(--color-text-primary);
}

.exercise-header--completed .context-menu-button {
  color: rgba(255, 255, 255, 0.9);
}

.exercise-header--completed .context-menu-button:hover {
  background: rgba(255, 255, 255, 0.15);
  color: var(--color-text-primary);
}

.exercise-header--completed .completion-badge {
  color: var(--color-text-primary);
  background: rgba(255, 255, 255, 0.2);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  backdrop-filter: blur(4px);
}

.header-left {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  width: 100%;
}

.exercise-image-container {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-background-elevated);
  border: var(--border-width-thin) solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
}

.exercise-image-icon {
  font-size: 32px;
  color: var(--color-primary-500);
}

.exercise-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.exercise-name-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.exercise-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  min-width: 0;
}

.exercise-name {
  font-size: var(--typography-body-size);
  font-weight: var(--typography-body-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
  text-transform: capitalize;
}

.exercise-summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  min-width: 0;
}

.exercise-summary {
  font-size: var(--typography-small-size);
  color: var(--color-text-secondary);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.completion-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-success-600);
  font-size: var(--typography-small-size);
  font-weight: var(--typography-body-weight-semibold);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex-shrink: 0;
}

.rest-time-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: transparent;
  color: var(--color-text-secondary);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--typography-small-size);
  font-weight: var(--typography-body-weight-normal);
  cursor: pointer;
  transition: all 0.2s var(--ease-out);
  min-height: 32px;
  opacity: 0.75;
}

.rest-time-button:hover {
  color: var(--color-primary-500);
  opacity: 1;
  background: rgba(29, 185, 84, 0.08);
}

.rest-time-button:active {
  transform: scale(0.95);
}

.rest-time-button ion-icon {
  font-size: 18px;
  opacity: 0.8;
}

.rest-time-value {
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.3px;
}

.context-menu-button {
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

.context-menu-button:hover {
  background: var(--color-background-elevated);
}

.context-menu-button:active {
  transform: scale(0.95);
}

.collapse-button {
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

.collapse-button:hover {
  background: var(--color-background-elevated);
}

.previous-hint {
  padding: var(--spacing-xs) var(--spacing-base);
  background: var(--color-background-elevated);
  border-bottom: var(--border-width-thin) solid var(--color-border);
  font-size: var(--typography-small-size);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.previous-label {
  color: var(--color-text-tertiary);
  font-weight: var(--typography-body-weight-medium);
}

.previous-value {
  color: var(--color-text-secondary);
}

.sets-table-wrapper {
  position: relative;
  overflow: hidden;
  /* Disable horizontal scroll - table should fit viewport */
}

.sets-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  /* Remove min-width to allow table to fit viewport */
}

.sets-table thead {
  background: var(--color-background-elevated);
  position: sticky;
  top: 0;
  z-index: 10;
}

.sets-table th {
  padding: var(--spacing-sm) var(--spacing-xs);
  text-align: left;
  font-size: var(--typography-small-size);
  font-weight: var(--typography-body-weight-semibold);
  color: var(--color-text-secondary);
  letter-spacing: 0.5px;
  border-bottom: var(--border-width-thin) solid var(--color-border);
}

.col-set-number {
  text-align: center !important;
  width: 10%;
  position: sticky;
  left: 0;
  background: var(--color-background-elevated);
  z-index: 5;
}

.set-number-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  position: relative;
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  width: 100%;
  min-height: 40px;
  transition: all 0.2s ease;
}

.set-number-container:hover:not(:disabled) {
  opacity: 0.7;
}

.set-number-container:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.col-prev-weight {
  width: 25%;
  text-align: center !important;
}

.col-weight {
  width: 25%;
  text-align: center !important;
}

.col-reps {
  width: 25%;
  text-align: center !important;
}

.col-completed {
  width: 50px;
  text-align: center !important;
  position: relative;
  z-index: 3;
  background: var(--card-background);
}

.col-completed th,
.col-completed td {
  background: var(--card-background) !important;
  vertical-align: middle;
  text-align: center;
}

.col-completed td {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xs);
}

.set-row--completed .col-completed {
  background: rgba(22, 163, 74, 0.12) !important;
}

.set-row--completed .col-completed td {
  background: rgba(22, 163, 74, 0.12) !important;
}

.prev-weight-value {
  font-size: var(--typography-small-size);
  color: var(--color-text-tertiary);
  font-weight: var(--typography-body-weight-medium);
}

.sets-table tbody tr {
  border-bottom: var(--border-width-thin) solid var(--color-border);
  transition: background-color 0.2s ease;
}

.sets-table tbody tr:last-child {
  border-bottom: none;
}

.sets-table tbody tr:hover {
  background: var(--color-background-elevated);
}

.set-row--completed {
  background: rgba(22, 163, 74, 0.12);
}

.set-row--completed td {
  background: rgba(22, 163, 74, 0.12);
}

.set-row--completed .set-number {
  color: var(--color-success-500);
  font-weight: var(--font-weight-bold);
}

.set-row--completed .set-input {
  opacity: 0.7;
}

.set-row--completed .prev-weight-value {
  opacity: 0.6;
}

.sets-table td {
  padding: var(--spacing-sm) var(--spacing-xs);
  vertical-align: top;
  position: relative;
  z-index: 2;
  background: inherit;
}

.sets-table td.col-weight,
.sets-table td.col-reps {
  vertical-align: top;
}

.sets-table td.col-prev-weight {
  vertical-align: middle;
}

.set-number {
  font-weight: var(--typography-body-weight-bold);
  color: var(--color-text-primary);
  font-size: var(--typography-body-size);
}

.set-type-indicator {
  font-size: var(--typography-body-size);
  font-weight: var(--typography-body-weight-bold);
  display: inline-block;
  line-height: 1;
}

.set-type-indicator--warmup {
  color: #f59e0b; /* Orange for warmup */
}

.set-type-indicator--dropset {
  color: #3b82f6; /* Blue for dropset */
}

.set-type-indicator--superset {
  color: #8b5cf6; /* Purple for superset */
}

.set-type-indicator--failure {
  color: #ef4444; /* Red for failure */
}

.set-type-indicator--rpe {
  color: #10b981; /* Green for RPE */
}

.set-type-badge {
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-size: 10px;
  font-weight: var(--typography-body-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 32px;
  min-width: 44px;
}

.set-type-badge:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.set-type-badge--working {
  background: var(--color-primary-100);
  color: var(--color-primary-700);
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

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
}

.set-input {
  width: 100%;
  --padding-start: var(--spacing-xs);
  --padding-end: var(--spacing-xs);
  --padding-top: var(--spacing-xs);
  --padding-bottom: var(--spacing-xs);
  min-height: 40px;
  font-size: var(--typography-body-size);
  font-weight: var(--typography-body-weight-medium);
}

.set-input input {
  text-align: center;
}

/* Warning Notification Styles */
.warning-notification {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--color-surface);
  border-radius: var(--radius-card);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  padding: var(--spacing-base);
  min-width: 260px;
  max-width: 85%;
  z-index: 10000;
  border: 1px solid var(--color-border);
}

.warning-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  text-align: center;
  margin-bottom: var(--spacing-sm);
}

.warning-icon {
  font-size: 1.5rem;
  color: var(--color-warning-500);
  margin-bottom: var(--spacing-xs);
}

.warning-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

.warning-question {
  font-size: var(--typography-small-size);
  color: var(--color-text-secondary);
  margin: var(--spacing-xs) 0 0 0;
  font-weight: var(--font-weight-medium);
}

.warning-buttons {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.warning-buttons ion-button {
  flex: 1;
  margin: 0;
  --padding-top: var(--spacing-sm);
  --padding-bottom: var(--spacing-sm);
}

.sets-table-wrapper {
  position: relative;
  overflow: hidden;
}

.delete-actions-container {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 80px;
  z-index: 1;
  pointer-events: none;
  /* Ensure container starts at same position as tbody */
  padding-top: 0;
  /* Don't cover the table content when not swiping */
  overflow: hidden;
}

.swipeable-row {
  position: relative;
  will-change: transform;
  background: var(--card-background);
  z-index: 2;
}

.swipeable-row td {
  background: var(--card-background);
}

.swipeable-row.set-row--completed td {
  background: rgba(22, 163, 74, 0.12);
}

.delete-action {
  position: absolute;
  right: 0;
  width: 80px;
  height: 60px; /* Approximate row height */
  background: var(--color-error-500);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
  z-index: 10;
}

.delete-action--visible {
  opacity: 1;
  pointer-events: all;
  z-index: 10;
}

.delete-action ion-icon {
  font-size: 20px;
}

.delete-action span {
  font-size: 10px;
  font-weight: var(--typography-body-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
  margin: var(--spacing-sm);
  width: calc(100% - var(--spacing-sm) * 2);
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

.picker-content {
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
}

.picker-wrapper {
  padding: var(--spacing-base);
}

.picker-values {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  max-height: 400px;
  overflow-y: auto;
}

.picker-option {
  padding: var(--spacing-base);
  background: var(--color-background-elevated);
  border: var(--border-width-thin) solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--typography-body-size);
  font-weight: var(--typography-body-weight-medium);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  min-height: 44px;
}

.picker-option:hover {
  background: var(--color-primary-100);
  border-color: var(--color-primary-300);
  color: var(--color-primary-700);
}

.picker-option--selected {
  background: var(--color-primary-500);
  border-color: var(--color-primary-600);
  color: white;
  font-weight: var(--typography-body-weight-semibold);
}

.picker-option--selected:hover {
  background: var(--color-primary-600);
  border-color: var(--color-primary-700);
}
</style>
