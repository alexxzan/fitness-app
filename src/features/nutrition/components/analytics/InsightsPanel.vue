<template>
  <div class="insights-panel" v-if="insights.length > 0">
    <h2 class="section-title">Insights</h2>
    <div class="insights-list">
      <div v-for="(insight, index) in insights" :key="index" class="insight-item">
        <ion-icon :icon="bulb" class="insight-icon" />
        <p>{{ insight }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from "@ionic/vue";
import { bulb } from "ionicons/icons";

interface Props {
  insights: string[];
}

defineProps<Props>();
</script>

<style scoped>
.insights-panel {
  padding: 0 var(--spacing-base);
  margin-bottom: var(--spacing-xl);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-base) 0;
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.insight-item {
  background: var(--card-background);
  border-radius: var(--radius-card);
  padding: var(--spacing-base);
  box-shadow: var(--shadow-card);
  border: var(--card-border-width) solid var(--card-border-color);
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
}

.insight-icon {
  color: var(--color-warning);
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.insight-item p {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  line-height: 1.5;
}
</style>

