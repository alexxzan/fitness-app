<template>
  <div class="daily-log-list">
    <div v-if="loading" class="loading-state">
      <ion-spinner />
    </div>
    <div v-else-if="logs.length === 0" class="empty-state">
      <ion-icon :icon="restaurantOutline" class="empty-icon" />
      <p>No foods logged today</p>
      <p class="empty-hint">Tap the + button to add food</p>
    </div>
    <div v-else class="log-items">
      <FoodLogEntry
        v-for="log in logs"
        :key="log.id"
        :log="log"
        @edit="$emit('edit', log)"
        @delete="$emit('delete', log.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon, IonSpinner } from "@ionic/vue";
import { restaurantOutline } from "ionicons/icons";
import FoodLogEntry from "../logging/FoodLogEntry.vue";
import type { FoodLog, Food } from "@/features/nutrition/types/food.types";

interface Props {
  logs: Array<FoodLog & { food: Food | null }>;
  loading?: boolean;
}

defineProps<Props>();
defineEmits<{
  edit: [log: FoodLog & { food: Food | null }];
  delete: [id: string];
}>();
</script>

<style scoped>
.daily-log-list {
  padding: 0 var(--spacing-base);
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: var(--color-text-tertiary);
  opacity: 0.5;
  margin-bottom: var(--spacing-base);
}

.empty-state p {
  color: var(--color-text-secondary);
  margin: var(--spacing-xs) 0;
}

.empty-hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}

.log-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
</style>

