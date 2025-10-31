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
      <!-- Search Bar with Filter Button -->
      <div class="search-container">
        <ion-searchbar
          v-model="searchQuery"
          placeholder="Search exercises..."
          :debounce="300"
          @ion-input="handleSearch"
          @ion-clear="handleSearch"
        />
        <ion-button
          v-if="activeTab === 'all'"
          fill="clear"
          class="filter-button"
          @click="showFilterModal = true"
        >
          <ion-icon :icon="filter" slot="icon-only" />
        </ion-button>
      </div>

      <!-- Active Filter Summary -->
      <div
        v-if="activeTab === 'all' && activeFilterCount > 0"
        class="active-filters-summary"
      >
        <div class="active-filters-chips">
          <ion-chip
            v-for="bodyPart in selectedBodyParts"
            :key="`bodyPart-${bodyPart}`"
            color="primary"
            class="filter-chip filter-chip-body-parts"
            @click="removeFilter('bodyParts', bodyPart)"
          >
            <ion-label class="chip-prefix">BP</ion-label>
            <ion-label>{{ formatName(bodyPart) }}</ion-label>
            <ion-icon :icon="close" />
          </ion-chip>
          <ion-chip
            v-for="equipment in selectedEquipments"
            :key="`equipment-${equipment}`"
            color="primary"
            class="filter-chip filter-chip-equipment"
            @click="removeFilter('equipments', equipment)"
          >
            <ion-label class="chip-prefix">EQ</ion-label>
            <ion-label>{{ formatName(equipment) }}</ion-label>
            <ion-icon :icon="close" />
          </ion-chip>
          <ion-chip
            v-for="muscle in selectedTargetMuscles"
            :key="`muscle-${muscle}`"
            color="primary"
            class="filter-chip filter-chip-muscles"
            @click="removeFilter('targetMuscles', muscle)"
          >
            <ion-label class="chip-prefix">M</ion-label>
            <ion-label>{{ formatName(muscle) }}</ion-label>
            <ion-icon :icon="close" />
          </ion-chip>
        </div>
      </div>

      <!-- Browse Tabs -->
      <ion-segment v-model="activeTab" @ionChange="handleTabChange">
        <ion-segment-button value="all">
          <ion-label>All</ion-label>
        </ion-segment-button>
        <ion-segment-button value="favorites">
          <ion-label>Favorites</ion-label>
          <ion-badge v-if="favoritesCount > 0" color="danger">{{
            favoritesCount
          }}</ion-badge>
        </ion-segment-button>
        <ion-segment-button value="recent">
          <ion-label>Recent</ion-label>
        </ion-segment-button>
        <ion-segment-button value="mostUsed">
          <ion-label>Most Used</ion-label>
        </ion-segment-button>
        <ion-segment-button value="bodyParts">
          <ion-label>Body Parts</ion-label>
        </ion-segment-button>
      </ion-segment>

      <!-- View Toggle and Sort -->
      <div class="view-controls">
        <ion-select
          v-model="sortBy"
          placeholder="Sort by"
          interface="popover"
          @ionChange="handleSortChange"
        >
          <ion-select-option value="alphabetical"
            >Alphabetical</ion-select-option
          >
          <ion-select-option value="recentlyAdded"
            >Recently Added</ion-select-option
          >
          <ion-select-option value="mostUsed">Most Used</ion-select-option>
          <ion-select-option value="recentlyViewed"
            >Recently Viewed</ion-select-option
          >
        </ion-select>
      </div>

      <!-- Body Parts Accordion View -->
      <div v-if="activeTab === 'bodyParts'" class="body-parts-view">
        <ion-accordion-group>
          <ion-accordion
            v-for="bodyPart in bodyParts"
            :key="bodyPart.name"
            :value="bodyPart.name"
          >
            <ion-item slot="header">
              <ion-label>
                <h2>{{ formatName(bodyPart.name) }}</h2>
                <p>{{ getBodyPartExerciseCount(bodyPart.name) }} exercises</p>
              </ion-label>
            </ion-item>
            <div slot="content" class="accordion-content">
              <ExerciseGrid
                v-if="viewMode === 'grid'"
                :exercises="getExercisesByBodyPart(bodyPart.name)"
                :favorite-ids="favoriteIds"
                :can-add-to-workout="canAddToWorkout"
                @exercise-click="handleExerciseClick"
                @toggle-favorite="handleToggleFavorite"
                @add-to-workout="handleAddToWorkout"
              />
              <ExerciseListView
                v-else
                :exercises="getExercisesByBodyPart(bodyPart.name)"
                :favorite-ids="favoriteIds"
                :can-add-to-workout="canAddToWorkout"
                @exercise-click="handleExerciseClick"
                @toggle-favorite="handleToggleFavorite"
                @add-to-workout="handleAddToWorkout"
              />
            </div>
          </ion-accordion>
        </ion-accordion-group>
      </div>

      <!-- Exercise List/Grid View -->
      <div v-else>
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
        <div v-else-if="displayedExercises.length === 0" class="empty-state">
          <ion-card>
            <ion-card-content>
              <ion-icon :icon="searchOutline" size="large" />
              <h2>No exercises found</h2>
              <p v-if="activeTab === 'favorites'">
                Start favoriting exercises to see them here
              </p>
              <p v-else-if="activeTab === 'recent'">
                Exercise views will appear here
              </p>
              <p v-else>Try adjusting your search or filters</p>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Exercise Grid/List -->
        <template v-else>
          <ExerciseGrid
            v-if="viewMode === 'grid'"
            :exercises="displayedExercises"
            :favorite-ids="favoriteIds"
            :can-add-to-workout="canAddToWorkout"
            @exercise-click="handleExerciseClick"
            @toggle-favorite="handleToggleFavorite"
            @add-to-workout="handleAddToWorkout"
          />
          <ExerciseListView
            v-else
            :exercises="displayedExercises"
            :favorite-ids="favoriteIds"
            :can-add-to-workout="canAddToWorkout"
            @exercise-click="handleExerciseClick"
            @toggle-favorite="handleToggleFavorite"
            @add-to-workout="handleAddToWorkout"
          />

          <!-- Infinite Scroll -->
          <ion-infinite-scroll
            threshold="100px"
            @ionInfinite="handleInfiniteScroll"
          >
            <ion-infinite-scroll-content
              loading-spinner="bubbles"
              loading-text="Loading more exercises..."
            />
          </ion-infinite-scroll>
        </template>
      </div>
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
          <AppButton expand="block" @click="handleAddExercise">
            Add Exercise
          </AppButton>
          <AppButton
            expand="block"
            fill="outline"
            @click="showAddModal = false"
          >
            Cancel
          </AppButton>
        </div>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonBadge,
  IonSelect,
  IonSelectOption,
  IonAccordion,
  IonAccordionGroup,
  IonItem,
  IonSkeletonText,
  IonCard,
  IonCardContent,
  IonModal,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonChip,
} from "@ionic/vue";
import { add, grid, list, searchOutline, filter, close } from "ionicons/icons";
import { useExerciseLibrary } from "@/features/exercises/composables/useExerciseLibrary";
import { useExercise } from "@/features/exercises/composables/useExercise";
import { useExerciseFavorites } from "@/features/exercises/composables/useExerciseFavorites";
import { useExerciseStats } from "@/features/exercises/composables/useExerciseStats";
import { useExerciseViews } from "@/features/exercises/composables/useExerciseViews";
import { useWorkout } from "@/features/workouts/composables/useWorkout";
import ExerciseCard from "@/features/exercises/components/ExerciseCard.vue";
import ExerciseFiltersModal from "@/features/exercises/components/ExerciseFiltersModal.vue";
import ExerciseGrid from "@/features/exercises/components/ExerciseGrid.vue";
import ExerciseListView from "@/features/exercises/components/ExerciseListView.vue";
import ExerciseDetailModal from "@/features/exercises/components/ExerciseDetailModal.vue";
import FormField from "@/components/molecules/FormField.vue";
import AppButton from "@/components/atoms/AppButton.vue";
import type { Exercise } from "@/features/exercises/types/exercise.types";
import bodyPartsData from "@/features/exercises/data/bodyparts.json";
import type { BodyPart } from "@/features/exercises/types/exercise.types";

// Composables
const {
  exercises,
  filteredExercises,
  isLoading,
  searchQuery,
  selectedBodyParts,
  selectedEquipments,
  selectedTargetMuscles,
  loadExercises,
  searchExercises,
  applyFilters,
  loadExercisesByBodyPart,
} = useExerciseLibrary();

const { createExercise } = useExercise();
const {
  favoriteIds,
  isFavorite: checkFavorite,
  favoritesCount,
  toggleFavorite: toggleFavoriteAction,
} = useExerciseFavorites();

const {
  mostUsedExercises,
  recentExerciseIds,
  getUsageCount,
  trackExerciseView,
} = useExerciseStats();

const { viewMode, activeTab, sortBy, setViewMode, setActiveTab, setSortBy } =
  useExerciseViews();

const { currentWorkout, addExercise, loadActiveWorkout } = useWorkout();

// Local state
const showAddModal = ref(false);
const showDetailModal = ref(false);
const showFilterModal = ref(false);
const selectedExercise = ref<Exercise | null>(null);
const bodyParts = ref<BodyPart[]>(bodyPartsData as BodyPart[]);
const currentPage = ref(1);
const itemsPerPage = 50;

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

// Computed
const canAddToWorkout = computed(() => !!currentWorkout.value);

const activeFilterCount = computed(() => {
  return (
    selectedBodyParts.value.length +
    selectedEquipments.value.length +
    selectedTargetMuscles.value.length
  );
});

const displayedExercises = computed(() => {
  let exercisesToDisplay: Exercise[] = [];

  // Filter by active tab
  switch (activeTab.value) {
    case "favorites":
      exercisesToDisplay = exercises.value.filter((ex) =>
        favoriteIds.value.includes(ex.exerciseId)
      );
      break;
    case "recent":
      exercisesToDisplay = exercises.value.filter((ex) =>
        recentExerciseIds.value.includes(ex.exerciseId)
      );
      break;
    case "mostUsed":
      exercisesToDisplay = exercises.value.filter((ex) =>
        mostUsedExercises.value.includes(ex.exerciseId)
      );
      break;
    case "all":
    default:
      exercisesToDisplay = filteredExercises.value;
      break;
  }

  // Apply sorting
  const sorted = [...exercisesToDisplay];
  switch (sortBy.value) {
    case "alphabetical":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "recentlyAdded":
      sorted.sort((a, b) => {
        // Assuming createdAt exists, if not, fallback to alphabetical
        return a.name.localeCompare(b.name);
      });
      break;
    case "mostUsed":
      sorted.sort((a, b) => {
        const aCount = getUsageCount(a.exerciseId);
        const bCount = getUsageCount(b.exerciseId);
        return bCount - aCount;
      });
      break;
    case "recentlyViewed":
      sorted.sort((a, b) => {
        const aIndex = recentExerciseIds.value.indexOf(a.exerciseId);
        const bIndex = recentExerciseIds.value.indexOf(b.exerciseId);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
      break;
  }

  // Pagination
  return sorted.slice(0, currentPage.value * itemsPerPage);
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

function getBodyPartExerciseCount(bodyPart: string): number {
  return exercises.value.filter((ex) => ex.bodyParts.includes(bodyPart)).length;
}

function getExercisesByBodyPart(bodyPart: string): Exercise[] {
  return exercises.value
    .filter((ex) => ex.bodyParts.includes(bodyPart))
    .slice(0, itemsPerPage);
}

async function handleSearch() {
  if (searchQuery.value) {
    await searchExercises({ searchQuery: searchQuery.value });
  } else {
    await loadExercises();
  }
  currentPage.value = 1;
}

function handleTabChange(event: CustomEvent) {
  const tab = event.detail.value;
  setActiveTab(tab as any);
  currentPage.value = 1;
}

function handleViewModeChange(event: CustomEvent) {
  const mode = event.detail.value;
  setViewMode(mode as "grid" | "list");
}

function handleSortChange(event: CustomEvent) {
  const sort = event.detail.value;
  setSortBy(sort as any);
}

async function handleFiltersChanged() {
  await applyFilters();
  currentPage.value = 1;
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
      // Could show a toast notification here
    } catch (error) {
      console.error("Failed to add exercise to workout:", error);
    }
  }
}

function handleInfiniteScroll(event: CustomEvent) {
  setTimeout(() => {
    currentPage.value++;
    (event.target as HTMLIonInfiniteScrollElement).complete();
  }, 500);
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

// Lifecycle
onMounted(async () => {
  await loadExercises();
  await loadActiveWorkout();
});
</script>

<style scoped>
.view-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
  padding: var(--spacing-base);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.view-controls ion-segment {
  flex: 0 0 auto;
}

.view-controls ion-select {
  flex: 1;
  max-width: 200px;
}

.body-parts-view {
  padding: var(--spacing-base);
}

.accordion-content {
  padding: var(--spacing-base);
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

.button-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

ion-segment-button {
  --indicator-color: var(--color-primary);
}

ion-badge {
  margin-left: var(--spacing-xs);
}

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
  position: relative;
  flex-shrink: 0;
}

.filter-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 18px;
  height: 18px;
  font-size: 10px;
  padding: 0 4px;
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
  scrollbar-width: thin;
}

.active-filters-chips::-webkit-scrollbar {
  height: 4px;
}

.active-filters-chips::-webkit-scrollbar-track {
  background: transparent;
}

.active-filters-chips::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 2px;
}

.filter-chip {
  cursor: pointer;
  transition: var(--transition-all);
  flex-shrink: 0;
  white-space: nowrap;
}

.filter-chip:hover {
  opacity: var(--opacity-hover);
}

.filter-chip ion-label {
  display: inline-flex;
  align-items: center;
}

.filter-chip .chip-prefix {
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  opacity: 0.8;
  margin-right: 4px;
  padding-right: 4px;
  border-right: 1px solid rgba(255, 255, 255, 0.3);
}

.filter-chip ion-icon {
  margin-left: var(--spacing-xs);
}
</style>
