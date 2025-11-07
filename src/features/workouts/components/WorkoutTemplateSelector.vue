<template>
  <div class="workout-template-selector">
    <!-- Search Section -->
    <div class="search-section">
      <SearchBar
        v-model="searchQuery"
        placeholder="Search workout templates..."
        @clear="handleClear"
        class="search-bar"
      />
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-label">Filter by difficulty:</div>
      <div class="difficulty-filters">
        <AppButton
          v-for="difficulty in difficultyOptions"
          :key="difficulty.value"
          :fill="selectedDifficulty === difficulty.value ? 'solid' : 'outline'"
          size="small"
          :color="getDifficultyColor(difficulty.value)"
          @click="toggleDifficulty(difficulty.value)"
          class="filter-button"
        >
          {{ difficulty.label }}
        </AppButton>
      </div>
    </div>

    <!-- Results Count -->
    <div v-if="filteredTemplates.length > 0" class="results-count">
      {{ filteredTemplates.length }} template{{
        filteredTemplates.length !== 1 ? "s" : ""
      }}
      found
    </div>

    <!-- Template Cards -->
    <div class="templates-grid">
      <div
        v-for="template in filteredTemplates"
        :key="template.id"
        class="template-card"
        @click="selectTemplate(template)"
      >
        <div class="template-card-header">
          <h3 class="template-name">{{ template.name }}</h3>
          <div class="template-badges">
            <AppBadge
              :color="getDifficultyColor(template.difficulty)"
              class="difficulty-badge"
            >
              {{ capitalizeFirst(template.difficulty) }}
            </AppBadge>
          </div>
        </div>

        <p class="template-description">{{ template.description }}</p>

        <div class="template-stats">
          <div class="stat-item">
            <ion-icon :icon="calendarOutline" class="stat-icon" />
            <span class="stat-text"
              >{{ template.durationWeeks }} week{{
                template.durationWeeks !== 1 ? "s" : ""
              }}</span
            >
          </div>
          <div class="stat-item">
            <ion-icon :icon="barbellOutline" class="stat-icon" />
            <span class="stat-text"
              >{{ template.workouts.length }} workout{{
                template.workouts.length !== 1 ? "s" : ""
              }}</span
            >
          </div>
          <div class="stat-item">
            <ion-icon :icon="fitnessOutline" class="stat-icon" />
            <span class="stat-text"
              >{{ getTotalExercises(template) }} exercises</span
            >
          </div>
        </div>

        <div class="template-card-footer">
          <ion-icon :icon="chevronForwardOutline" class="arrow-icon" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredTemplates.length === 0" class="empty-state">
      <ion-icon :icon="searchOutline" class="empty-icon" />
      <h3 class="empty-title">No templates found</h3>
      <p class="empty-message">
        {{
          searchQuery || selectedDifficulty
            ? "Try adjusting your search or filters"
            : "No workout templates available"
        }}
      </p>
      <AppButton
        v-if="searchQuery || selectedDifficulty"
        fill="outline"
        size="small"
        @click="clearFilters"
        class="clear-filters-button"
      >
        Clear filters
      </AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { IonIcon } from "@ionic/vue";
import {
  calendarOutline,
  barbellOutline,
  fitnessOutline,
  chevronForwardOutline,
  searchOutline,
} from "ionicons/icons";
import type { WorkoutTemplate } from "../types/workout.types";
import SearchBar from "@/components/molecules/SearchBar.vue";
import AppButton from "@/components/atoms/AppButton.vue";
import AppBadge from "@/components/atoms/AppBadge.vue";

interface Props {
  templates: WorkoutTemplate[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  select: [template: WorkoutTemplate];
}>();

const searchQuery = ref("");
const selectedDifficulty = ref<string | null>(null);

const difficultyOptions = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const filteredTemplates = computed(() => {
  let filtered = props.templates;

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (template) =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query)
    );
  }

  // Filter by difficulty
  if (selectedDifficulty.value) {
    filtered = filtered.filter(
      (template) => template.difficulty === selectedDifficulty.value
    );
  }

  return filtered;
});

function toggleDifficulty(difficulty: string) {
  if (selectedDifficulty.value === difficulty) {
    selectedDifficulty.value = null;
  } else {
    selectedDifficulty.value = difficulty;
  }
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "beginner":
      return "success";
    case "intermediate":
      return "warning";
    case "advanced":
      return "danger";
    default:
      return "medium";
  }
}

function selectTemplate(template: WorkoutTemplate) {
  emit("select", template);
}

function handleClear() {
  searchQuery.value = "";
}

function getTotalExercises(template: WorkoutTemplate): number {
  return template.workouts.reduce(
    (total, workout) => total + workout.exercises.length,
    0
  );
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function clearFilters() {
  searchQuery.value = "";
  selectedDifficulty.value = null;
}
</script>

<style scoped>
.workout-template-selector {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding-bottom: var(--spacing-base);
}

/* Search Section */
.search-section {
  padding-top: var(--spacing-xs);
}

.search-bar {
  width: 100%;
}

/* Filter Section */
.filter-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.filter-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

.difficulty-filters {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.filter-button {
  transition: var(--transition-all);
}

.filter-button:hover {
  transform: translateY(-1px);
}

/* Results Count */
.results-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-medium);
}

/* Templates Grid */
.templates-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
}

.template-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: var(--spacing-base);
  cursor: pointer;
  transition: var(--transition-all);
  position: relative;
  overflow: hidden;
}

.template-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(
    90deg,
    var(--color-primary-500),
    var(--color-primary-400)
  );
  opacity: 0;
  transition: var(--transition-opacity);
}

.template-card:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-2px);
}

.template-card:hover::before {
  opacity: 1;
}

.template-card:active {
  transform: translateY(0);
  box-shadow: var(--shadow-card);
}

.template-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.template-name {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  flex: 1;
  line-height: var(--line-height-snug);
}

.template-badges {
  display: flex;
  gap: var(--spacing-xs);
  flex-shrink: 0;
}

.difficulty-badge {
  text-transform: capitalize;
}

.template-description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  margin: 0 0 var(--spacing-md) 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.template-stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-base);
  margin-bottom: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--color-border);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-text-tertiary);
}

.stat-icon {
  font-size: var(--icon-size-base);
  color: var(--color-primary-500);
}

.stat-text {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.template-card-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: var(--spacing-xs);
}

.arrow-icon {
  font-size: var(--icon-size-lg);
  color: var(--color-text-tertiary);
  transition: var(--transition-transform);
}

.template-card:hover .arrow-icon {
  color: var(--color-primary-500);
  transform: translateX(4px);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl) var(--spacing-lg);
  text-align: center;
  min-height: 300px;
}

.empty-icon {
  font-size: 64px;
  color: var(--color-text-tertiary);
  margin-bottom: var(--spacing-lg);
  opacity: 0.5;
}

.empty-title {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.empty-message {
  margin: 0 0 var(--spacing-lg) 0;
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  max-width: 300px;
}

.clear-filters-button {
  margin-top: var(--spacing-sm);
}
</style>
