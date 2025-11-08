<template>
  <QuestionnaireStep
    title="Basic Information"
    description="Tell us about yourself"
    :icon="personOutline"
  >
    <div class="step-form">
      <ion-item>
        <ion-label position="stacked">Age</ion-label>
        <ion-input
          v-model.number="localData.age"
          type="number"
          placeholder="25"
          min="13"
          max="120"
          @ion-blur="validate"
        />
        <ion-note v-if="errors.age" slot="error" color="danger">
          {{ errors.age }}
        </ion-note>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Sex</ion-label>
        <ion-select
          v-model="localData.sex"
          placeholder="Select sex"
          @ion-change="validate"
        >
          <ion-select-option value="male">Male</ion-select-option>
          <ion-select-option value="female">Female</ion-select-option>
          <ion-select-option value="other">Other</ion-select-option>
        </ion-select>
        <ion-note v-if="errors.sex" slot="error" color="danger">
          {{ errors.sex }}
        </ion-note>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Height (cm)</ion-label>
        <ion-input
          v-model.number="localData.height"
          type="number"
          placeholder="175"
          min="100"
          max="250"
          @ion-blur="validate"
        />
        <ion-note v-if="errors.height" slot="error" color="danger">
          {{ errors.height }}
        </ion-note>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Weight (kg)</ion-label>
        <ion-input
          v-model.number="localData.weight"
          type="number"
          placeholder="70"
          min="30"
          max="300"
          @ion-blur="validate"
        />
        <ion-note v-if="errors.weight" slot="error" color="danger">
          {{ errors.weight }}
        </ion-note>
      </ion-item>
    </div>
  </QuestionnaireStep>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import {
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonNote,
} from "@ionic/vue";
import { personOutline } from "ionicons/icons";
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
  age: props.modelValue.age,
  sex: props.modelValue.sex,
  height: props.modelValue.height,
  weight: props.modelValue.weight,
});

const errors = ref<Record<string, string>>({});

watch(
  () => props.modelValue,
  (newVal) => {
    if (
      localData.value.age !== newVal.age ||
      localData.value.sex !== newVal.sex ||
      localData.value.height !== newVal.height ||
      localData.value.weight !== newVal.weight
    ) {
      localData.value = {
        age: newVal.age,
        sex: newVal.sex,
        height: newVal.height,
        weight: newVal.weight,
      };
      validate();
    }
  },
  { deep: true }
);

// Only emit when user actually changes values, not on prop updates
watch(
  [() => localData.value.age, () => localData.value.sex, () => localData.value.height, () => localData.value.weight],
  () => {
    // Only emit if values are different from props to avoid loops
    if (
      localData.value.age !== props.modelValue.age ||
      localData.value.sex !== props.modelValue.sex ||
      localData.value.height !== props.modelValue.height ||
      localData.value.weight !== props.modelValue.weight
    ) {
      emit("update:modelValue", { ...localData.value });
    }
    validate();
  }
);

function validate() {
  errors.value = {};

  if (!localData.value.age || localData.value.age < 13 || localData.value.age > 120) {
    errors.value.age = "Age must be between 13 and 120";
  }

  if (!localData.value.sex) {
    errors.value.sex = "Please select your sex";
  }

  if (!localData.value.height || localData.value.height < 100 || localData.value.height > 250) {
    errors.value.height = "Height must be between 100 and 250 cm";
  }

  if (!localData.value.weight || localData.value.weight < 30 || localData.value.weight > 300) {
    errors.value.weight = "Weight must be between 30 and 300 kg";
  }

  const isValid = Object.keys(errors.value).length === 0;
  emit("valid", isValid);
}

// Initial validation
validate();
</script>

<style scoped>
.step-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
}

ion-item {
  --padding-start: 0;
  --padding-end: 0;
}
</style>

