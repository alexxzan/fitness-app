<template>
  <ion-modal :is-open="isOpen" @didDismiss="$emit('close')">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ editing ? 'Edit' : 'Add' }} Body Metrics</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('close')">
            <ion-icon :icon="close" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="body-metrics-entry">
        <ion-item>
          <ion-label position="stacked">Date</ion-label>
          <ion-datetime
            v-model="entryDate"
            display-format="MMM DD, YYYY"
            :max="maxDate"
          />
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Weight (kg)</ion-label>
          <ion-input
            v-model.number="weight"
            type="number"
            placeholder="70.0"
            step="0.1"
          />
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Body Fat (%)</ion-label>
          <ion-input
            v-model.number="bodyFat"
            type="number"
            placeholder="15.0"
            step="0.1"
            min="0"
            max="100"
          />
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Chest (cm)</ion-label>
          <ion-input
            v-model.number="measurements.chest"
            type="number"
            placeholder="100"
            step="0.5"
          />
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Waist (cm)</ion-label>
          <ion-input
            v-model.number="measurements.waist"
            type="number"
            placeholder="80"
            step="0.5"
          />
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Hips (cm)</ion-label>
          <ion-input
            v-model.number="measurements.hips"
            type="number"
            placeholder="95"
            step="0.5"
          />
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Bicep (cm)</ion-label>
          <ion-input
            v-model.number="measurements.bicep"
            type="number"
            placeholder="35"
            step="0.5"
          />
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Thigh (cm)</ion-label>
          <ion-input
            v-model.number="measurements.thigh"
            type="number"
            placeholder="60"
            step="0.5"
          />
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Notes</ion-label>
          <ion-textarea
            v-model="notes"
            placeholder="Optional notes..."
            :rows="3"
          />
        </ion-item>

        <div class="actions">
          <ion-button expand="block" @click="saveMetrics" :disabled="!isValid">
            {{ editing ? 'Update' : 'Save' }} Metrics
          </ion-button>
          <ion-button
            v-if="editing"
            expand="block"
            fill="outline"
            color="danger"
            @click="deleteMetrics"
          >
            Delete
          </ion-button>
        </div>
      </div>
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
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonDatetime,
  IonTextarea,
} from "@ionic/vue";
import { close } from "ionicons/icons";
import { BodyMetricsRepository } from "@/features/nutrition/repositories/body-metrics.repository";
import type { BodyMetric, BodyMeasurements } from "@/features/nutrition/types/body-metrics.types";

interface Props {
  isOpen: boolean;
  editing?: BodyMetric | null;
}

const props = withDefaults(defineProps<Props>(), {
  editing: null,
});

const emit = defineEmits<{
  close: [];
  saved: [];
  deleted: [];
}>();

const entryDate = ref(new Date().toISOString().split("T")[0]);
const weight = ref<number | null>(null);
const bodyFat = ref<number | null>(null);
const measurements = ref<Partial<BodyMeasurements>>({});
const notes = ref("");

const maxDate = new Date().toISOString().split("T")[0];

const isValid = computed(() => {
  return entryDate.value && (weight !== null || Object.keys(measurements.value).length > 0);
});

watch(() => props.isOpen, (newVal) => {
  if (newVal && props.editing) {
    entryDate.value = props.editing.date;
    weight.value = props.editing.weight || null;
    bodyFat.value = props.editing.bodyFat || null;
    if (props.editing.measurements) {
      try {
        measurements.value = JSON.parse(props.editing.measurements);
      } catch {
        measurements.value = {};
      }
    }
    notes.value = props.editing.notes || "";
  } else if (newVal) {
    // Reset for new entry
    entryDate.value = new Date().toISOString().split("T")[0];
    weight.value = null;
    bodyFat.value = null;
    measurements.value = {};
    notes.value = "";
  }
});

async function saveMetrics() {
  if (!isValid.value) return;

  try {
    const measurementsJson = Object.keys(measurements.value).length > 0
      ? JSON.stringify(measurements.value)
      : undefined;

    if (props.editing) {
      await BodyMetricsRepository.update(props.editing.id, {
        date: entryDate.value,
        weight: weight.value || undefined,
        bodyFat: bodyFat.value || undefined,
        measurements: measurementsJson,
        notes: notes.value || undefined,
      });
    } else {
      await BodyMetricsRepository.create({
        date: entryDate.value,
        weight: weight.value || undefined,
        bodyFat: bodyFat.value || undefined,
        measurements: measurementsJson,
        notes: notes.value || undefined,
      });
    }
    emit("saved");
    emit("close");
  } catch (error) {
    console.error("Failed to save metrics:", error);
  }
}

async function deleteMetrics() {
  if (!props.editing) return;

  try {
    await BodyMetricsRepository.delete(props.editing.id);
    emit("deleted");
    emit("close");
  } catch (error) {
    console.error("Failed to delete metrics:", error);
  }
}
</script>

<style scoped>
.body-metrics-entry {
  padding: var(--spacing-xl);
}

.body-metrics-entry ion-item {
  margin-bottom: var(--spacing-base);
}

.actions {
  margin-top: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
}
</style>

