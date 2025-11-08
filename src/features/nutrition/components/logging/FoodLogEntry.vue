<template>
  <div v-if="log.food" class="food-log-entry">
    <div class="entry-content">
      <div class="entry-main">
        <div class="food-name-row">
          <h3 class="food-name">{{ log.food.name }}</h3>
          <span v-if="log.mealType" class="meal-badge">{{
            formatMealType(log.mealType)
          }}</span>
        </div>
        <div class="entry-meta">
          <span class="quantity">{{ formatQuantity(log.quantity) }}x</span>
          <span class="nutrition-stats">
            <span class="stat-item">
              <span class="stat-value">{{
                Math.round(log.food.calories * log.quantity)
              }}</span>
              <span class="stat-label">cal</span>
            </span>
            <span class="stat-item stat-item-protein">
              <span class="stat-value"
                >{{ Math.round(log.food.protein * log.quantity) }}g</span
              >
              <span class="stat-label">P</span>
            </span>
            <span class="stat-item stat-item-carbs">
              <span class="stat-value"
                >{{ Math.round(log.food.carbs * log.quantity) }}g</span
              >
              <span class="stat-label">C</span>
            </span>
            <span class="stat-item stat-item-fats">
              <span class="stat-value"
                >{{ Math.round(log.food.fats * log.quantity) }}g</span
              >
              <span class="stat-label">F</span>
            </span>
          </span>
        </div>
      </div>
      <div class="entry-actions">
        <button
          class="action-btn edit-btn"
          @click="$emit('edit', log)"
          aria-label="Edit"
        >
          <ion-icon :icon="create" />
        </button>
        <button
          class="action-btn delete-btn"
          @click="$emit('delete', log.id)"
          aria-label="Delete"
        >
          <ion-icon :icon="trash" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from "@ionic/vue";
import { create, trash } from "ionicons/icons";
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
  background: var(--card-background, var(--color-surface));
  border-radius: var(--radius-card, 8px);
  border: 1px solid var(--card-border-color, var(--color-border));
  margin-bottom: var(--spacing-xs);
  transition: all 0.2s ease;
}

.food-log-entry:hover {
  border-color: var(--color-border-hover);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.entry-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-base);
  gap: var(--spacing-base);
}

.entry-main {
  flex: 1;
  min-width: 0;
}

.food-name-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
  flex-wrap: wrap;
}

.food-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-tight);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meal-badge {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  background: var(--color-surface-hover);
  padding: 2px var(--spacing-xs);
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  flex-shrink: 0;
}

.entry-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.quantity {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

.nutrition-stats {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: baseline;
  gap: 2px;
  font-size: var(--font-size-xs);
}

.stat-value {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.stat-label {
  font-weight: var(--font-weight-normal);
  color: var(--color-text-tertiary);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-item-protein .stat-label {
  color: var(--color-info);
}

.stat-item-carbs .stat-label {
  color: var(--color-warning);
}

.stat-item-fats .stat-label {
  color: var(--color-error);
}

.entry-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--color-text-secondary);
  padding: 0;
}

.action-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.action-btn:active {
  transform: scale(0.95);
}

.edit-btn:hover {
  color: var(--color-primary);
}

.delete-btn:hover {
  color: var(--color-error);
}

.action-btn ion-icon {
  font-size: 18px;
}

/* Ensure touch targets meet accessibility requirements */
@media (pointer: coarse) {
  .action-btn {
    min-width: var(--min-touch-target, 44px);
    min-height: var(--min-touch-target, 44px);
  }
}
</style>
