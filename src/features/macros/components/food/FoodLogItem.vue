<template>
  <ion-item-sliding>
    <ion-item button @click="$emit('edit', foodLog)">
      <ion-label>
        <h3>{{ foodLog.foodName }}</h3>
        <p class="food-macros">
          <ion-badge color="primary">
            {{ Math.round(foodLog.calories) }} kcal
          </ion-badge>
          <span class="macro-details">
            P: {{ Math.round(foodLog.protein) }}g | C:
            {{ Math.round(foodLog.carbs) }}g | F:
            {{ Math.round(foodLog.fats) }}g
          </span>
        </p>
        <p v-if="foodLog.notes" class="food-notes">{{ foodLog.notes }}</p>
      </ion-label>
      <ion-icon :icon="chevronForwardOutline" slot="end" color="medium"></ion-icon>
    </ion-item>
    <ion-item-options side="end">
      <ion-item-option
        color="primary"
        @click="handleDuplicate"
      >
        <ion-icon slot="icon-only" :icon="copyOutline"></ion-icon>
        Duplicate
      </ion-item-option>
      <ion-item-option
        color="danger"
        @click="handleDelete"
      >
        <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
        Delete
      </ion-item-option>
    </ion-item-options>
  </ion-item-sliding>
</template>

<script setup lang="ts">
import {
  IonItemSliding,
  IonItem,
  IonLabel,
  IonIcon,
  IonBadge,
  IonItemOptions,
  IonItemOption,
} from "@ionic/vue";
import {
  chevronForwardOutline,
  copyOutline,
  trashOutline,
} from "ionicons/icons";
import type { FoodLog } from "../../types/macro.types";

interface Props {
  foodLog: FoodLog;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  edit: [foodLog: FoodLog];
  duplicate: [foodLog: FoodLog];
  delete: [id: string];
}>();

function handleDuplicate() {
  emit("duplicate", props.foodLog);
}

function handleDelete() {
  emit("delete", props.foodLog.id);
}
</script>

<style scoped>
.food-macros {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xs);
}

.macro-details {
  font-size: var(--typography-caption-size);
  color: var(--color-text-secondary);
}

.food-notes {
  font-size: var(--typography-caption-size);
  color: var(--color-text-tertiary);
  font-style: italic;
  margin-top: var(--spacing-xs);
}
</style>

