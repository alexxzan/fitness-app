<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>Exercise Library</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Search Bar -->
      <div class="search-container">
        <ion-searchbar
          v-model="searchQuery"
          placeholder="Search exercises..."
          :debounce="300"
          @ion-input="handleSearch"
          @ion-clear="handleSearch"
        />
        <ion-button
          fill="clear"
          class="filter-button"
          @click="showFilterModal = true"
        >
          <ion-icon :icon="filter" slot="icon-only" />
        </ion-button>
      </div>

      <!-- Active Filter Summary -->
      <div v-if="activeFilterCount > 0" class="active-filters-summary">
        <div class="active-filters-chips">
          <ion-chip
            v-for="bodyPart in selectedBodyParts"
            :key="`bodyPart-${bodyPart}`"
            color="primary"
            class="filter-chip"
            @click="removeFilter('bodyParts', bodyPart)"
          >
            <ion-label>{{ formatName(bodyPart) }}</ion-label>
            <ion-icon :icon="close" />
          </ion-chip>
          <ion-chip
            v-for="equipment in selectedEquipments"
            :key="`equipment-${equipment}`"
            color="primary"
            class="filter-chip"
            @click="removeFilter('equipments', equipment)"
          >
            <ion-label>{{ formatName(equipment) }}</ion-label>
            <ion-icon :icon="close" />
          </ion-chip>
          <ion-chip
            v-for="muscle in selectedTargetMuscles"
            :key="`muscle-${muscle}`"
            color="primary"
            class="filter-chip"
            @click="removeFilter('targetMuscles', muscle)"
          >
            <ion-label>{{ formatName(muscle) }}</ion-label>
            <ion-icon :icon="close" />
          </ion-chip>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <ion-skeleton-text
          v-for="i in 6"
          :key="i"
          animated
          style="
            width: 100%;
            height: 150px;
            margin-bottom: 16px;
            border-radius: 8px;
          "
        />
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredExercises.length === 0" class="empty-state">
        <ion-card>
          <ion-card-content>
            <ion-icon :icon="searchOutline" size="large" />
            <h2>No exercises found</h2>
            <p>Try adjusting your search or filters</p>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Exercise List -->
      <ExerciseListWithSearch
        v-else
        :exercises="filteredExercises"
        :favorite-ids="favoriteIds"
        :can-add-to-workout="canAddToWorkout"
        :show-search="false"
        :show-badges="true"
        :is-loading="false"
        @exercise-click="handleExerciseClick"
        @toggle-favorite="handleToggleFavorite"
        @add-to-workout="handleAddToWorkout"
      />
    </ion-content>

    <!-- Exercise Detail Modal -->
    <ExerciseDetailModal
      :is-open="showDetailModal"
      :exercise="selectedExercise"
      :is-favorite="
        selectedExercise ? isFavorite(selectedExercise.exerciseId) : false
      "
      :can-add-to-workout="canAddToWorkout"
      @close="showDetailModal = false"
      @add-to-workout="handleAddToWorkout"
      @toggle-favorite="handleToggleFavorite"
    />

    <!-- Filter Modal -->
    <ExerciseFiltersModal
      :is-open="showFilterModal"
      :selected-body-parts="selectedBodyParts"
      :selected-equipments="selectedEquipments"
      :selected-target-muscles="selectedTargetMuscles"
      @apply="handleFiltersApply"
      @cancel="showFilterModal = false"
    />
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
  IonBackButton,
  IonIcon,
  IonSearchbar,
  IonCard,
  IonCardContent,
  IonChip,
  IonLabel,
  IonSkeletonText,
} from "@ionic/vue";
import { searchOutline, filter, close } from "ionicons/icons";
import { useExerciseLibrary } from "@/features/exercises/composables/useExerciseLibrary";
import { useExerciseFavorites } from "@/features/exercises/composables/useExerciseFavorites";
import { useExerciseStats } from "@/features/exercises/composables/useExerciseStats";
import { useWorkout } from "@/features/workouts/composables/useWorkout";
import ExerciseListWithSearch from "@/features/exercises/components/library/ExerciseListWithSearch.vue";
import ExerciseDetailModal from "@/features/exercises/components/detail/ExerciseDetailModal.vue";
import ExerciseFiltersModal from "@/features/exercises/components/filters/ExerciseFiltersModal.vue";
import type { Exercise } from "@/features/exercises/types/exercise.types";

// Composables
const {
  filteredExercises,
  isLoading,
  searchQuery,
  selectedBodyParts,
  selectedEquipments,
  selectedTargetMuscles,
  loadExercises,
  searchExercises,
  applyFilters,
} = useExerciseLibrary();

const {
  favoriteIds,
  isFavorite: checkFavorite,
  toggleFavorite: toggleFavoriteAction,
} = useExerciseFavorites();

const { trackExerciseView } = useExerciseStats();

const { currentWorkout, addExercise, loadActiveWorkout } = useWorkout();

// Local state
const showDetailModal = ref(false);
const showFilterModal = ref(false);
const selectedExercise = ref<Exercise | null>(null);

// Computed
const canAddToWorkout = computed(() => !!currentWorkout.value);

const activeFilterCount = computed(() => {
  return (
    selectedBodyParts.value.length +
    selectedEquipments.value.length +
    selectedTargetMuscles.value.length
  );
});

// Methods
function formatName(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function isFavorite(exerciseId: string): boolean {
  return checkFavorite(exerciseId);
}

async function handleSearch() {
  if (searchQuery.value) {
    await searchExercises({ searchQuery: searchQuery.value });
  } else {
    await loadExercises();
  }
}

async function handleFiltersChanged() {
  await applyFilters();
}

async function handleFiltersApply(filters: {
  bodyParts: string[];
  equipments: string[];
  targetMuscles: string[];
}) {
  selectedBodyParts.value = filters.bodyParts;
  selectedEquipments.value = filters.equipments;
  selectedTargetMuscles.value = filters.targetMuscles;
  showFilterModal.value = false;
  await handleFiltersChanged();
}

function removeFilter(
  category: "bodyParts" | "equipments" | "targetMuscles",
  name: string
) {
  switch (category) {
    case "bodyParts": {
      selectedBodyParts.value = selectedBodyParts.value.filter(
        (bp) => bp !== name
      );
      break;
    }
    case "equipments": {
      selectedEquipments.value = selectedEquipments.value.filter(
        (eq) => eq !== name
      );
      break;
    }
    case "targetMuscles": {
      selectedTargetMuscles.value = selectedTargetMuscles.value.filter(
        (tm) => tm !== name
      );
      break;
    }
  }
  handleFiltersChanged();
}

function handleExerciseClick(exercise: Exercise) {
  selectedExercise.value = exercise;
  showDetailModal.value = true;
  trackExerciseView(exercise.exerciseId);
}

async function handleToggleFavorite(exercise: Exercise) {
  await toggleFavoriteAction(exercise.exerciseId);
}

function handleAddToWorkout(exercise: Exercise) {
  if (currentWorkout.value) {
    try {
      addExercise(exercise.exerciseId, exercise.name);
    } catch (error) {
      console.error("Failed to add exercise to workout:", error);
    }
  }
}

// Lifecycle
onMounted(async () => {
  await loadExercises();
  await loadActiveWorkout();
});
</script>

<style scoped>
.search-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-base);
  background: var(--color-surface);
}

.search-container ion-searchbar {
  flex: 1;
}

.filter-button {
  flex-shrink: 0;
}

.active-filters-summary {
  padding: var(--spacing-sm) var(--spacing-base);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.active-filters-chips {
  display: flex;
  gap: var(--spacing-xs);
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 2px;
}

.filter-chip {
  cursor: pointer;
  transition: var(--transition-all);
  flex-shrink: 0;
  white-space: nowrap;
}

.filter-chip ion-icon {
  margin-left: var(--spacing-xs);
}

.loading-container {
  padding: var(--spacing-base);
}

.empty-state {
  padding: var(--spacing-2xl);
  text-align: center;
}

.empty-state ion-card {
  max-width: 400px;
  margin: 0 auto;
}

.empty-state ion-icon {
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-base);
}

.empty-state h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin: var(--spacing-base) 0 var(--spacing-sm);
  color: var(--color-text-primary);
}

.empty-state p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  margin: 0;
}
</style>
