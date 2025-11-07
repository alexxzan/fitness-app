<template>
  <ion-modal :is-open="isOpen" @did-dismiss="handleClose">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ routine ? 'Edit Routine' : 'Create Routine' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleClose">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <!-- Routine Info -->
      <div class="routine-info-section">
        <FormField
          v-model="routineName"
          label="Routine Name"
          placeholder="e.g., Push Day"
        />
        <FormField
          v-model="routineDescription"
          label="Description (Optional)"
          placeholder="Describe this routine..."
        />
      </div>

      <!-- Exercises Section -->
      <div class="exercises-section">
        <div class="section-header">
          <h3 class="section-title">Exercises</h3>
          <AppButton size="small" fill="outline" @click="showExerciseSelector = true">
            <ion-icon :icon="add" slot="start" />
            Add Exercise
          </AppButton>
        </div>

        <div v-if="routineExercises.length === 0" class="empty-state">
          <p>No exercises yet. Add exercises to this routine.</p>
        </div>

        <ion-list v-else>
          <ion-item
            v-for="(exercise, index) in routineExercises"
            :key="exercise.id"
            class="exercise-item"
          >
            <ion-label>
              <h4>{{ exercise.exerciseName }}</h4>
              <div class="exercise-details">
                <span v-if="exercise.targetSets">Sets: {{ exercise.targetSets }}</span>
                <span v-if="exercise.targetReps">Reps: {{ exercise.targetReps }}</span>
                <span v-if="exercise.targetWeight">Weight: {{ exercise.targetWeight }}kg</span>
              </div>
            </ion-label>
            <div slot="end" class="exercise-actions">
              <ion-button
                fill="clear"
                size="small"
                :disabled="index === 0"
                @click="moveExerciseUp(index)"
              >
                <ion-icon :icon="chevronUp" slot="icon-only" />
              </ion-button>
              <ion-button
                fill="clear"
                size="small"
                :disabled="index === routineExercises.length - 1"
                @click="moveExerciseDown(index)"
              >
                <ion-icon :icon="chevronDown" slot="icon-only" />
              </ion-button>
              <ion-button
                fill="clear"
                size="small"
                @click="editExercise(index)"
              >
                <ion-icon :icon="create" slot="icon-only" />
              </ion-button>
              <ion-button
                fill="clear"
                size="small"
                color="danger"
                @click="deleteExercise(index)"
              >
                <ion-icon :icon="trash" slot="icon-only" />
              </ion-button>
            </div>
          </ion-item>
        </ion-list>
      </div>

      <!-- Save Button -->
      <div class="button-group">
        <AppButton expand="block" @click="handleSave">Save Routine</AppButton>
      </div>

      <!-- Exercise Selector Modal -->
      <ExerciseSelectorModal
        :is-open="showExerciseSelector"
        :exercises="exercises"
        title="Add Exercise"
        @select="handleAddExercise"
        @close="showExerciseSelector = false"
      />

      <!-- Exercise Editor Modal -->
      <ExerciseEditorModal
        v-if="editingExerciseIndex !== null"
        :is-open="editingExerciseIndex !== null"
        :exercise="routineExercises[editingExerciseIndex]"
        @save="handleSaveExercise"
        @close="editingExerciseIndex = null"
      />
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
} from "@ionic/vue";
import { add, chevronUp, chevronDown, create, trash } from "ionicons/icons";
import FormField from "@/components/molecules/FormField.vue";
import AppButton from "@/components/atoms/AppButton.vue";
import ExerciseSelectorModal from "../selection/ExerciseSelectorModal.vue";
import ExerciseEditorModal from "../editor/ExerciseEditorModal.vue";
import type { WorkoutRoutine, RoutineExercise } from "../../types/workout.types";
import type { Exercise } from "@/features/exercises/types/exercise.types";
import { generateId } from "@/shared/utils/id";

interface Props {
  isOpen: boolean;
  routine?: WorkoutRoutine | null;
  exercises: Exercise[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  save: [routine: WorkoutRoutine];
  close: [];
}>();

const routineName = ref("");
const routineDescription = ref("");
const routineExercises = ref<RoutineExercise[]>([]);
const showExerciseSelector = ref(false);
const editingExerciseIndex = ref<number | null>(null);

// Initialize form when routine changes
watch(
  () => props.routine,
  (newRoutine) => {
    if (newRoutine) {
      routineName.value = newRoutine.name;
      routineDescription.value = newRoutine.description || "";
      routineExercises.value = [...newRoutine.exercises];
    } else {
      routineName.value = "";
      routineDescription.value = "";
      routineExercises.value = [];
    }
  },
  { immediate: true }
);

function handleAddExercise(exercise: Exercise) {
  const newRoutineExercise: RoutineExercise = {
    id: generateId(),
    exerciseId: exercise.exerciseId,
    exerciseName: exercise.name,
    order: routineExercises.value.length,
  };
  routineExercises.value.push(newRoutineExercise);
  showExerciseSelector.value = false;
}

function editExercise(index: number) {
  editingExerciseIndex.value = index;
}

function handleSaveExercise(updatedExercise: RoutineExercise) {
  if (editingExerciseIndex.value !== null) {
    routineExercises.value[editingExerciseIndex.value] = updatedExercise;
    editingExerciseIndex.value = null;
  }
}

function deleteExercise(index: number) {
  routineExercises.value.splice(index, 1);
  // Reorder remaining exercises
  routineExercises.value.forEach((ex, idx) => {
    ex.order = idx;
  });
}

function moveExerciseUp(index: number) {
  if (index > 0) {
    const temp = routineExercises.value[index];
    routineExercises.value[index] = routineExercises.value[index - 1];
    routineExercises.value[index - 1] = temp;
    // Update order
    routineExercises.value[index].order = index;
    routineExercises.value[index - 1].order = index - 1;
  }
}

function moveExerciseDown(index: number) {
  if (index < routineExercises.value.length - 1) {
    const temp = routineExercises.value[index];
    routineExercises.value[index] = routineExercises.value[index + 1];
    routineExercises.value[index + 1] = temp;
    // Update order
    routineExercises.value[index].order = index;
    routineExercises.value[index + 1].order = index + 1;
  }
}

function handleSave() {
  if (!routineName.value.trim()) return;

  const savedRoutine: WorkoutRoutine = {
    id: props.routine?.id || generateId(),
    name: routineName.value.trim(),
    description: routineDescription.value.trim() || undefined,
    exercises: routineExercises.value,
    type: "custom",
    isCustom: props.routine?.isCustom ?? true, // Preserve isCustom flag or default to true
    createdAt: props.routine?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  emit("save", savedRoutine);
}

function handleClose() {
  emit("close");
}
</script>

<style scoped>
.routine-info-section {
  margin-bottom: var(--spacing-xl);
}

.exercises-section {
  margin-bottom: var(--spacing-xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
}

.exercise-item {
  margin-bottom: var(--spacing-sm);
  border-radius: var(--radius-button);
  border: 1px solid var(--color-border);
}

.exercise-item h4 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.exercise-details {
  display: flex;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.exercise-actions {
  display: flex;
  gap: var(--spacing-xs);
  align-items: center;
}

.button-group {
  margin-top: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
}
</style>

