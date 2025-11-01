<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Routines</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="showAddMenu = true">
            <ion-icon :icon="add" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

      <!-- Search and Filter -->
      <ion-toolbar>
        <ion-searchbar
          v-model="searchQuery"
          placeholder="Search routines"
          @ion-input="handleSearch"
        />
      </ion-toolbar>

      <ion-toolbar>
        <ion-segment v-model="selectedFilter" @ion-change="handleFilterChange">
          <ion-segment-button value="all">
            <ion-label>All</ion-label>
          </ion-segment-button>
          <ion-segment-button value="custom">
            <ion-label>Custom</ion-label>
          </ion-segment-button>
          <ion-segment-button value="template">
            <ion-label>Templates</ion-label>
          </ion-segment-button>
          <ion-segment-button value="favorites">
            <ion-label>⭐ Favorites</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="filteredRoutines.length === 0" class="empty-state">
        <p v-if="searchQuery">No routines found matching "{{ searchQuery }}"</p>
        <p v-else>No routines yet. Create one to get started!</p>
        <ion-button @click="showAddMenu = true">Add Routine</ion-button>
      </div>

      <ion-list v-else>
        <ion-item-sliding v-for="routine in filteredRoutines" :key="routine.id">
          <ion-item button @click="viewRoutine(routine)">
            <ion-label>
              <h2>
                {{ routine.name }}
                <ion-badge
                  v-if="routine.type === 'template'"
                  color="primary"
                  class="type-badge"
                >
                  Template
                </ion-badge>
                <ion-badge
                  v-if="routine.difficulty"
                  :color="getDifficultyColor(routine.difficulty)"
                  class="type-badge"
                >
                  {{ routine.difficulty }}
                </ion-badge>
              </h2>
              <p>{{ routine.exercises.length }} exercises</p>
              <p v-if="routine.description" class="description">
                {{ routine.description }}
              </p>
              <p v-if="routine.estimatedDuration" class="meta">
                ~{{ routine.estimatedDuration }} min
              </p>
            </ion-label>
            <ion-icon
              v-if="routine.isFavorite"
              :icon="star"
              slot="end"
              color="warning"
              @click.stop="toggleFavorite(routine.id)"
            />
            <ion-icon
              v-else
              :icon="starOutline"
              slot="end"
              color="medium"
              @click.stop="toggleFavorite(routine.id)"
            />
          </ion-item>

          <ion-item-options side="end">
            <ion-item-option color="warning" @click="editRoutine(routine)">
              <ion-icon :icon="create" slot="icon-only" />
            </ion-item-option>
            <ion-item-option color="danger" @click="confirmDelete(routine)">
              <ion-icon :icon="trash" slot="icon-only" />
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>
    </ion-content>

    <!-- Add Menu Action Sheet -->
    <ion-action-sheet
      :is-open="showAddMenu"
      header="Add Routine"
      :buttons="addMenuButtons"
      @did-dismiss="showAddMenu = false"
    />

    <!-- Import from Template Modal -->
    <ion-modal
      :is-open="showTemplateSelector"
      @did-dismiss="showTemplateSelector = false"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title>Import from Template</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showTemplateSelector = false">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-list>
          <ion-item
            v-for="template in templates"
            :key="template.id"
            button
            @click="importTemplate(template)"
          >
            <ion-label>
              <h2>{{ template.name }}</h2>
              <p>
                {{ template.exercises.length }} exercises •
                {{ template.durationWeeks }} weeks
              </p>
              <p>{{ template.description }}</p>
              <ion-badge :color="getDifficultyColor(template.difficulty)">
                {{ template.difficulty }}
              </ion-badge>
            </ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-modal>

    <!-- Routine Details Modal -->
    <ion-modal
      :is-open="showDetailsModal"
      @did-dismiss="showDetailsModal = false"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ selectedRoutine?.name }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showDetailsModal = false">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding" v-if="selectedRoutine">
        <div class="routine-details">
          <p v-if="selectedRoutine.description" class="description">
            {{ selectedRoutine.description }}
          </p>

          <div class="meta-info">
            <ion-chip v-if="selectedRoutine.difficulty">
              <ion-label>{{ selectedRoutine.difficulty }}</ion-label>
            </ion-chip>
            <ion-chip v-if="selectedRoutine.estimatedDuration">
              <ion-label
                >~{{ selectedRoutine.estimatedDuration }} min</ion-label
              >
            </ion-chip>
            <ion-chip>
              <ion-label>{{ selectedRoutine.type }}</ion-label>
            </ion-chip>
          </div>

          <h3>Exercises</h3>
          <ion-list>
            <ion-item
              v-for="exercise in selectedRoutine.exercises"
              :key="exercise.id"
            >
              <ion-label>
                <h4>{{ exercise.exerciseName }}</h4>
                <p v-if="exercise.targetSets && exercise.targetReps">
                  {{ exercise.targetSets }} sets ×
                  {{ exercise.targetReps }} reps
                </p>
                <p v-if="exercise.notes" class="notes">{{ exercise.notes }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Delete Confirmation Alert -->
    <ion-alert
      :is-open="showDeleteAlert"
      header="Delete Routine"
      :message="`Are you sure you want to delete '${routineToDelete?.name}'?`"
      :buttons="deleteAlertButtons"
      @did-dismiss="showDeleteAlert = false"
    />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonModal,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonBadge,
  IonActionSheet,
  IonAlert,
  IonChip,
} from "@ionic/vue";
import { add, star, starOutline, create, trash } from "ionicons/icons";
import { useRoutine } from "@/features/workouts/composables/useRoutine";
import type {
  WorkoutRoutine,
  WorkoutTemplate,
} from "@/features/workouts/types/workout.types";

const {
  routines,
  templates,
  loadRoutines,
  deleteRoutine,
  toggleFavorite: toggleRoutineFavorite,
  searchRoutines,
  getFavoriteRoutines,
  getRoutinesByType,
  createRoutineFromTemplate,
} = useRoutine();

const searchQuery = ref("");
const selectedFilter = ref("all");
const showAddMenu = ref(false);
const showTemplateSelector = ref(false);
const showDetailsModal = ref(false);
const showDeleteAlert = ref(false);
const selectedRoutine = ref<WorkoutRoutine | null>(null);
const routineToDelete = ref<WorkoutRoutine | null>(null);

const filteredRoutines = computed(() => {
  let filtered = routines.value;

  // Apply search
  if (searchQuery.value) {
    filtered = searchRoutines(searchQuery.value);
  }

  // Apply type filter
  switch (selectedFilter.value) {
    case "custom":
      filtered = filtered.filter((r) => r.type === "custom");
      break;
    case "template":
      filtered = filtered.filter((r) => r.type === "template");
      break;
    case "favorites":
      filtered = filtered.filter((r) => r.isFavorite);
      break;
  }

  return filtered;
});

const addMenuButtons = [
  {
    text: "From Template",
    handler: () => {
      showTemplateSelector.value = true;
    },
  },
  {
    text: "Create Custom",
    handler: () => {
      // TODO: Navigate to custom routine creation
      console.log("Create custom routine");
    },
  },
  {
    text: "Cancel",
    role: "cancel",
  },
];

const deleteAlertButtons = [
  {
    text: "Cancel",
    role: "cancel",
  },
  {
    text: "Delete",
    role: "destructive",
    handler: async () => {
      if (routineToDelete.value) {
        await deleteRoutine(routineToDelete.value.id);
        routineToDelete.value = null;
      }
    },
  },
];

onMounted(async () => {
  await loadRoutines();
});

function handleSearch() {
  // Search is reactive through computed property
}

function handleFilterChange(event: CustomEvent) {
  selectedFilter.value = event.detail.value;
}

function viewRoutine(routine: WorkoutRoutine) {
  selectedRoutine.value = routine;
  showDetailsModal.value = true;
}

function editRoutine(routine: WorkoutRoutine) {
  // TODO: Navigate to edit page
  console.log("Edit routine:", routine);
}

async function toggleFavorite(routineId: string) {
  await toggleRoutineFavorite(routineId);
}

function confirmDelete(routine: WorkoutRoutine) {
  routineToDelete.value = routine;
  showDeleteAlert.value = true;
}

async function importTemplate(template: WorkoutTemplate) {
  await createRoutineFromTemplate(template);
  showTemplateSelector.value = false;
  await loadRoutines();
}

function getDifficultyColor(difficulty: string) {
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
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
  font-size: var(--typography-body-size);
}

.empty-state p {
  margin: 0 0 var(--spacing-md) 0;
}

.description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-xs);
}

.meta {
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

.type-badge {
  margin-left: var(--spacing-xs);
  font-size: var(--font-size-xs);
}

.routine-details {
  padding: var(--spacing-md) 0;
}

.routine-details h3 {
  margin: var(--spacing-lg) 0 var(--spacing-md) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.meta-info {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  margin: var(--spacing-md) 0;
}

.notes {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-style: italic;
}
</style>
