<template>
  <ion-modal
    :is-open="isOpen"
    @did-dismiss="handleDismiss"
    class="workout-template-modal"
  >
    <ion-header>
      <ion-toolbar>
        <ion-title>Select Workout Template</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleDismiss" fill="clear">
            <ion-icon slot="icon-only" :icon="closeOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="modal-content">
      <WorkoutTemplateSelector :templates="templates" @select="handleSelect" />
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
} from "@ionic/vue";
import { closeOutline } from "ionicons/icons";
import type { WorkoutTemplate } from "../types/workout.types";
import WorkoutTemplateSelector from "./WorkoutTemplateSelector.vue";

interface Props {
  isOpen: boolean;
  templates: WorkoutTemplate[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  select: [template: WorkoutTemplate];
  dismiss: [];
}>();

function handleSelect(template: WorkoutTemplate) {
  emit("select", template);
}

function handleDismiss() {
  emit("dismiss");
}
</script>

<style scoped>
.workout-template-modal {
  --width: 100%;
  --max-width: 600px;
  --height: 90%;
  --border-radius: var(--radius-xl);
}

.modal-content {
  --padding-start: var(--spacing-base);
  --padding-end: var(--spacing-base);
  --padding-top: var(--spacing-md);
  --padding-bottom: var(--spacing-base);
}

ion-toolbar {
  --background: var(--color-background-elevated);
  --color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border);
}

ion-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}
</style>
