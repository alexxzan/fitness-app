<template>
  <ion-modal :is-open="isOpen" @did-dismiss="emit('close')">
    <ion-header>
      <ion-toolbar>
        <ion-title>Select Routine</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="emit('close')">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <!-- Tabs for Custom vs Templates -->
      <ion-segment v-model="selectedTab" @ion-change="handleTabChange">
        <ion-segment-button value="custom">
          <ion-label>My Routines</ion-label>
        </ion-segment-button>
        <ion-segment-button value="templates">
          <ion-label>Templates</ion-label>
        </ion-segment-button>
      </ion-segment>

      <!-- Custom Routines -->
      <div v-if="selectedTab === 'custom'" class="section">
        <div v-if="customRoutines.length === 0" class="empty-state">
          <p>No custom routines yet.</p>
          <ion-button @click="emit('createCustom')">Create One</ion-button>
        </div>
        <ion-list v-else>
          <ion-item
            v-for="routine in customRoutines"
            :key="routine.id"
            button
            @click="handleSelectRoutine(routine)"
          >
            <ion-label>
              <h2>{{ routine.name }}</h2>
              <p>{{ routine.exercises.length }} exercises</p>
              <p v-if="routine.description">{{ routine.description }}</p>
            </ion-label>
            <ion-icon
              v-if="routine.isFavorite"
              :icon="star"
              slot="end"
              color="warning"
            />
          </ion-item>
        </ion-list>
      </div>

      <!-- Templates -->
      <div v-if="selectedTab === 'templates'" class="section">
        <div class="filter-section">
          <ion-segment v-model="selectedDifficulty">
            <ion-segment-button value="all">
              <ion-label>All</ion-label>
            </ion-segment-button>
            <ion-segment-button value="beginner">
              <ion-label>Beginner</ion-label>
            </ion-segment-button>
            <ion-segment-button value="intermediate">
              <ion-label>Intermediate</ion-label>
            </ion-segment-button>
            <ion-segment-button value="advanced">
              <ion-label>Advanced</ion-label>
            </ion-segment-button>
          </ion-segment>
        </div>

        <ion-list>
          <ion-item
            v-for="template in filteredTemplates"
            :key="template.id"
            button
            @click="handleSelectTemplate(template)"
          >
            <ion-label>
              <h2>{{ template.name }}</h2>
              <p>{{ template.exercises.length }} exercises</p>
              <p>{{ template.description }}</p>
              <div class="template-meta">
                <ion-badge :color="getDifficultyColor(template.difficulty)">
                  {{ template.difficulty }}
                </ion-badge>
                <span class="duration">{{ template.durationWeeks }} weeks</span>
              </div>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
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
  IonSegment,
  IonSegmentButton,
  IonIcon,
  IonBadge,
} from "@ionic/vue";
import { star } from "ionicons/icons";
import { useRoutine } from "../composables/useRoutine";
import type { WorkoutRoutine, WorkoutTemplate } from "../types/workout.types";

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
  selectRoutine: [routine: WorkoutRoutine];
  selectTemplate: [template: WorkoutTemplate];
  createCustom: [];
}>();

const { routines, templates, loadRoutines, getTemplates } = useRoutine();

const selectedTab = ref<string>("custom");
const selectedDifficulty = ref<string>("all");

const customRoutines = computed(() => {
  return routines.value.filter((r) => r.type === "custom");
});

const filteredTemplates = computed(() => {
  if (selectedDifficulty.value === "all") {
    return templates.value;
  }
  return templates.value.filter(
    (t) => t.difficulty === selectedDifficulty.value
  );
});

onMounted(async () => {
  await loadRoutines();
});

function handleTabChange(event: CustomEvent) {
  selectedTab.value = event.detail.value;
}

function handleSelectRoutine(routine: WorkoutRoutine) {
  emit("selectRoutine", routine);
}

function handleSelectTemplate(template: WorkoutTemplate) {
  emit("selectTemplate", template);
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
.section {
  margin-top: var(--spacing-md);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
}

.filter-section {
  margin-bottom: var(--spacing-md);
}

.template-meta {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  margin-top: var(--spacing-xs);
}

.duration {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
</style>
