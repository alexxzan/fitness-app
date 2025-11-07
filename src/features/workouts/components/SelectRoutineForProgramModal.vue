<template>
  <ion-modal :is-open="isOpen" @did-dismiss="handleClose">
    <ion-header>
      <ion-toolbar>
        <ion-title>Select Routine</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleClose">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div v-if="customRoutines.length === 0" class="empty-state">
        <p>No custom routines yet.</p>
        <p class="empty-hint">
          Create a routine first to add it to your program.
        </p>
      </div>

      <ion-list v-else>
        <ion-item
          v-for="routine in customRoutines"
          :key="routine.id"
          button
          @click="handleSelect(routine)"
        >
          <ion-label>
            <h2>{{ routine.name }}</h2>
            <p>
              {{ routine.exercises.length }} exercise{{
                routine.exercises.length !== 1 ? "s" : ""
              }}
            </p>
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
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
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
  IonIcon,
} from "@ionic/vue";
import { star } from "ionicons/icons";
import { useRoutine } from "../composables/useRoutine";
import type { WorkoutRoutine } from "../types/workout.types";

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  select: [routine: WorkoutRoutine];
  close: [];
}>();

const { routines, loadRoutines } = useRoutine();

const customRoutines = computed(() => {
  // Only show routines that are marked as custom (created within custom programs)
  return routines.value.filter((r) => r.isCustom === true);
});

onMounted(async () => {
  await loadRoutines();
});

function handleSelect(routine: WorkoutRoutine) {
  emit("select", routine);
  emit("close");
}

function handleClose() {
  emit("close");
}
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
}

.empty-hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  margin-top: var(--spacing-sm);
}
</style>
