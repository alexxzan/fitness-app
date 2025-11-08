<template>
  <div class="cardio-controls">
    <ion-button
      v-if="!isActive"
      expand="block"
      color="primary"
      size="large"
      @click="$emit('start')"
    >
      <ion-icon :icon="play" slot="start" />
      Start Workout
    </ion-button>

    <div v-else class="control-buttons">
      <ion-button
        v-if="!isPaused"
        expand="block"
        color="warning"
        @click="$emit('pause')"
      >
        <ion-icon :icon="pause" slot="start" />
        Pause
      </ion-button>

      <ion-button
        v-else
        expand="block"
        color="success"
        @click="$emit('resume')"
      >
        <ion-icon :icon="play" slot="start" />
        Resume
      </ion-button>

      <ion-button
        expand="block"
        color="danger"
        @click="showStopConfirmation = true"
      >
        <ion-icon :icon="stop" slot="start" />
        Stop
      </ion-button>
    </div>

    <ion-alert
      :is-open="showStopConfirmation"
      header="Stop Workout?"
      message="Are you sure you want to stop this workout? It will be saved to your history."
      :buttons="alertButtons"
      @didDismiss="showStopConfirmation = false"
    ></ion-alert>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  IonButton,
  IonIcon,
  IonAlert,
  alertController,
} from "@ionic/vue";
import { play, pause, stop } from "ionicons/icons";

interface Props {
  isActive: boolean;
  isPaused: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  start: [];
  pause: [];
  resume: [];
  stop: [];
}>();

const showStopConfirmation = ref(false);

const alertButtons = [
  {
    text: "Cancel",
    role: "cancel",
  },
  {
    text: "Stop",
    role: "destructive",
    handler: () => {
      emit("stop");
    },
  },
];
</script>

<style scoped>
.cardio-controls {
  padding: var(--spacing-base);
}

.control-buttons {
  display: flex;
  gap: var(--spacing-sm);
}

.control-buttons ion-button {
  flex: 1;
}
</style>

