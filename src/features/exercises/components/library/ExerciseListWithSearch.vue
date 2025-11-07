<template>
  <div class="exercise-list-with-search">
    <!-- Search Bar -->
    <div v-if="showSearch" class="search-container">
      <ion-searchbar
        v-model="searchQuery"
        placeholder="Search exercises..."
        :debounce="300"
        @ion-input="handleSearchInput"
        @ion-clear="handleSearchClear"
      />
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
          <p>Try adjusting your search</p>
        </ion-card-content>
      </ion-card>
    </div>

    <!-- Exercise List -->
    <template v-else>
      <ExerciseListView
        :exercises="paginatedExercises"
        :favorite-ids="favoriteIds"
        :can-add-to-workout="canAddToWorkout"
        :show-badges="showBadges"
        @exercise-click="handleExerciseClick"
        @toggle-favorite="handleToggleFavorite"
        @add-to-workout="handleAddToWorkout"
      />

      <!-- Infinite Scroll -->
      <ion-infinite-scroll
        threshold="100px"
        :disabled="!hasMoreItems"
        @ionInfinite="handleInfiniteScroll"
      >
        <ion-infinite-scroll-content
          loading-spinner="bubbles"
          loading-text="Loading more exercises..."
        />
      </ion-infinite-scroll>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  IonSearchbar,
  IonSkeletonText,
  IonCard,
  IonCardContent,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
} from "@ionic/vue";
import { searchOutline } from "ionicons/icons";
import ExerciseListView from "./ExerciseListView.vue";
import type { Exercise } from "../../types/exercise.types";

interface Props {
  exercises: Exercise[];
  showSearch?: boolean;
  showBadges?: boolean;
  favoriteIds?: string[];
  canAddToWorkout?: boolean;
  isLoading?: boolean;
}

interface Emits {
  (e: "exercise-click", exercise: Exercise): void;
  (e: "toggle-favorite", exercise: Exercise): void;
  (e: "add-to-workout", exercise: Exercise): void;
  (e: "search", query: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  showSearch: true,
  showBadges: true,
  favoriteIds: () => [],
  canAddToWorkout: false,
  isLoading: false,
});

const emit = defineEmits<Emits>();

// Pagination state
const currentPage = ref(1);
const itemsPerPage = 50;

// Search state
const searchQuery = ref("");

// Filtered exercises based on search
const filteredExercises = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.exercises;
  }

  const query = searchQuery.value.toLowerCase();
  return props.exercises.filter((ex) => {
    if (!ex || !ex.name) return false;
    return (
      ex.name.toLowerCase().includes(query) ||
      (ex.targetMuscles || []).some((m) => m.toLowerCase().includes(query)) ||
      (ex.bodyParts || []).some((bp) => bp.toLowerCase().includes(query)) ||
      (ex.equipments || []).some((eq) => eq.toLowerCase().includes(query))
    );
  });
});

// Paginated exercises
const paginatedExercises = computed(() => {
  return filteredExercises.value.slice(0, currentPage.value * itemsPerPage);
});

// Check if there are more items to load
const hasMoreItems = computed(() => {
  const totalItems = filteredExercises.value.length;
  const itemsShown = currentPage.value * itemsPerPage;
  return itemsShown < totalItems;
});

// Displayed exercises (for template use - same as paginated)
const displayedExercises = computed(() => paginatedExercises.value);

// Watch exercises prop to reset pagination when exercises change
watch(
  () => props.exercises,
  () => {
    currentPage.value = 1;
    // Infinite scroll will be re-enabled automatically via :disabled binding
  }
);

function handleSearchInput() {
  currentPage.value = 1;
  emit("search", searchQuery.value);
}

function handleSearchClear() {
  searchQuery.value = "";
  currentPage.value = 1;
  emit("search", "");
}

function handleExerciseClick(exercise: Exercise) {
  emit("exercise-click", exercise);
}

function handleToggleFavorite(exercise: Exercise) {
  emit("toggle-favorite", exercise);
}

function handleAddToWorkout(exercise: Exercise) {
  emit("add-to-workout", exercise);
}

function handleInfiniteScroll(event: CustomEvent) {
  const infiniteScroll = event.target as HTMLIonInfiniteScrollElement;

  setTimeout(() => {
    // Check if there are more items before incrementing
    const totalItems = filteredExercises.value.length;
    const currentItemsShown = currentPage.value * itemsPerPage;

    if (currentItemsShown < totalItems) {
      currentPage.value++;
    }

    infiniteScroll.complete();

    // Disable infinite scroll if we've shown all items
    const newItemsShown = currentPage.value * itemsPerPage;
    if (newItemsShown >= totalItems) {
      infiniteScroll.disabled = true;
    }
  }, 500);
}

// Expose method to reset pagination (useful when component is reused)
defineExpose({
  resetPagination: () => {
    currentPage.value = 1;
    searchQuery.value = "";
    // Infinite scroll will be re-enabled automatically via :disabled binding
  },
});
</script>

<style scoped>
.exercise-list-with-search {
  width: 100%;
}

.search-container {
  padding: var(--spacing-sm) var(--spacing-base);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
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
