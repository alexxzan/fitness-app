<template>
  <ion-modal :is-open="isOpen" @did-dismiss="handleClose">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ title || "Add Exercise" }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleClose">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <!-- Search Bar with Filter Button -->
      <div class="search-filter-container">
        <ion-searchbar
          v-model="searchQuery"
          placeholder="Search exercises..."
          :debounce="300"
          @ion-input="handleSearchInput"
          @ion-clear="handleSearchClear"
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
      <ActiveFiltersSummary
        :selected-body-parts="selectedBodyParts"
        :selected-equipments="selectedEquipments"
        :selected-target-muscles="selectedTargetMuscles"
        @remove-filter="handleRemoveFilter"
      />

      <ExerciseListWithSearch
        ref="exerciseListRef"
        :exercises="filteredAndSearchedExercises"
        :show-search="false"
        :show-badges="false"
        :is-loading="false"
        @exercise-click="handleSelect"
      />
    </ion-content>

    <!-- Filter Modal -->
    <ExerciseFiltersModal
      :is-open="showFilterModal"
      :selected-body-parts="selectedBodyParts"
      :selected-equipments="selectedEquipments"
      :selected-target-muscles="selectedTargetMuscles"
      @apply="handleFiltersApply"
      @cancel="showFilterModal = false"
    />
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
  IonIcon,
  IonSearchbar,
} from "@ionic/vue";
import { filter } from "ionicons/icons";
import ExerciseListWithSearch from "@/features/exercises/components/library/ExerciseListWithSearch.vue";
import ExerciseFiltersModal from "@/features/exercises/components/filters/ExerciseFiltersModal.vue";
import ActiveFiltersSummary from "@/features/exercises/components/filters/ActiveFiltersSummary.vue";
import { useExerciseFilters } from "@/features/exercises/composables/useExerciseFilters";
import type { Exercise } from "@/features/exercises/types/exercise.types";

interface Props {
  isOpen: boolean;
  exercises: Exercise[];
  title?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  select: [exercise: Exercise];
  close: [];
}>();

const exerciseListRef = ref<InstanceType<typeof ExerciseListWithSearch> | null>(
  null
);
const showFilterModal = ref(false);
const searchQuery = ref("");

// Use shared filter composable
const {
  selectedBodyParts,
  selectedEquipments,
  selectedTargetMuscles,
  filteredExercises,
  activeFilterCount,
  applyFilters,
  removeFilter,
  resetFilters,
} = useExerciseFilters(computed(() => props.exercises));

// Combine filter and search
const filteredAndSearchedExercises = computed(() => {
  if (!searchQuery.value.trim()) {
    return filteredExercises.value;
  }

  const query = searchQuery.value.toLowerCase();
  return filteredExercises.value.filter((ex) => {
    if (!ex || !ex.name) return false;
    return (
      ex.name.toLowerCase().includes(query) ||
      (ex.targetMuscles || []).some((m) => m.toLowerCase().includes(query)) ||
      (ex.bodyParts || []).some((bp) => bp.toLowerCase().includes(query)) ||
      (ex.equipments || []).some((eq) => eq.toLowerCase().includes(query))
    );
  });
});

function handleSearchInput() {
  if (exerciseListRef.value) {
    exerciseListRef.value.resetPagination();
  }
}

function handleSearchClear() {
  searchQuery.value = "";
  if (exerciseListRef.value) {
    exerciseListRef.value.resetPagination();
  }
}

// Reset pagination and filters when modal opens
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      if (exerciseListRef.value) {
        exerciseListRef.value.resetPagination();
      }
      // Optionally reset filters when modal opens
      // resetFilters()
    } else {
      // Reset filters and search when modal closes
      resetFilters();
      searchQuery.value = "";
      showFilterModal.value = false;
    }
  }
);

function handleFiltersApply(filters: {
  bodyParts: string[];
  equipments: string[];
  targetMuscles: string[];
}) {
  applyFilters(filters);
  showFilterModal.value = false;
  if (exerciseListRef.value) {
    exerciseListRef.value.resetPagination();
  }
}

function handleRemoveFilter(
  category: "bodyParts" | "equipments" | "targetMuscles",
  name: string
) {
  removeFilter(category, name);
  if (exerciseListRef.value) {
    exerciseListRef.value.resetPagination();
  }
}

function handleSelect(exercise: Exercise) {
  emit("select", exercise);
  emit("close");
}

function handleClose() {
  emit("close");
}
</script>

<style scoped>
.search-filter-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-base);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.search-filter-container ion-searchbar {
  flex: 1;
}

.filter-button {
  flex-shrink: 0;
}
</style>
