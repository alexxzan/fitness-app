<template>
  <ion-modal :is-open="isOpen" @did-dismiss="$emit('close')">
    <ion-header>
      <ion-toolbar>
        <ion-title>Set Up Your Macro Plan</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('close')">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="questionnaire-container">
        <!-- Progress indicator -->
        <div class="progress-indicator">
          <div
            v-for="step in steps"
            :key="step.id"
            class="step-indicator"
            :class="{ active: currentStep === step.id, completed: currentStep > step.id }"
          >
            <div class="step-number">{{ step.id }}</div>
            <div class="step-title">{{ step.title }}</div>
          </div>
        </div>

        <!-- Step 1: Basic Info -->
        <div v-if="currentStep === 1" class="questionnaire-step">
          <h2>Basic Information</h2>
          <FormField
            v-model="formData.height"
            label="Height (cm)"
            type="number"
            placeholder="175"
          />
          <FormField
            v-model="formData.weight"
            label="Weight (kg)"
            type="number"
            placeholder="70"
          />
          <FormField
            v-model="formData.age"
            label="Age"
            type="number"
            placeholder="30"
          />
          <ion-item>
            <ion-label>Gender</ion-label>
            <ion-select v-model="formData.gender" placeholder="Select gender">
              <ion-select-option value="male">Male</ion-select-option>
              <ion-select-option value="female">Female</ion-select-option>
              <ion-select-option value="other">Other</ion-select-option>
            </ion-select>
          </ion-item>
        </div>

        <!-- Step 2: Activity Level -->
        <div v-if="currentStep === 2" class="questionnaire-step">
          <h2>Activity Level</h2>
          <ion-radio-group v-model="formData.activityLevel">
            <ion-item>
              <ion-label>Sedentary (little to no exercise)</ion-label>
              <ion-radio slot="start" value="sedentary"></ion-radio>
            </ion-item>
            <ion-item>
              <ion-label>Lightly Active (light exercise 1-3 days/week)</ion-label>
              <ion-radio slot="start" value="lightly_active"></ion-radio>
            </ion-item>
            <ion-item>
              <ion-label>Moderately Active (moderate exercise 3-5 days/week)</ion-label>
              <ion-radio slot="start" value="moderately_active"></ion-radio>
            </ion-item>
            <ion-item>
              <ion-label>Very Active (hard exercise 6-7 days/week)</ion-label>
              <ion-radio slot="start" value="very_active"></ion-radio>
            </ion-item>
            <ion-item>
              <ion-label>Extremely Active (very hard exercise, physical job)</ion-label>
              <ion-radio slot="start" value="extremely_active"></ion-radio>
            </ion-item>
          </ion-radio-group>
        </div>

        <!-- Step 3: Goal -->
        <div v-if="currentStep === 3" class="questionnaire-step">
          <h2>Your Goal</h2>
          <ion-radio-group v-model="formData.goal">
            <ion-item>
              <ion-label>Weight Loss</ion-label>
              <ion-radio slot="start" value="weight_loss"></ion-radio>
            </ion-item>
            <ion-item>
              <ion-label>Weight Gain</ion-label>
              <ion-radio slot="start" value="weight_gain"></ion-radio>
            </ion-item>
            <ion-item>
              <ion-label>Maintain Weight</ion-label>
              <ion-radio slot="start" value="maintain"></ion-radio>
            </ion-item>
            <ion-item>
              <ion-label>Build Muscle</ion-label>
              <ion-radio slot="start" value="build_muscle"></ion-radio>
            </ion-item>
          </ion-radio-group>
        </div>

        <!-- Step 4: Preferences -->
        <div v-if="currentStep === 4" class="questionnaire-step">
          <h2>Preferences</h2>
          <ion-item>
            <ion-label>Protein Preference</ion-label>
            <ion-select v-model="formData.proteinPreference" placeholder="Select preference">
              <ion-select-option value="high">High</ion-select-option>
              <ion-select-option value="moderate">Moderate</ion-select-option>
              <ion-select-option value="low">Low</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label>Carb Preference</ion-label>
            <ion-select v-model="formData.carbPreference" placeholder="Select preference">
              <ion-select-option value="high">High</ion-select-option>
              <ion-select-option value="moderate">Moderate</ion-select-option>
              <ion-select-option value="low">Low</ion-select-option>
            </ion-select>
          </ion-item>
        </div>

        <!-- Step 5: Advanced (Optional) -->
        <div v-if="currentStep === 5" class="questionnaire-step">
          <h2>Advanced (Optional)</h2>
          <FormField
            v-model="formData.bodyFatPercentage"
            label="Body Fat Percentage (%)"
            type="number"
            placeholder="15"
          />
        </div>

        <!-- Navigation buttons -->
        <div class="questionnaire-actions">
          <AppButton
            v-if="currentStep > 1"
            fill="outline"
            @click="previousStep"
          >
            Previous
          </AppButton>
          <AppButton
            v-if="currentStep < steps.length"
            expand="block"
            @click="nextStep"
          >
            Next
          </AppButton>
          <AppButton
            v-else
            expand="block"
            @click="submit"
          >
            Complete Setup
          </AppButton>
        </div>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonRadioGroup,
  IonRadio,
} from "@ionic/vue";
import FormField from "@/components/molecules/FormField.vue";
import AppButton from "@/components/atoms/AppButton.vue";
import { generateId } from "@/shared/utils/id";
import type { QuestionnaireData } from "../types/questionnaire.types";
import type { UserProfile } from "../types/macro.types";

interface Props {
  isOpen: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  complete: [profile: UserProfile];
}>();

const steps = [
  { id: 1, title: "Basic Info" },
  { id: 2, title: "Activity" },
  { id: 3, title: "Goal" },
  { id: 4, title: "Preferences" },
  { id: 5, title: "Advanced" },
];

const currentStep = ref(1);

const formData = ref<QuestionnaireData>({
  height: 0,
  weight: 0,
  age: 0,
  gender: "male",
  activityLevel: "moderately_active",
  goal: "maintain",
});

function nextStep() {
  if (currentStep.value < steps.length) {
    currentStep.value++;
  }
}

function previousStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

function submit() {
  const now = new Date().toISOString();
  const profile: UserProfile = {
    id: generateId(),
    height: formData.value.height,
    weight: formData.value.weight,
    age: formData.value.age,
    gender: formData.value.gender,
    activityLevel: formData.value.activityLevel,
    goal: formData.value.goal,
    proteinPreference: formData.value.proteinPreference,
    carbPreference: formData.value.carbPreference,
    dietaryRestrictions: formData.value.dietaryRestrictions,
    bodyFatPercentage: formData.value.bodyFatPercentage,
    createdAt: now,
    updatedAt: now,
  };

  emit("complete", profile);
}
</script>

<style scoped>
.questionnaire-container {
  padding: var(--spacing-lg);
}

.progress-indicator {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-md);
  background: var(--color-background-secondary);
  border-radius: var(--radius-card);
}

.step-indicator {
  flex: 1;
  text-align: center;
  opacity: 0.5;
  transition: opacity 0.3s;
}

.step-indicator.active,
.step-indicator.completed {
  opacity: 1;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-background-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-xs);
  font-weight: var(--typography-weight-bold);
}

.step-indicator.active .step-number {
  background: var(--color-primary);
  color: white;
}

.step-indicator.completed .step-number {
  background: var(--color-success);
  color: white;
}

.step-title {
  font-size: var(--typography-caption-size);
  color: var(--color-text-secondary);
}

.questionnaire-step {
  margin-bottom: var(--spacing-xl);
}

.questionnaire-step h2 {
  margin-bottom: var(--spacing-lg);
  font-size: var(--typography-heading-size-md);
}

.questionnaire-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}
</style>

