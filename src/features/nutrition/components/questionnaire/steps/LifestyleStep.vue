<template>
  <QuestionnaireStep
    title="Lifestyle"
    description="Tell us about your eating habits"
    :icon="timeOutline"
  >
    <div class="step-form">
      <div class="section">
        <h3 class="section-title">Meals per Day</h3>
        <ion-item>
          <ion-label position="stacked">How many meals do you typically eat per day?</ion-label>
          <ion-select
            v-model.number="localData.mealFrequency"
            @ion-change="updateLifestyle"
          >
            <ion-select-option :value="2">2 meals</ion-select-option>
            <ion-select-option :value="3">3 meals</ion-select-option>
            <ion-select-option :value="4">4 meals</ion-select-option>
            <ion-select-option :value="5">5 meals</ion-select-option>
            <ion-select-option :value="6">6 meals</ion-select-option>
          </ion-select>
        </ion-item>
      </div>

      <div class="section">
        <h3 class="section-title">Fasting Preferences</h3>
        <div class="chip-container">
          <ion-chip
            v-for="pref in fastingPreferences"
            :key="pref.value"
            :color="localData.fastingPreferences?.includes(pref.value) ? 'primary' : 'medium'"
            @click="toggleFasting(pref.value)"
          >
            {{ pref.label }}
          </ion-chip>
        </div>
      </div>

      <div v-if="hasFasting" class="section">
        <h3 class="section-title">Typical Schedule</h3>
        <ion-item>
          <ion-label position="stacked">Wake Time</ion-label>
          <ion-datetime
            v-model="localData.typicalWakeTime"
            presentation="time"
            @ion-change="updateLifestyle"
          />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Bed Time</ion-label>
          <ion-datetime
            v-model="localData.typicalBedTime"
            presentation="time"
            @ion-change="updateLifestyle"
          />
        </ion-item>
      </div>
    </div>
  </QuestionnaireStep>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import {
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonChip,
  IonDatetime,
} from "@ionic/vue";
import { timeOutline } from "ionicons/icons";
import QuestionnaireStep from "../QuestionnaireStep.vue";
import type { QuestionnaireFormData } from "@/features/nutrition/types/questionnaire.types";

interface Props {
  modelValue: Partial<QuestionnaireFormData>;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:modelValue": [value: Partial<QuestionnaireFormData>];
  valid: [isValid: boolean];
}>();

const localData = ref({
  mealFrequency: props.modelValue.mealFrequency || 3,
  fastingPreferences: props.modelValue.fastingPreferences || ["none"],
  typicalWakeTime: props.modelValue.typicalWakeTime,
  typicalBedTime: props.modelValue.typicalBedTime,
});

const fastingPreferences = [
  { value: "none" as const, label: "None" },
  { value: "intermittent_16_8" as const, label: "16:8 Intermittent Fasting" },
  { value: "intermittent_18_6" as const, label: "18:6 Intermittent Fasting" },
  { value: "alternate_day" as const, label: "Alternate Day Fasting" },
];

const hasFasting = computed(() => {
  return (
    localData.value.fastingPreferences?.some(
      (p) => p !== "none"
    ) ?? false
  );
});

watch(
  () => props.modelValue,
  (newVal) => {
    const newFasting = newVal.fastingPreferences || ["none"];
    if (
      localData.value.mealFrequency !== (newVal.mealFrequency || 3) ||
      JSON.stringify(localData.value.fastingPreferences) !== JSON.stringify(newFasting) ||
      localData.value.typicalWakeTime !== newVal.typicalWakeTime ||
      localData.value.typicalBedTime !== newVal.typicalBedTime
    ) {
      localData.value = {
        mealFrequency: newVal.mealFrequency || 3,
        fastingPreferences: newFasting,
        typicalWakeTime: newVal.typicalWakeTime,
        typicalBedTime: newVal.typicalBedTime,
      };
      validate();
    }
  },
  { deep: true }
);

function toggleFasting(pref: typeof fastingPreferences[number]["value"]) {
  const current = localData.value.fastingPreferences || [];
  if (pref === "none") {
    localData.value.fastingPreferences = ["none"];
  } else {
    const filtered = current.filter((p) => p !== "none");
    if (filtered.includes(pref)) {
      localData.value.fastingPreferences = filtered.filter((p) => p !== pref);
      if (localData.value.fastingPreferences.length === 0) {
        localData.value.fastingPreferences = ["none"];
      }
    } else {
      localData.value.fastingPreferences = [...filtered, pref];
    }
  }
  updateLifestyle();
}

function updateLifestyle() {
  emit("update:modelValue", {
    mealFrequency: localData.value.mealFrequency,
    fastingPreferences: localData.value.fastingPreferences,
    typicalWakeTime: localData.value.typicalWakeTime,
    typicalBedTime: localData.value.typicalBedTime,
  });
  validate();
}

function validate() {
  const isValid =
    !!localData.value.mealFrequency &&
    (localData.value.fastingPreferences?.length ?? 0) > 0;
  emit("valid", isValid);
}

validate();
</script>

<style scoped>
.step-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.chip-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

ion-chip {
  cursor: pointer;
  transition: all var(--transition-base);
}

ion-item {
  --padding-start: 0;
  --padding-end: 0;
}
</style>

