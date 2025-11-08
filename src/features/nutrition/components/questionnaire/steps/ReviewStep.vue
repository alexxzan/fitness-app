<template>
  <QuestionnaireStep
    title="Review Your Information"
    description="Please review and confirm your answers"
    :icon="checkmarkCircleOutline"
  >
    <div class="review-container">
      <div class="review-section">
        <h3 class="section-title">Basic Information</h3>
        <div class="review-item">
          <span class="label">Age:</span>
          <span class="value">{{ formData.age }} years</span>
        </div>
        <div class="review-item">
          <span class="label">Sex:</span>
          <span class="value">{{ formatSex(formData.sex) }}</span>
        </div>
        <div class="review-item">
          <span class="label">Height:</span>
          <span class="value">{{ formData.height }} cm</span>
        </div>
        <div class="review-item">
          <span class="label">Weight:</span>
          <span class="value">{{ formData.weight }} kg</span>
        </div>
      </div>

      <div class="review-section">
        <h3 class="section-title">Activity Level</h3>
        <div class="review-item">
          <span class="value">{{ formatActivityLevel(formData.activityLevel) }}</span>
        </div>
      </div>

      <div class="review-section">
        <h3 class="section-title">Dietary Preferences</h3>
        <div v-if="formData.dietaryRestrictions?.length" class="review-item">
          <span class="label">Restrictions:</span>
          <span class="value">{{ formData.dietaryRestrictions.join(", ") }}</span>
        </div>
        <div v-if="formData.allergies?.length" class="review-item">
          <span class="label">Allergies:</span>
          <span class="value">{{ formData.allergies.join(", ") }}</span>
        </div>
        <div v-if="formData.intolerances?.length" class="review-item">
          <span class="label">Intolerances:</span>
          <span class="value">{{ formData.intolerances.join(", ") }}</span>
        </div>
        <div v-if="!formData.dietaryRestrictions?.length && !formData.allergies?.length && !formData.intolerances?.length" class="review-item">
          <span class="value">None</span>
        </div>
      </div>

      <div class="review-section">
        <h3 class="section-title">Goals</h3>
        <div class="review-item">
          <span class="label">Primary Goal:</span>
          <span class="value">{{ formatGoal(formData.primaryGoal) }}</span>
        </div>
        <div v-if="formData.targetWeight" class="review-item">
          <span class="label">Target Weight:</span>
          <span class="value">{{ formData.targetWeight }} kg</span>
        </div>
        <div v-if="formData.targetDate" class="review-item">
          <span class="label">Target Date:</span>
          <span class="value">{{ formatDate(formData.targetDate) }}</span>
        </div>
      </div>

      <div class="review-section">
        <h3 class="section-title">Lifestyle</h3>
        <div class="review-item">
          <span class="label">Meals per Day:</span>
          <span class="value">{{ formData.mealFrequency }}</span>
        </div>
        <div v-if="formData.fastingPreferences?.length" class="review-item">
          <span class="label">Fasting:</span>
          <span class="value">{{ formatFasting(formData.fastingPreferences) }}</span>
        </div>
      </div>

      <ion-button fill="outline" @click="goBack">
        Edit Information
      </ion-button>
    </div>
  </QuestionnaireStep>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { IonButton } from "@ionic/vue";
import { checkmarkCircleOutline } from "ionicons/icons";
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

const formData = computed(() => props.modelValue);

function formatSex(sex?: string): string {
  if (!sex) return "Not specified";
  return sex.charAt(0).toUpperCase() + sex.slice(1);
}

function formatActivityLevel(level?: string): string {
  if (!level) return "Not specified";
  const mapping: Record<string, string> = {
    sedentary: "Sedentary",
    lightly_active: "Lightly Active",
    moderately_active: "Moderately Active",
    very_active: "Very Active",
    extra_active: "Extra Active",
  };
  return mapping[level] || level;
}

function formatGoal(goal?: string): string {
  if (!goal) return "Not specified";
  const mapping: Record<string, string> = {
    weight_loss: "Weight Loss",
    muscle_gain: "Muscle Gain",
    maintenance: "Maintenance",
    performance: "Performance",
  };
  return mapping[goal] || goal;
}

function formatFasting(prefs?: string[]): string {
  if (!prefs || prefs.length === 0) return "None";
  const mapping: Record<string, string> = {
    none: "None",
    intermittent_16_8: "16:8 Intermittent Fasting",
    intermittent_18_6: "18:6 Intermittent Fasting",
    alternate_day: "Alternate Day Fasting",
  };
  return prefs.map((p) => mapping[p] || p).join(", ");
}

function formatDate(date?: string): string {
  if (!date) return "Not specified";
  try {
    return new Date(date).toLocaleDateString();
  } catch {
    return date;
  }
}

function goBack() {
  // Emit event to go back to first step
  emit("valid", true);
}

// Always valid on review step
emit("valid", true);
</script>

<style scoped>
.review-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.review-section {
  padding: var(--spacing-lg);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-base) 0;
}

.review-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--color-border);
}

.review-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.value {
  color: var(--color-text-primary);
  text-align: right;
}
</style>

