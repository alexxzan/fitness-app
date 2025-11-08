<template>
  <ion-modal :is-open="isOpen" @didDismiss="$emit('close')">
    <ion-header>
      <ion-toolbar>
        <ion-title>Set Nutrition Targets</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('close')">
            <ion-icon :icon="close" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="target-setup">
        <ion-item>
          <ion-label position="stacked">Calories</ion-label>
          <ion-input v-model.number="calories" type="number" placeholder="2000" />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Protein (g)</ion-label>
          <ion-input v-model.number="protein" type="number" placeholder="150" />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Carbs (g)</ion-label>
          <ion-input v-model.number="carbs" type="number" placeholder="200" />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Fats (g)</ion-label>
          <ion-input v-model.number="fats" type="number" placeholder="65" />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Goal Type</ion-label>
          <ion-select v-model="goalType" placeholder="Select goal">
            <ion-select-option value="cutting">Cutting</ion-select-option>
            <ion-select-option value="bulking">Bulking</ion-select-option>
            <ion-select-option value="maintenance">Maintenance</ion-select-option>
          </ion-select>
        </ion-item>
        <div class="actions">
          <ion-button expand="block" @click="saveTarget" :disabled="!isValid">
            Save Targets
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
} from "@ionic/vue";
import { close } from "ionicons/icons";
import { useNutritionTargets } from "@/features/nutrition/composables/useNutritionTargets";

interface Props {
  isOpen: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  targetSet: [];
}>();

const { createCustomTarget } = useNutritionTargets();
const calories = ref(2000);
const protein = ref(150);
const carbs = ref(200);
const fats = ref(65);
const goalType = ref<"cutting" | "bulking" | "maintenance">("maintenance");

const isValid = computed(() => {
  return calories.value > 0 && protein.value > 0 && carbs.value > 0 && fats.value > 0 && goalType.value;
});

async function saveTarget() {
  if (!isValid.value) return;
  
  try {
    await createCustomTarget({
      calories: calories.value,
      protein: protein.value,
      carbs: carbs.value,
      fats: fats.value,
      startDate: new Date().toISOString(),
      goalType: goalType.value,
    });
    emit("targetSet");
  } catch (error) {
    console.error("Failed to save target:", error);
  }
}
</script>

<style scoped>
.target-setup {
  padding: var(--spacing-xl);
}

.target-setup ion-item {
  margin-bottom: var(--spacing-base);
}

.actions {
  margin-top: var(--spacing-xl);
}
</style>

