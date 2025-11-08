<template>
  <div class="target-display">
    <div class="section-header">
      <h2 class="section-title">Daily Targets</h2>
      <ion-button fill="clear" size="small" @click="$emit('edit')">
        <ion-icon :icon="create" slot="icon-only" />
      </ion-button>
    </div>
    <div class="target-card">
      <div class="target-item">
        <div class="target-label">Calories</div>
        <div class="target-value">{{ target.calories }}</div>
      </div>
      <div class="target-item">
        <div class="target-label">Protein</div>
        <div class="target-value">{{ target.protein }}g</div>
      </div>
      <div class="target-item">
        <div class="target-label">Carbs</div>
        <div class="target-value">{{ target.carbs }}g</div>
      </div>
      <div class="target-item">
        <div class="target-label">Fats</div>
        <div class="target-value">{{ target.fats }}g</div>
      </div>
      <div class="target-goal">
        <ion-chip :color="getGoalColor(target.goalType)">
          {{ formatGoalType(target.goalType) }}
        </ion-chip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonButton, IonIcon, IonChip } from "@ionic/vue";
import { create } from "ionicons/icons";
import type { NutritionTarget } from "@/features/nutrition/types/nutrition.types";

interface Props {
  target: NutritionTarget;
}

defineProps<Props>();
defineEmits<{
  edit: [];
}>();

function formatGoalType(goalType: string): string {
  return goalType.charAt(0).toUpperCase() + goalType.slice(1);
}

function getGoalColor(goalType: string): string {
  switch (goalType) {
    case "cutting":
      return "success";
    case "bulking":
      return "warning";
    case "maintenance":
      return "primary";
    default:
      return "medium";
  }
}
</script>

<style scoped>
.target-display {
  padding: 0 var(--spacing-base);
  margin-bottom: var(--spacing-xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-base);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.target-card {
  background: var(--card-background);
  border-radius: var(--radius-card);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-card);
  border: var(--card-border-width) solid var(--card-border-color);
}

.target-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-base) 0;
  border-bottom: 1px solid var(--color-border);
}

.target-item:last-of-type {
  border-bottom: none;
}

.target-label {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

.target-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.target-goal {
  margin-top: var(--spacing-base);
  padding-top: var(--spacing-base);
  border-top: 1px solid var(--color-border);
  text-align: center;
}
</style>

