<template>
  <div class="cardio-stats">
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-label">Distance</div>
        <div class="stat-value">{{ stats.distanceDisplay }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Duration</div>
        <div class="stat-value">{{ stats.durationDisplay }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Pace</div>
        <div class="stat-value">{{ stats.paceDisplay }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Elevation</div>
        <div class="stat-value">{{ elevationDisplay }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Calories</div>
        <div class="stat-value">{{ stats.calories }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { CardioStats } from "../../types/cardio.types";
import { RouteCalculatorService } from "../../services/route-calculator.service";

interface Props {
  stats: CardioStats;
  isImperial?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isImperial: false,
});

const elevationDisplay = computed(() => {
  if (props.isImperial) {
    const feet = props.stats.elevationGain * 3.28084;
    return `${Math.round(feet)} ft`;
  }
  return `${Math.round(props.stats.elevationGain)} m`;
});
</script>

<style scoped>
.cardio-stats {
  padding: var(--spacing-base);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-base);
}

.stat-item {
  text-align: center;
  padding: var(--spacing-sm);
  background: var(--ion-color-light);
  border-radius: var(--border-radius-md);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--ion-color-medium);
  margin-bottom: var(--spacing-xs);
  font-weight: var(--font-weight-medium);
}

.stat-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--ion-color-primary);
}
</style>

