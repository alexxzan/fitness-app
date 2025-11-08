<template>
  <div class="quick-stats">
    <div class="stat-card" v-if="adherenceScore !== null">
      <div class="stat-icon adherence">
        <ion-icon :icon="checkmarkCircle" />
      </div>
      <div class="stat-content">
        <div class="stat-value">{{ adherenceScore }}%</div>
        <div class="stat-label">Adherence</div>
      </div>
    </div>

    <div class="stat-card" v-if="caloriesRemaining !== null">
      <div class="stat-icon calories">
        <ion-icon :icon="flame" />
      </div>
      <div class="stat-content">
        <div class="stat-value">{{ Math.round(caloriesRemaining || 0) }}</div>
        <div class="stat-label">Calories Left</div>
      </div>
    </div>

    <div class="stat-card" v-if="proteinRemaining !== null">
      <div class="stat-icon protein">
        <ion-icon :icon="barbell" />
      </div>
      <div class="stat-content">
        <div class="stat-value">{{ Math.round(proteinRemaining || 0) }}g</div>
        <div class="stat-label">Protein Left</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from "@ionic/vue";
import { checkmarkCircle, flame, barbell } from "ionicons/icons";

interface Props {
  adherenceScore?: number | null;
  caloriesRemaining?: number | null;
  proteinRemaining?: number | null;
}

defineProps<Props>();
</script>

<style scoped>
.quick-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-base);
  padding: 0 var(--spacing-base);
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  background: var(--card-background);
  border-radius: var(--radius-card);
  padding: var(--spacing-base);
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  border: var(--card-border-width) solid var(--card-border-color);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.stat-icon.adherence {
  background: var(--color-success-100);
  color: var(--color-success-600);
}

.stat-icon.calories {
  background: var(--color-warning-100);
  color: var(--color-warning-600);
}

.stat-icon.protein {
  background: var(--color-info-100);
  color: var(--color-info-600);
}

.stat-content {
  text-align: center;
}

.stat-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-xs);
}
</style>
