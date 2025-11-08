<template>
  <div class="questionnaire-page">
    <!-- Progress Indicator -->
    <div class="progress-container" role="progressbar" :aria-valuenow="currentStep" :aria-valuemin="1" :aria-valuemax="totalSteps" :aria-label="`Step ${currentStep} of ${totalSteps}`">
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: `${(currentStep / totalSteps) * 100}%` }"
        ></div>
      </div>
      <div class="progress-text" aria-live="polite">
        Step {{ currentStep }} of {{ totalSteps }}
      </div>
    </div>

    <!-- Step Content -->
    <div class="step-container" ref="stepContainerRef" role="region" :aria-label="`Step ${currentStep} content`">
      <transition :name="transitionName" mode="out-in">
        <component
          :is="currentStepComponent"
          :key="currentStep"
          :model-value="formData"
          @update:model-value="handleStepUpdate"
          @valid="handleStepValid"
        />
      </transition>
    </div>

    <!-- Navigation Buttons -->
    <div class="navigation-container">
      <ion-button
        v-if="currentStep > 1"
        fill="outline"
        @click="goToPreviousStep"
        aria-label="Go to previous step"
      >
        Back
      </ion-button>
      <div class="spacer"></div>
      <ion-button
        v-if="currentStep < totalSteps"
        :disabled="!isCurrentStepValid"
        @click="goToNextStep"
        :aria-disabled="!isCurrentStepValid"
        aria-label="Go to next step"
      >
        Next
      </ion-button>
      <ion-button
        v-else
        :disabled="!isCurrentStepValid || isSubmitting"
        @click="handleSubmit"
        :aria-disabled="!isCurrentStepValid || isSubmitting"
        aria-label="Complete questionnaire"
      >
        {{ isSubmitting ? "Submitting..." : "Complete" }}
      </ion-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { IonButton } from "@ionic/vue";
import { alertController } from "@ionic/vue";
import { useRouter } from "vue-router";
import type { QuestionnaireFormData } from "@/features/nutrition/types/questionnaire.types";
import { QuestionnaireRepository } from "@/features/nutrition/repositories/questionnaire.repository";
import { DietPlanCalculatorService } from "@/features/nutrition/services/diet-plan-calculator.service";
import { NutritionTargetsRepository } from "@/features/nutrition/repositories/nutrition-targets.repository";
import BasicInfoStep from "./steps/BasicInfoStep.vue";
import ActivityLevelStep from "./steps/ActivityLevelStep.vue";
import DietaryPreferencesStep from "./steps/DietaryPreferencesStep.vue";
import GoalsStep from "./steps/GoalsStep.vue";
import LifestyleStep from "./steps/LifestyleStep.vue";
import MedicalStep from "./steps/MedicalStep.vue";
import FoodPreferencesStep from "./steps/FoodPreferencesStep.vue";
import ReviewStep from "./steps/ReviewStep.vue";

const router = useRouter();

// Step management
const currentStep = ref(1);
const totalSteps = 8; // Including optional steps
const transitionName = ref("slide-next");
const stepContainerRef = ref<HTMLElement | null>(null);

// Form data
const formData = ref<Partial<QuestionnaireFormData>>({
  age: undefined,
  sex: undefined,
  height: undefined,
  weight: undefined,
  activityLevel: undefined,
  dietaryRestrictions: [],
  allergies: [],
  intolerances: [],
  primaryGoal: undefined,
  targetWeight: undefined,
  targetDate: undefined,
  mealFrequency: 3,
  fastingPreferences: ["none"],
  typicalWakeTime: undefined,
  typicalBedTime: undefined,
  medicalConditions: [],
  medications: [],
  foodDislikes: [],
  foodFavorites: [],
});

// Validation state
const stepValidation = ref<Record<number, boolean>>({});
const isCurrentStepValid = computed(() => {
  return stepValidation.value[currentStep.value] ?? false;
});

// Submission state
const isSubmitting = ref(false);

// Step components mapping
const stepComponents = [
  BasicInfoStep,
  ActivityLevelStep,
  DietaryPreferencesStep,
  GoalsStep,
  LifestyleStep,
  MedicalStep,
  FoodPreferencesStep,
  ReviewStep,
];

const currentStepComponent = computed(() => {
  return stepComponents[currentStep.value - 1];
});

// Check for existing profile on mount
onMounted(async () => {
  const existingProfile = await QuestionnaireRepository.getLatestProfile();
  if (existingProfile) {
    const confirmed = await showRetakeConfirmation();
    if (!confirmed) {
      router.push("/macros");
      return;
    }
    // Pre-fill form with existing data
    formData.value = {
      age: existingProfile.age,
      sex: existingProfile.sex,
      height: existingProfile.height,
      weight: existingProfile.weight,
      activityLevel: existingProfile.activityLevel,
      dietaryRestrictions: existingProfile.dietaryRestrictions,
      allergies: existingProfile.allergies,
      intolerances: existingProfile.intolerances,
      primaryGoal: existingProfile.primaryGoal,
      targetWeight: existingProfile.targetWeight,
      targetDate: existingProfile.targetDate,
      mealFrequency: existingProfile.mealFrequency,
      fastingPreferences: existingProfile.fastingPreferences,
      typicalWakeTime: existingProfile.typicalWakeTime,
      typicalBedTime: existingProfile.typicalBedTime,
      medicalConditions: existingProfile.medicalConditions || [],
      medications: existingProfile.medications || [],
      foodDislikes: existingProfile.foodDislikes || [],
      foodFavorites: existingProfile.foodFavorites || [],
    };
  }
});

async function showRetakeConfirmation(): Promise<boolean> {
  return new Promise(async (resolve) => {
    const alert = await alertController.create({
      header: "Update Nutrition Profile?",
      message:
        "You already have a nutrition profile. Updating it will recalculate your diet plan and may change your current targets. Continue?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          handler: () => resolve(false),
        },
        {
          text: "Update Profile",
          handler: () => resolve(true),
        },
      ],
    });
    await alert.present();
  });
}

function handleStepUpdate(data: Partial<QuestionnaireFormData>) {
  // Deep clone arrays to avoid reactivity issues
  const updated = { ...formData.value };
  for (const key in data) {
    const value = data[key as keyof QuestionnaireFormData];
    if (Array.isArray(value)) {
      (updated as any)[key] = JSON.parse(JSON.stringify(value));
    } else {
      (updated as any)[key] = value;
    }
  }
  formData.value = updated;
}

function handleStepValid(isValid: boolean) {
  stepValidation.value[currentStep.value] = isValid;
}

function goToNextStep() {
  if (currentStep.value < totalSteps && isCurrentStepValid.value) {
    transitionName.value = "slide-next";
    currentStep.value++;
  }
}

function goToPreviousStep() {
  if (currentStep.value > 1) {
    transitionName.value = "slide-prev";
    currentStep.value--;
  }
}

async function handleSubmit() {
  if (!isCurrentStepValid.value || isSubmitting.value) return;

  isSubmitting.value = true;

  try {
    // Validate all required fields
    if (
      !formData.value.age ||
      !formData.value.sex ||
      !formData.value.height ||
      !formData.value.weight ||
      !formData.value.activityLevel ||
      !formData.value.primaryGoal
    ) {
      throw new Error("Please complete all required fields");
    }

    // Create questionnaire response
    const response = await QuestionnaireRepository.create({
      age: formData.value.age!,
      sex: formData.value.sex!,
      height: formData.value.height!,
      weight: formData.value.weight!,
      activityLevel: formData.value.activityLevel!,
      dietaryRestrictions: formData.value.dietaryRestrictions || [],
      allergies: formData.value.allergies || [],
      intolerances: formData.value.intolerances || [],
      primaryGoal: formData.value.primaryGoal!,
      targetWeight: formData.value.targetWeight,
      targetDate: formData.value.targetDate,
      mealFrequency: formData.value.mealFrequency || 3,
      fastingPreferences: formData.value.fastingPreferences || ["none"],
      typicalWakeTime: formData.value.typicalWakeTime,
      typicalBedTime: formData.value.typicalBedTime,
      medicalConditions: formData.value.medicalConditions,
      medications: formData.value.medications,
      foodDislikes: formData.value.foodDislikes,
      foodFavorites: formData.value.foodFavorites,
    });

    // Calculate diet plan
    const dietPlan = DietPlanCalculatorService.calculateDietPlan(response);

    // Create nutrition target from diet plan
    const goalType =
      formData.value.primaryGoal === "weight_loss"
        ? "cutting"
        : formData.value.primaryGoal === "muscle_gain"
        ? "bulking"
        : "maintenance";

    await NutritionTargetsRepository.replaceActive({
      calories: dietPlan.dailyCalories,
      protein: dietPlan.protein,
      carbs: dietPlan.carbs,
      fats: dietPlan.fats,
      goalType,
      startDate: new Date().toISOString(),
    });

    // Redirect to nutrition page
    router.push("/macros");
  } catch (error) {
    console.error("Failed to submit questionnaire:", error);
    const alert = await alertController.create({
      header: "Error",
      message:
        error instanceof Error
          ? error.message
          : "Failed to save your profile. Please try again.",
      buttons: ["OK"],
    });
    await alert.present();
  } finally {
    isSubmitting.value = false;
  }
}

function handleCancel() {
  router.push("/macros");
}
</script>

<style scoped>
.questionnaire-page {
  padding: var(--spacing-base);
  padding-bottom: var(--spacing-5xl);
  min-height: 100%;
}

.progress-container {
  margin-bottom: var(--spacing-xl);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: var(--color-surface);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--spacing-sm);
}

.progress-fill {
  height: 100%;
  background-color: var(--color-primary);
  transition: width var(--transition-base);
  border-radius: var(--radius-full);
}

.progress-text {
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.step-container {
  min-height: 400px;
  margin-bottom: var(--spacing-xl);
}

.navigation-container {
  display: flex;
  gap: var(--spacing-base);
  padding: var(--spacing-base);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--ion-background-color);
  border-top: 1px solid var(--color-border);
  z-index: 10;
}

.spacer {
  flex: 1;
}

/* Step transitions */
.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-next-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-next-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-prev-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-prev-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>

