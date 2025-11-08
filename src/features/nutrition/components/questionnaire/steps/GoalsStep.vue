<template>
  <QuestionnaireStep
    title="Your Goals"
    description="What do you want to achieve?"
    :icon="flagOutline"
  >
    <div class="goal-cards">
      <div
        v-for="goal in goals"
        :key="goal.value"
        class="goal-card"
        :class="{ active: localData.primaryGoal === goal.value }"
        @click="selectGoal(goal.value)"
      >
        <ion-icon :icon="goal.icon" class="card-icon" />
        <h3 class="card-title">{{ goal.label }}</h3>
        <p class="card-description">{{ goal.description }}</p>
      </div>
    </div>

    <div v-if="localData.primaryGoal === 'weight_loss' || localData.primaryGoal === 'muscle_gain'" class="goal-details">
      <ion-item>
        <ion-label position="stacked">Target Weight (kg)</ion-label>
        <ion-input
          v-model.number="localData.targetWeight"
          type="number"
          placeholder="65"
          @ion-blur="updateGoalDetails"
        />
      </ion-item>
      <ion-item>
        <ion-label position="stacked">Target Date (optional)</ion-label>
        <ion-datetime
          v-model="localData.targetDate"
          presentation="date"
          :min="minDate"
          @ion-change="updateGoalDetails"
        />
      </ion-item>
    </div>
  </QuestionnaireStep>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { IonIcon, IonItem, IonLabel, IonInput, IonDatetime } from "@ionic/vue";
import {
  trendingDownOutline,
  trendingUpOutline,
  scaleOutline,
  trophyOutline,
  flagOutline,
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
  primaryGoal: props.modelValue.primaryGoal,
  targetWeight: props.modelValue.targetWeight,
  targetDate: props.modelValue.targetDate,
});

const goals = [
  {
    value: "weight_loss" as const,
    label: "Weight Loss",
    description: "Lose weight and burn fat",
    icon: trendingDownOutline,
  },
  {
    value: "muscle_gain" as const,
    label: "Muscle Gain",
    description: "Build muscle and gain weight",
    icon: trendingUpOutline,
  },
  {
    value: "maintenance" as const,
    label: "Maintenance",
    description: "Maintain current weight",
    icon: scaleOutline,
  },
  {
    value: "performance" as const,
    label: "Performance",
    description: "Improve athletic performance",
    icon: trophyOutline,
  },
];

const minDate = computed(() => {
  return new Date().toISOString().split("T")[0];
});

watch(
  () => props.modelValue,
  (newVal) => {
    if (
      localData.value.primaryGoal !== newVal.primaryGoal ||
      localData.value.targetWeight !== newVal.targetWeight ||
      localData.value.targetDate !== newVal.targetDate
    ) {
      localData.value = {
        primaryGoal: newVal.primaryGoal,
        targetWeight: newVal.targetWeight,
        targetDate: newVal.targetDate,
      };
      validate();
    }
  },
  { deep: true }
);

function selectGoal(goal: typeof localData.value.primaryGoal) {
  localData.value.primaryGoal = goal;
  updateGoalDetails();
}

function updateGoalDetails() {
  emit("update:modelValue", {
    primaryGoal: localData.value.primaryGoal,
    targetWeight: localData.value.targetWeight,
    targetDate: localData.value.targetDate,
  });
  validate();
}

function validate() {
  const isValid = !!localData.value.primaryGoal;
  emit("valid", isValid);
}

validate();
</script>

<style scoped>
.goal-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-base);
  margin-bottom: var(--spacing-xl);
}

.goal-card {
  padding: var(--spacing-lg);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  cursor: pointer;
  transition: all var(--transition-base);
  text-align: center;
}

.goal-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.goal-card.active {
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

.goal-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
  margin-top: var(--spacing-xl);
}

ion-item {
  --padding-start: 0;
  --padding-end: 0;
}
</style>

