<template>
  <ion-modal :is-open="isOpen" @did-dismiss="handleClose">
    <ion-header>
      <ion-toolbar>
        <ion-title>Create Custom Program</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleClose">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <!-- Program Info Form -->
      <div class="program-info-section">
        <FormField
          v-model="programName"
          label="Program Name"
          placeholder="e.g., My Custom Split"
        />
        <FormField
          v-model="programDescription"
          label="Description (Optional)"
          placeholder="Describe your program..."
        />
      </div>

      <!-- Routines Section -->
      <div class="routines-section">
        <div class="section-header">
          <h3 class="section-title">Routines</h3>
          <AppButton size="small" fill="outline" @click="showAddRoutineActionSheet = true">
            <ion-icon :icon="add" slot="start" />
            Add Routine
          </AppButton>
        </div>

        <div v-if="routines.length === 0" class="empty-state">
          <p>No routines yet. Add your first routine to get started.</p>
        </div>

        <ion-list v-else>
          <ion-item
            v-for="(routine, index) in routines"
            :key="routine.id"
            class="routine-item"
          >
            <ion-label>
              <div class="routine-header">
                <h4>{{ routine.name }}</h4>
                <span class="routine-exercises-count">
                  {{ routine.exercises.length }} exercise{{ routine.exercises.length !== 1 ? 's' : '' }}
                </span>
              </div>
              <div v-if="routine.description" class="routine-description">
                {{ routine.description }}
              </div>
            </ion-label>
            <div slot="end" class="routine-actions">
              <ion-button
                fill="clear"
                size="small"
                :disabled="index === 0"
                @click="moveRoutineUp(index)"
              >
                <ion-icon :icon="chevronUp" slot="icon-only" />
              </ion-button>
              <ion-button
                fill="clear"
                size="small"
                :disabled="index === routines.length - 1"
                @click="moveRoutineDown(index)"
              >
                <ion-icon :icon="chevronDown" slot="icon-only" />
              </ion-button>
              <ion-button
                fill="clear"
                size="small"
                @click="editRoutine(index)"
              >
                <ion-icon :icon="create" slot="icon-only" />
              </ion-button>
              <ion-button
                fill="clear"
                size="small"
                color="danger"
                @click="deleteRoutine(index)"
              >
                <ion-icon :icon="trash" slot="icon-only" />
              </ion-button>
            </div>
          </ion-item>
        </ion-list>
      </div>

      <!-- Save Button -->
      <div class="button-group">
        <AppButton
          expand="block"
          :disabled="!canSave"
          @click="handleSave"
        >
          Create Program
        </AppButton>
      </div>

      <!-- Add Routine Action Sheet -->
      <ion-action-sheet
        :is-open="showAddRoutineActionSheet"
        header="Add Routine"
        :buttons="addRoutineButtons"
        @did-dismiss="showAddRoutineActionSheet = false"
      />

      <!-- Routine Editor Modal -->
      <RoutineEditorModal
        v-if="editingRoutineIndex !== null"
        :is-open="editingRoutineIndex !== null"
        :routine="routines[editingRoutineIndex]"
        :exercises="exercises"
        @save="handleSaveRoutine"
        @close="editingRoutineIndex = null"
      />

      <!-- Select Existing Routine Modal -->
      <SelectRoutineForProgramModal
        :is-open="showSelectRoutineModal"
        @select="handleAddExistingRoutine"
        @close="showSelectRoutineModal = false"
      />
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
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
  IonActionSheet,
} from "@ionic/vue";
import { add, chevronUp, chevronDown, create, trash } from "ionicons/icons";
import FormField from "@/components/molecules/FormField.vue";
import AppButton from "@/components/atoms/AppButton.vue";
import RoutineEditorModal from "../routines/RoutineEditorModal.vue";
import SelectRoutineForProgramModal from "./SelectRoutineForProgramModal.vue";
import type { WorkoutRoutine, RoutineExercise } from "../../types/workout.types";
import type { Exercise } from "@/features/exercises/types/exercise.types";
import { generateId } from "@/shared/utils/id";

interface Props {
  isOpen: boolean;
  exercises: Exercise[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  save: [data: { name: string; description?: string; routines: WorkoutRoutine[] }];
  close: [];
}>();

const programName = ref("");
const programDescription = ref("");
const routines = ref<WorkoutRoutine[]>([]);
const showAddRoutineActionSheet = ref(false);
const editingRoutineIndex = ref<number | null>(null);
const showSelectRoutineModal = ref(false);

const canSave = computed(() => {
  return programName.value.trim().length > 0 && routines.value.length > 0;
});

const addRoutineButtons = computed(() => [
  {
    text: "Create New Routine",
    handler: () => {
      showAddRoutineActionSheet.value = false;
      createNewRoutine();
    },
  },
  {
    text: "Add Existing Routine",
    handler: () => {
      showAddRoutineActionSheet.value = false;
      showSelectRoutineModal.value = true;
    },
  },
  {
    text: "Cancel",
    role: "cancel",
    handler: () => {},
  },
]);

function createNewRoutine() {
  const newRoutine: WorkoutRoutine = {
    id: generateId(),
    name: `Routine ${routines.value.length + 1}`,
    description: "",
    exercises: [],
    type: "custom",
    isCustom: true, // Mark as custom routine created within program
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  routines.value.push(newRoutine);
  editingRoutineIndex.value = routines.value.length - 1;
}

function handleAddExistingRoutine(routine: WorkoutRoutine) {
  // Helper to convert Date to ISO string
  const toISOString = (date: Date | string | undefined): string => {
    if (!date) return new Date().toISOString();
    if (date instanceof Date) return date.toISOString();
    return date;
  };

  // Copy routine with new ID to avoid reference issues
  // Ensure all dates are serialized to ISO strings
  // Mark as custom since it's being added to a custom program
  const copiedRoutine: WorkoutRoutine = {
    ...routine,
    id: generateId(),
    isCustom: true, // Mark as custom routine when added to program
    exercises: routine.exercises.map((ex) => ({
      ...ex,
      id: generateId(),
    })),
    createdAt: toISOString(routine.createdAt),
    updatedAt: new Date().toISOString(),
  };
  routines.value.push(copiedRoutine);
  showSelectRoutineModal.value = false;
}

function editRoutine(index: number) {
  editingRoutineIndex.value = index;
}

function handleSaveRoutine(updatedRoutine: WorkoutRoutine) {
  if (editingRoutineIndex.value !== null) {
    // Helper to convert Date to ISO string
    const toISOString = (date: Date | string | undefined): string => {
      if (!date) return new Date().toISOString();
      if (date instanceof Date) return date.toISOString();
      return date;
    };

    routines.value[editingRoutineIndex.value] = {
      ...updatedRoutine,
      isCustom: true, // Ensure it's marked as custom
      createdAt: toISOString(updatedRoutine.createdAt),
      updatedAt: new Date().toISOString(),
    };
    editingRoutineIndex.value = null;
  }
}

function deleteRoutine(index: number) {
  routines.value.splice(index, 1);
}

function moveRoutineUp(index: number) {
  if (index > 0) {
    const temp = routines.value[index];
    routines.value[index] = routines.value[index - 1];
    routines.value[index - 1] = temp;
  }
}

function moveRoutineDown(index: number) {
  if (index < routines.value.length - 1) {
    const temp = routines.value[index];
    routines.value[index] = routines.value[index + 1];
    routines.value[index + 1] = temp;
  }
}

function handleSave() {
  if (!canSave.value) return;

  emit("save", {
    name: programName.value.trim(),
    description: programDescription.value.trim() || undefined,
    routines: routines.value,
  });
}

function handleClose() {
  // Reset form
  programName.value = "";
  programDescription.value = "";
  routines.value = [];
  editingRoutineIndex.value = null;
  showAddRoutineActionSheet.value = false;
  showSelectRoutineModal.value = false;
  emit("close");
}
</script>

<style scoped>
.program-info-section {
  margin-bottom: var(--spacing-xl);
}

.routines-section {
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

.routine-item {
  margin-bottom: var(--spacing-sm);
  border-radius: var(--radius-button);
  border: 1px solid var(--color-border);
}

.routine-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.routine-header h4 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.routine-exercises-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}

.routine-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-xs);
}

.routine-actions {
  display: flex;
  gap: var(--spacing-xs);
  align-items: center;
}

.button-group {
  margin-top: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
}
</style>

