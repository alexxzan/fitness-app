<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Exercise Library</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="showAddModal = true">
            <ion-icon :icon="add" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <SearchBar
        v-model="searchQuery"
        placeholder="Search exercises..."
        @update:modelValue="handleSearch"
      />

      <div v-if="isLoading" class="loading">
        <ion-spinner />
      </div>

      <div v-else-if="filteredExercises.length === 0" class="empty-state">
        <p>No exercises found</p>
      </div>

      <div v-else class="exercise-list">
        <ExerciseCard
          v-for="exercise in filteredExercises"
          :key="exercise.exerciseId"
          :exercise="exercise"
          @click="viewExercise(exercise)"
        />
      </div>
    </ion-content>

    <!-- Add Exercise Modal -->
    <ion-modal :is-open="showAddModal" @did-dismiss="showAddModal = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Add Exercise</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showAddModal = false">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <FormField
          v-model="newExercise.name"
          label="Exercise Name"
          placeholder="e.g., Bench Press"
        />
        <div class="button-group">
          <AppButton expand="block" @click="handleAddExercise"
            >Add Exercise</AppButton
          >
          <AppButton expand="block" fill="outline" @click="showAddModal = false"
            >Cancel</AppButton
          >
        </div>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonModal,
} from "@ionic/vue";
import { add } from "ionicons/icons";
import { useExerciseLibrary } from "@/features/exercises/composables/useExerciseLibrary";
import { useExercise } from "@/features/exercises/composables/useExercise";
import ExerciseCard from "@/features/exercises/components/ExerciseCard.vue";
import SearchBar from "@/components/molecules/SearchBar.vue";
import FormField from "@/components/molecules/FormField.vue";
import AppButton from "@/components/atoms/AppButton.vue";

const {
  exercises,
  filteredExercises,
  isLoading,
  searchQuery,
  loadExercises,
  searchExercises,
} = useExerciseLibrary();

const { createExercise } = useExercise();

const showAddModal = ref(false);
const newExercise = ref<{
  name: string;
  bodyParts: string[];
  equipments: string[];
  targetMuscles: string[];
}>({
  name: "",
  bodyParts: [],
  equipments: [],
  targetMuscles: [],
});

onMounted(async () => {
  await loadExercises();
});

function handleSearch() {
  if (searchQuery.value) {
    searchExercises({ searchQuery: searchQuery.value });
  } else {
    loadExercises();
  }
}

async function handleAddExercise() {
  if (!newExercise.value.name.trim()) return;

  try {
    await createExercise({
      name: newExercise.value.name.trim(),
      bodyParts: newExercise.value.bodyParts,
      equipments: newExercise.value.equipments,
      targetMuscles: newExercise.value.targetMuscles,
      secondaryMuscles: [],
      instructions: [],
      gifUrl: "",
    });
    await loadExercises();
    newExercise.value = {
      name: "",
      bodyParts: [],
      equipments: [],
      targetMuscles: [],
    };
    showAddModal.value = false;
  } catch (error) {
    console.error("Failed to create exercise:", error);
  }
}

function viewExercise(exercise: any) {
  // Navigate to exercise detail page (to be implemented)
  console.log("View exercise:", exercise);
}
</script>

<style scoped>
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  padding: var(--spacing-xl);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
  font-size: var(--typography-body-size);
}

.empty-state p {
  margin: 0;
}

.exercise-list {
  padding: var(--spacing-base);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}
</style>
