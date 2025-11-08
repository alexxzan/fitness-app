<template>
  <QuestionnaireStep
    title="Food Preferences"
    description="Optional: Tell us what you like and dislike"
    :icon="heartOutline"
  >
    <div class="step-form">
      <div class="section">
        <h3 class="section-title">Favorite Foods</h3>
        <ion-item>
          <ion-label position="stacked">List your favorite foods (comma-separated)</ion-label>
          <ion-input
            v-model="foodFavoritesInput"
            placeholder="e.g., chicken, rice, broccoli"
            @ion-blur="updateFoodFavorites"
          />
        </ion-item>
      </div>

      <div class="section">
        <h3 class="section-title">Food Dislikes</h3>
        <ion-item>
          <ion-label position="stacked">List foods you dislike (comma-separated)</ion-label>
          <ion-input
            v-model="foodDislikesInput"
            placeholder="e.g., fish, mushrooms"
            @ion-blur="updateFoodDislikes"
          />
        </ion-item>
      </div>

      <ion-note color="medium" class="disclaimer">
        This information is optional and will help us suggest meals you'll enjoy.
      </ion-note>
    </div>
  </QuestionnaireStep>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { IonItem, IonLabel, IonInput, IonNote } from "@ionic/vue";
import { heartOutline } from "ionicons/icons";
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
  foodFavorites: props.modelValue.foodFavorites || [],
  foodDislikes: props.modelValue.foodDislikes || [],
});

const foodFavoritesInput = ref(
  (props.modelValue.foodFavorites || []).join(", ")
);
const foodDislikesInput = ref(
  (props.modelValue.foodDislikes || []).join(", ")
);

watch(
  () => props.modelValue,
  (newVal) => {
    const newFavorites = newVal.foodFavorites || [];
    const newDislikes = newVal.foodDislikes || [];
    
    if (
      JSON.stringify(localData.value.foodFavorites) !== JSON.stringify(newFavorites) ||
      JSON.stringify(localData.value.foodDislikes) !== JSON.stringify(newDislikes)
    ) {
      localData.value = {
        foodFavorites: newFavorites,
        foodDislikes: newDislikes,
      };
      foodFavoritesInput.value = newFavorites.join(", ");
      foodDislikesInput.value = newDislikes.join(", ");
    }
  },
  { deep: true }
);

function updateFoodFavorites() {
  const favorites = foodFavoritesInput.value
    .split(",")
    .map((f) => f.trim())
    .filter((f) => f.length > 0);
  localData.value.foodFavorites = favorites;
  emit("update:modelValue", { foodFavorites: favorites });
}

function updateFoodDislikes() {
  const dislikes = foodDislikesInput.value
    .split(",")
    .map((d) => d.trim())
    .filter((d) => d.length > 0);
  localData.value.foodDislikes = dislikes;
  emit("update:modelValue", { foodDislikes: dislikes });
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

