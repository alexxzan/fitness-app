<template>
  <ion-modal :is-open="isOpen" @did-dismiss="$emit('close')">
    <ion-header>
      <ion-toolbar>
        <ion-title>Add Food</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('close')">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="food-entry-container">
        <FormField
          v-model="foodData.foodName"
          label="Food Name"
          placeholder="e.g., Grilled Chicken Breast"
        />
        <ion-item>
          <ion-label>Meal Type</ion-label>
          <ion-select v-model="foodData.mealType" placeholder="Select meal">
            <ion-select-option value="breakfast">Breakfast</ion-select-option>
            <ion-select-option value="lunch">Lunch</ion-select-option>
            <ion-select-option value="dinner">Dinner</ion-select-option>
            <ion-select-option value="snack">Snack</ion-select-option>
          </ion-select>
        </ion-item>
        <FormField
          v-model="foodData.calories"
          label="Calories"
          type="number"
          placeholder="250"
        />
        <FormField
          v-model="foodData.protein"
          label="Protein (g)"
          type="number"
          placeholder="30"
        />
        <FormField
          v-model="foodData.carbs"
          label="Carbs (g)"
          type="number"
          placeholder="0"
        />
        <FormField
          v-model="foodData.fats"
          label="Fats (g)"
          type="number"
          placeholder="5"
        />
        <FormField
          v-model="foodData.notes"
          label="Notes (Optional)"
          placeholder="Any additional notes..."
        />
        <div class="modal-actions">
          <AppButton expand="block" @click="submit">Add Food</AppButton>
        </div>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
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
} from "@ionic/vue";
import FormField from "@/components/molecules/FormField.vue";
import AppButton from "@/components/atoms/AppButton.vue";
import type { MealType } from "../../types/macro.types";

interface Props {
  isOpen: boolean;
  date?: string;
}

const props = withDefaults(defineProps<Props>(), {
  date: () => new Date().toISOString().split("T")[0],
});

const emit = defineEmits<{
  close: [];
  add: [food: {
    date: string;
    mealType: MealType;
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    notes?: string;
  }];
}>();

const foodData = ref({
  foodName: "",
  mealType: "breakfast" as MealType,
  calories: 0,
  protein: 0,
  carbs: 0,
  fats: 0,
  notes: "",
});

watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    // Reset form when modal closes
    foodData.value = {
      foodName: "",
      mealType: "breakfast",
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      notes: "",
    };
  }
});

function submit() {
  if (!foodData.value.foodName || foodData.value.calories <= 0) {
    return;
  }

  emit("add", {
    date: props.date,
    mealType: foodData.value.mealType,
    foodName: foodData.value.foodName,
    calories: Number(foodData.value.calories),
    protein: Number(foodData.value.protein) || 0,
    carbs: Number(foodData.value.carbs) || 0,
    fats: Number(foodData.value.fats) || 0,
    notes: foodData.value.notes || undefined,
  });

  emit("close");
}
</script>

<style scoped>
.food-entry-container {
  padding: var(--spacing-lg);
}

.modal-actions {
  margin-top: var(--spacing-xl);
}
</style>

