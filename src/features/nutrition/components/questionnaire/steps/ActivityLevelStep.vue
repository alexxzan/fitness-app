<template>
  <QuestionnaireStep
    title="Activity Level"
    description="How active are you on a typical day?"
    :icon="barbellOutline"
  >
    <div class="activity-cards">
      <div
        v-for="level in activityLevels"
        :key="level.value"
        class="activity-card"
        :class="{ active: localData.activityLevel === level.value }"
        @click="selectLevel(level.value)"
      >
        <ion-icon :icon="level.icon" class="card-icon" />
        <h3 class="card-title">{{ level.label }}</h3>
        <p class="card-description">{{ level.description }}</p>
      </div>
    </div>
  </QuestionnaireStep>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { IonIcon } from "@ionic/vue";
import {
  homeOutline,
  walkOutline,
  bicycleOutline,
  fitnessOutline,
  flashOutline,
  barbellOutline,
} from "ionicons/icons";
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
  activityLevel: props.modelValue.activityLevel,
});

const activityLevels = [
  {
    value: "sedentary" as const,
    label: "Sedentary",
    description: "Little to no exercise",
    icon: homeOutline,
  },
  {
    value: "lightly_active" as const,
    label: "Lightly Active",
    description: "Light exercise 1-3 days/week",
    icon: walkOutline,
  },
  {
    value: "moderately_active" as const,
    label: "Moderately Active",
    description: "Moderate exercise 3-5 days/week",
    icon: bicycleOutline,
  },
  {
    value: "very_active" as const,
    label: "Very Active",
    description: "Hard exercise 6-7 days/week",
    icon: fitnessOutline,
  },
  {
    value: "extra_active" as const,
    label: "Extra Active",
    description: "Very hard exercise, physical job",
    icon: flashOutline,
  },
];

watch(
  () => props.modelValue.activityLevel,
  (newVal) => {
    if (localData.value.activityLevel !== newVal) {
      localData.value.activityLevel = newVal;
      validate();
    }
  }
);

function selectLevel(level: typeof localData.value.activityLevel) {
  localData.value.activityLevel = level;
  emit("update:modelValue", { activityLevel: level });
  validate();
}

function validate() {
  const isValid = !!localData.value.activityLevel;
  emit("valid", isValid);
}

validate();
</script>

<style scoped>
.activity-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-base);
}

.activity-card {
  padding: var(--spacing-lg);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  cursor: pointer;
  transition: all var(--transition-base);
  text-align: center;
}

.activity-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.activity-card.active {
  border-color: var(--color-primary);
  background: var(--color-primary-lighter);
}

.card-icon {
  font-size: 32px;
  color: var(--color-primary);
  margin-bottom: var(--spacing-sm);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.card-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}
</style>

