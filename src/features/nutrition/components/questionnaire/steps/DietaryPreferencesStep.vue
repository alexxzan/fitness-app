<template>
  <QuestionnaireStep
    title="Dietary Preferences"
    description="Tell us about your dietary restrictions and allergies"
    :icon="restaurantOutline"
  >
    <div class="step-form">
      <div class="section">
        <h3 class="section-title">Dietary Restrictions</h3>
        <div class="chip-container">
          <ion-chip
            v-for="restriction in dietaryRestrictions"
            :key="restriction"
            :color="localData.dietaryRestrictions?.includes(restriction) ? 'primary' : 'medium'"
            @click="toggleRestriction(restriction)"
          >
            {{ restriction }}
          </ion-chip>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">Allergies</h3>
        <ion-item>
          <ion-label position="stacked">List any food allergies (comma-separated)</ion-label>
          <ion-input
            v-model="allergiesInput"
            placeholder="e.g., peanuts, shellfish"
            @ion-blur="updateAllergies"
          />
        </ion-item>
      </div>

      <div class="section">
        <h3 class="section-title">Intolerances</h3>
        <ion-item>
          <ion-label position="stacked">List any food intolerances (comma-separated)</ion-label>
          <ion-input
            v-model="intolerancesInput"
            placeholder="e.g., lactose, gluten"
            @ion-blur="updateIntolerances"
          />
        </ion-item>
      </div>
    </div>
  </QuestionnaireStep>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { IonItem, IonLabel, IonInput, IonChip } from "@ionic/vue";
import { restaurantOutline } from "ionicons/icons";
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
  dietaryRestrictions: props.modelValue.dietaryRestrictions || [],
  allergies: props.modelValue.allergies || [],
  intolerances: props.modelValue.intolerances || [],
});

const allergiesInput = ref(
  (props.modelValue.allergies || []).join(", ")
);
const intolerancesInput = ref(
  (props.modelValue.intolerances || []).join(", ")
);

const dietaryRestrictions: Array<
  QuestionnaireFormData["dietaryRestrictions"][number]
> = ["vegan", "vegetarian", "keto", "paleo", "mediterranean"];

watch(
  () => props.modelValue,
  (newVal) => {
    const newRestrictions = newVal.dietaryRestrictions || [];
    const newAllergies = newVal.allergies || [];
    const newIntolerances = newVal.intolerances || [];
    
    if (
      JSON.stringify(localData.value.dietaryRestrictions) !== JSON.stringify(newRestrictions) ||
      JSON.stringify(localData.value.allergies) !== JSON.stringify(newAllergies) ||
      JSON.stringify(localData.value.intolerances) !== JSON.stringify(newIntolerances)
    ) {
      localData.value = {
        dietaryRestrictions: newRestrictions,
        allergies: newAllergies,
        intolerances: newIntolerances,
      };
      allergiesInput.value = newAllergies.join(", ");
      intolerancesInput.value = newIntolerances.join(", ");
    }
  },
  { deep: true }
);

function toggleRestriction(restriction: typeof dietaryRestrictions[number]) {
  const current = localData.value.dietaryRestrictions || [];
  if (current.includes(restriction)) {
    localData.value.dietaryRestrictions = current.filter((r) => r !== restriction);
  } else {
    localData.value.dietaryRestrictions = [...current, restriction];
  }
  emit("update:modelValue", {
    dietaryRestrictions: localData.value.dietaryRestrictions,
  });
}

function updateAllergies() {
  const allergies = allergiesInput.value
    .split(",")
    .map((a) => a.trim())
    .filter((a) => a.length > 0);
  localData.value.allergies = allergies;
  emit("update:modelValue", { allergies });
}

function updateIntolerances() {
  const intolerances = intolerancesInput.value
    .split(",")
    .map((i) => i.trim())
    .filter((i) => i.length > 0);
  localData.value.intolerances = intolerances;
  emit("update:modelValue", { intolerances });
}

function validate() {
  // This step is always valid (all fields optional)
  emit("valid", true);
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

