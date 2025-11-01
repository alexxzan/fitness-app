<template>
  <ion-modal :is-open="isOpen" @did-dismiss="emit('close')">
    <ion-header>
      <ion-toolbar>
        <ion-title>Add Workout Program</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="emit('close')">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
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
            <p>{{ template.description }}</p>
            <div class="template-meta">
              <ion-badge :color="getDifficultyColor(template.difficulty)">
                {{ template.difficulty }}
              </ion-badge>
              <span class="duration">{{ template.durationWeeks }} weeks</span>
              <span class="workouts-count">
                {{ template.workouts.length }} workout{{ template.workouts.length !== 1 ? 's' : '' }}
              </span>
            </div>
          </ion-label>
        </ion-item>
      </ion-list>
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
  IonSegment,
  IonSegmentButton,
  IonBadge,
} from "@ionic/vue";
import { useRoutine } from "../composables/useRoutine";
import type { WorkoutTemplate } from "../types/workout.types";

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
  selectTemplate: [template: WorkoutTemplate];
}>();

const { templates } = useRoutine();
const selectedDifficulty = ref<string>("all");

const filteredTemplates = computed(() => {
  if (selectedDifficulty.value === "all") {
    return templates.value;
  }
  return templates.value.filter(
    (t) => t.difficulty === selectedDifficulty.value
  );
});

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
.filter-section {
  margin-bottom: var(--spacing-md);
}

.template-meta {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  margin-top: var(--spacing-xs);
}

.duration,
.workouts-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
</style>

