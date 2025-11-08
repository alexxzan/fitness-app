<template>
  <ion-item v-if="log.food" class="food-log-entry">
    <ion-avatar slot="start">
      <ion-icon :icon="restaurant" />
    </ion-avatar>
    <ion-label>
      <h3>{{ log.food.name }}</h3>
      <p>
        {{ formatQuantity(log.quantity) }} serving{{ log.quantity !== 1 ? 's' : '' }}
        <span v-if="log.mealType"> • {{ formatMealType(log.mealType) }}</span>
      </p>
      <p class="nutrition-info">
        {{ Math.round(log.food.calories * log.quantity) }} cal
        • {{ Math.round(log.food.protein * log.quantity) }}g protein
        • {{ Math.round(log.food.carbs * log.quantity) }}g carbs
        • {{ Math.round(log.food.fats * log.quantity) }}g fats
      </p>
    </ion-label>
    <ion-button slot="end" fill="clear" @click="$emit('edit', log)">
      <ion-icon :icon="create" slot="icon-only" />
    </ion-button>
    <ion-button slot="end" fill="clear" color="danger" @click="$emit('delete', log.id)">
      <ion-icon :icon="trash" slot="icon-only" />
    </ion-button>
  </ion-item>
</template>

<script setup lang="ts">
import { IonItem, IonLabel, IonAvatar, IonButton, IonIcon } from "@ionic/vue";
import { restaurant, create, trash } from "ionicons/icons";
import type { FoodLog, Food } from "@/features/nutrition/types/food.types";

interface Props {
  log: FoodLog & { food: Food | null };
}

defineProps<Props>();
defineEmits<{
  edit: [log: FoodLog & { food: Food | null }];
  delete: [id: string];
}>();

function formatQuantity(quantity: number): string {
  if (quantity === 1) return "1";
  return quantity.toFixed(1);
}

function formatMealType(mealType?: string): string {
  if (!mealType) return "";
  return mealType.charAt(0).toUpperCase() + mealType.slice(1);
}
</script>

<style scoped>
.food-log-entry {
  --background: var(--card-background);
  --border-radius: var(--radius-card);
  --padding-start: var(--spacing-base);
  --padding-end: var(--spacing-base);
  --inner-padding-end: 0;
  margin-bottom: var(--spacing-sm);
  border: var(--card-border-width) solid var(--card-border-color);
  box-shadow: var(--shadow-card);
}

.food-log-entry ion-avatar {
  width: 40px;
  height: 40px;
  background: var(--color-primary-100);
  display: flex;
  align-items: center;
  justify-content: center;
}

.food-log-entry ion-avatar ion-icon {
  font-size: 24px;
  color: var(--color-primary);
}

.food-log-entry h3 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.food-log-entry p {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: var(--spacing-xs) 0;
}

.nutrition-info {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}
</style>

