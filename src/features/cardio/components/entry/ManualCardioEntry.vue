<template>
  <ion-modal :is-open="isOpen" @didDismiss="$emit('close')">
    <ion-header>
      <ion-toolbar>
        <ion-title>Manual Cardio Entry</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('close')">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <form @submit.prevent="handleSubmit">
        <ion-list>
          <ion-item>
            <ion-label position="stacked">Distance</ion-label>
            <ion-input
              v-model="formData.distance"
              type="number"
              :placeholder="isImperial ? 'Miles' : 'Kilometers'"
              required
            />
            <ion-note slot="helper">{{ isImperial ? "miles" : "km" }}</ion-note>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Duration</ion-label>
            <ion-input
              v-model="formData.durationHours"
              type="number"
              placeholder="Hours"
              min="0"
              max="23"
            />
            <ion-input
              v-model="formData.durationMinutes"
              type="number"
              placeholder="Minutes"
              min="0"
              max="59"
              required
            />
            <ion-input
              v-model="formData.durationSeconds"
              type="number"
              placeholder="Seconds"
              min="0"
              max="59"
            />
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Calories (optional)</ion-label>
            <ion-input
              v-model="formData.calories"
              type="number"
              placeholder="Calories"
              min="0"
            />
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Date</ion-label>
            <ion-datetime
              v-model="formData.date"
              presentation="date"
              :max="maxDate"
            />
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Notes (optional)</ion-label>
            <ion-textarea
              v-model="formData.notes"
              placeholder="Add notes about your workout..."
              rows="3"
            />
          </ion-item>
        </ion-list>

        <div class="ion-padding">
          <ion-button expand="block" type="submit" :disabled="!isValid">
            Save Workout
          </ion-button>
        </div>
      </form>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
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
  IonInput,
  IonNote,
  IonTextarea,
  IonDatetime,
} from "@ionic/vue";
import { useCardioSettings } from "../../composables/useCardioSettings";
import { CardioRepository } from "../../repositories/cardio.repository";
import { RouteCalculatorService } from "../../services/route-calculator.service";
import { generateId } from "@/shared/utils/id";
import type { Workout } from "@/features/workouts/types/workout.types";
import type { CardioData } from "../../types/cardio.types";

interface Props {
  isOpen: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  saved: [workout: Workout];
}>();

const { settings, isImperial } = useCardioSettings();

const formData = ref({
  distance: "",
  durationHours: "0",
  durationMinutes: "",
  durationSeconds: "0",
  calories: "",
  date: new Date().toISOString().split("T")[0],
  notes: "",
});

const maxDate = new Date().toISOString();

const isValid = computed(() => {
  return (
    formData.value.distance &&
    parseFloat(formData.value.distance) > 0 &&
    (formData.value.durationMinutes ||
      formData.value.durationHours ||
      formData.value.durationSeconds)
  );
});

watch(
  () => props.isOpen,
  async (open) => {
    if (open) {
      await settings.loadSettings();
      // Reset form
      formData.value = {
        distance: "",
        durationHours: "0",
        durationMinutes: "",
        durationSeconds: "0",
        calories: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      };
    }
  }
);

async function handleSubmit() {
  if (!isValid.value) {
    return;
  }

  try {
    // Convert distance to meters
    const distanceInput = parseFloat(formData.value.distance);
    const distanceMeters = isImperial.value
      ? distanceInput * 1609.34
      : distanceInput * 1000;

    // Calculate duration in seconds
    const hours = parseInt(formData.value.durationHours) || 0;
    const minutes = parseInt(formData.value.durationMinutes) || 0;
    const seconds = parseInt(formData.value.durationSeconds) || 0;
    const durationSeconds = hours * 3600 + minutes * 60 + seconds;

    // Calculate pace
    const pace = RouteCalculatorService.calculatePace(
      distanceMeters,
      durationSeconds,
      isImperial.value
    );

    // Create cardio data
    const cardioData: CardioData = {
      distance: distanceMeters,
      averagePace: pace,
      elevationGain: 0,
      calories: formData.value.calories
        ? parseInt(formData.value.calories)
        : RouteCalculatorService.estimateCalories(
            distanceMeters,
            durationSeconds
          ),
      route: [],
      trackingMode: "manual",
    };

    // Create workout
    const workoutDate = new Date(formData.value.date);
    const workout: Workout = {
      id: generateId(),
      name: "Cardio Workout",
      type: "cardio-manual",
      exercises: [],
      cardioData,
      startTime: workoutDate.toISOString(),
      endTime: new Date(
        workoutDate.getTime() + durationSeconds * 1000
      ).toISOString(),
      notes: formData.value.notes || undefined,
      completed: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save workout
    await CardioRepository.save(workout);

    emit("saved", workout);
    emit("close");
  } catch (error) {
    console.error("Failed to save manual cardio entry:", error);
    // TODO: Show error toast
  }
}
</script>

<style scoped>
ion-item {
  --padding-start: var(--spacing-base);
  --padding-end: var(--spacing-base);
}
</style>

