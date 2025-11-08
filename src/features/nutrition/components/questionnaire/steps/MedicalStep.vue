<template>
  <QuestionnaireStep
    title="Medical Information"
    description="Optional: Help us provide better recommendations"
    :icon="medicalOutline"
  >
    <div class="step-form">
      <div class="section">
        <h3 class="section-title">Medical Conditions</h3>
        <ion-item>
          <ion-label position="stacked">List any medical conditions (comma-separated)</ion-label>
          <ion-input
            v-model="medicalConditionsInput"
            placeholder="e.g., diabetes, hypertension"
            @ion-blur="updateMedicalConditions"
          />
        </ion-item>
      </div>

      <div class="section">
        <h3 class="section-title">Medications</h3>
        <ion-item>
          <ion-label position="stacked">List any medications affecting diet (comma-separated)</ion-label>
          <ion-input
            v-model="medicationsInput"
            placeholder="e.g., blood pressure medication"
            @ion-blur="updateMedications"
          />
        </ion-item>
      </div>

      <ion-note color="medium" class="disclaimer">
        This information is optional and will help us provide better dietary recommendations.
      </ion-note>
    </div>
  </QuestionnaireStep>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { IonItem, IonLabel, IonInput, IonNote } from "@ionic/vue";
import { medicalOutline } from "ionicons/icons";
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
  medicalConditions: props.modelValue.medicalConditions || [],
  medications: props.modelValue.medications || [],
});

const medicalConditionsInput = ref(
  (props.modelValue.medicalConditions || []).join(", ")
);
const medicationsInput = ref(
  (props.modelValue.medications || []).join(", ")
);

watch(
  () => props.modelValue,
  (newVal) => {
    const newConditions = newVal.medicalConditions || [];
    const newMedications = newVal.medications || [];
    
    if (
      JSON.stringify(localData.value.medicalConditions) !== JSON.stringify(newConditions) ||
      JSON.stringify(localData.value.medications) !== JSON.stringify(newMedications)
    ) {
      localData.value = {
        medicalConditions: newConditions,
        medications: newMedications,
      };
      medicalConditionsInput.value = newConditions.join(", ");
      medicationsInput.value = newMedications.join(", ");
    }
  },
  { deep: true }
);

function updateMedicalConditions() {
  const conditions = medicalConditionsInput.value
    .split(",")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
  localData.value.medicalConditions = conditions;
  emit("update:modelValue", { medicalConditions: conditions });
}

function updateMedications() {
  const medications = medicationsInput.value
    .split(",")
    .map((m) => m.trim())
    .filter((m) => m.length > 0);
  localData.value.medications = medications;
  emit("update:modelValue", { medications });
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

.disclaimer {
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-base);
}

ion-item {
  --padding-start: 0;
  --padding-end: 0;
}
</style>

