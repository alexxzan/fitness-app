<template>
  <div class="my-workout-programs-section">
    <div class="section-card">
      <div class="section-header">
        <h2 class="section-title">My Workout Programs</h2>
        <ion-button fill="clear" size="small" @click="$emit('addProgram')">
          <ion-icon :icon="add" slot="start" />
          Add Program
        </ion-button>
      </div>

      <div v-if="programs.length === 0" class="empty-state">
        <p class="empty-text">No workout programs yet</p>
        <p class="empty-hint">Add a template to get started</p>
        <ion-button fill="outline" @click="$emit('addProgram')">
          <ion-icon :icon="add" slot="start" />
          Add Program
        </ion-button>
      </div>

      <div v-else class="programs-list">
        <ion-accordion-group>
          <ion-accordion
            v-for="program in programs"
            :key="program.id"
            :value="program.id"
          >
            <ion-item slot="header" class="program-accordion-header">
              <div class="program-header-content">
                <h3 class="program-name">{{ program.name }}</h3>
                <span class="program-workouts-count">
                  {{ program.workouts.length }} workout{{
                    program.workouts.length !== 1 ? "s" : ""
                  }}
                </span>
              </div>
              <ion-button
                slot="end"
                fill="clear"
                size="small"
                :id="`program-menu-${program.id}`"
                @click.stop="openMenu($event, program)"
              >
                <ion-icon :icon="ellipsisVertical" />
              </ion-button>
            </ion-item>

            <div slot="content" class="accordion-content">
              <p v-if="program.description" class="program-description">
                {{ program.description }}
              </p>
              <div class="workouts-list">
                <div
                  v-for="workout in program.workouts"
                  :key="workout.id"
                  class="workout-item"
                  @click="$emit('startWorkout', workout, program.id)"
                >
                  <div class="workout-info">
                    <span class="workout-name">{{ workout.name }}</span>
                    <span class="workout-exercises"
                      >{{ workout.exercises.length }} exercises</span
                    >
                  </div>
                  <ion-icon :icon="chevronForward" />
                </div>
              </div>
            </div>
          </ion-accordion>
        </ion-accordion-group>
      </div>
    </div>

    <!-- Program Menu -->
    <ContentMenu
      :is-open="menuOpen"
      header="Program Options"
      :items="menuItems"
      @dismiss="closeMenu"
    />
  </div>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonIcon,
  IonItem,
  IonAccordion,
  IonAccordionGroup,
} from "@ionic/vue";
import { add, ellipsisVertical, chevronForward } from "ionicons/icons";
import { ref, computed } from "vue";
import type { WorkoutProgram, WorkoutRoutine } from "../../types/workout.types";
import ContentMenu, {
  type ContentMenuItem,
} from "@/components/molecules/ContentMenu.vue";

interface Props {
  programs?: WorkoutProgram[];
}

const props = withDefaults(defineProps<Props>(), {
  programs: () => [],
});

const emit = defineEmits<{
  addProgram: [];
  startWorkout: [routine: WorkoutRoutine, programId: string];
  removeProgram: [program: WorkoutProgram];
  renameProgram: [program: WorkoutProgram];
  copyProgram: [program: WorkoutProgram];
}>();

// Menu state
const menuOpen = ref(false);
const selectedProgram = ref<WorkoutProgram | null>(null);

const menuItems = computed<ContentMenuItem[]>(() => [
  {
    text: "Rename",
    handler: () => {
      if (selectedProgram.value) {
        emit("renameProgram", selectedProgram.value);
      }
    },
  },
  {
    text: "Copy",
    handler: () => {
      if (selectedProgram.value) {
        emit("copyProgram", selectedProgram.value);
      }
    },
  },
  {
    text: "Delete",
    role: "destructive",
    handler: () => {
      if (selectedProgram.value) {
        emit("removeProgram", selectedProgram.value);
      }
    },
  },
]);

function openMenu(event: Event, program: WorkoutProgram) {
  event.stopPropagation();
  event.preventDefault();
  selectedProgram.value = program;
  menuOpen.value = true;
}

function closeMenu() {
  menuOpen.value = false;
  selectedProgram.value = null;
}
</script>

<style scoped>
.my-workout-programs-section {
  margin-bottom: var(--spacing-lg);
  padding: 0 var(--spacing-base);
}

.section-card {
  background: var(--card-background);
  border-radius: var(--radius-card);
  border: var(--card-border-width) solid var(--card-border-color);
  box-shadow: var(--shadow-card);
  padding: var(--spacing-sm);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-base);
  padding: 0;
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.empty-state {
  padding: var(--spacing-xl) 0;
  text-align: center;
}

.empty-text {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-xs) 0;
}

.empty-hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  margin: 0 0 var(--spacing-md) 0;
}

.programs-list {
  padding: 0;
}

.programs-list :deep(ion-accordion-group) {
  --background: transparent;
}

.programs-list :deep(ion-accordion) {
  --background: transparent;
  margin-bottom: var(--spacing-sm);
}

.programs-list :deep(ion-accordion.accordion-animated),
.programs-list :deep(ion-accordion.accordion-hydrated),
.programs-list :deep(ion-accordion.accordion-collapsed) {
  --background: transparent;
  background: transparent;
}

.programs-list :deep(ion-accordion .accordion-animated),
.programs-list :deep(ion-accordion .accordion-hydrated),
.programs-list :deep(ion-accordion .accordion-collapsed) {
  --background: transparent;
  background: transparent;
}

.programs-list :deep(ion-accordion:last-of-type) {
  margin-bottom: 0;
}

.program-accordion-header {
  --padding-start: var(--spacing-base);
  --inner-padding-end: var(--spacing-base);
  --padding-top: var(--spacing-base);
  --padding-bottom: var(--spacing-base);
  --background: var(--color-background-secondary);
  --border-radius: var(--radius-button);
  --min-height: auto;
  margin-bottom: var(--spacing-sm);
  border-radius: var(--radius-button);
  border: 1px solid var(--color-border);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.program-accordion-header:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.programs-list :deep(ion-accordion.accordion-expanded ion-item) {
  --background: var(--color-background-secondary);
  border-radius: var(--radius-button) var(--radius-button) 0 0;
  border-bottom: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.programs-list :deep(ion-accordion:not(.accordion-expanded) ion-item) {
  --background: var(--color-background-secondary);
}

/* Override iOS accordion default black backgrounds */
.programs-list :deep(.accordion-animated),
.programs-list :deep(.accordion-hydrated),
.programs-list :deep(.accordion-collapsed) {
  background-color: transparent !important;
  --background: transparent !important;
}

.programs-list :deep(ion-item.accordion-animated),
.programs-list :deep(ion-item.accordion-hydrated),
.programs-list :deep(ion-item.accordion-collapsed) {
  --background: var(--color-background-secondary) !important;
  background-color: var(--color-background-secondary) !important;
}

.program-header-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.program-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  transition: color 0.2s ease;
}

.programs-list :deep(ion-accordion.accordion-expanded .program-name) {
  color: var(--color-primary-400);
}

.program-workouts-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.accordion-content {
  padding: var(--spacing-sm);
  background: var(--color-background-secondary);
  border-radius: 0 0 var(--radius-button) var(--radius-button);
}

.program-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-sm) 0;
  line-height: var(--line-height-normal);
}

.workouts-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.workout-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm);
  background: var(--color-background);
  border-radius: var(--radius-button);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 2px solid transparent;
}

.workout-item:hover {
  background: var(--color-surface);
  border-color: var(--color-primary-500);
  border-left-color: var(--color-primary-500);
  box-shadow: 0 2px 4px rgba(29, 185, 84, 0.1);
}

.workout-item:hover .workout-name {
  color: var(--color-primary-400);
}

.workout-item:hover ion-icon {
  color: var(--color-primary-500);
}

.workout-item:active {
  transform: scale(0.98);
}

.workout-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.workout-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  transition: color 0.2s ease;
}

.workout-exercises {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.workout-item ion-icon {
  font-size: 18px;
  color: var(--color-text-tertiary);
}

.delete-item ion-label {
  --color: var(--ion-color-danger);
}
</style>
