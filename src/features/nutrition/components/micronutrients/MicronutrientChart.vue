<template>
  <div class="micronutrient-chart">
    <h3 class="chart-title">{{ title }}</h3>
    <div class="chart-container">
      <div
        v-for="(percentage, name) in percentages"
        :key="name"
        class="chart-bar"
      >
        <div class="bar-label">{{ formatName(name) }}</div>
        <div class="bar-wrapper">
          <div
            class="bar-fill"
            :class="{ 'low': percentage < 50, 'good': percentage >= 100, 'high': percentage > 150 }"
            :style="{ width: `${Math.min(percentage, 200)}%` }"
          />
          <span class="bar-value">{{ Math.round(percentage) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  percentages: Record<string, number>;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Daily Values",
});

function formatName(name: string): string {
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}
</script>

<style scoped>
.micronutrient-chart {
  background: var(--card-background);
  border-radius: var(--radius-card);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-card);
  border: var(--card-border-width) solid var(--card-border-color);
}

.chart-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-base) 0;
}

.chart-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.chart-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.bar-label {
  flex: 0 0 100px;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-align: right;
}

.bar-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  position: relative;
  height: 24px;
}

.bar-fill {
  height: 16px;
  background: var(--color-primary);
  border-radius: 8px;
  transition: width 0.3s ease, background-color 0.3s ease;
  min-width: 2px;
}

.bar-fill.low {
  background: var(--color-error);
}

.bar-fill.good {
  background: var(--color-success);
}

.bar-fill.high {
  background: var(--color-warning);
}

.bar-value {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  min-width: 45px;
  text-align: left;
}
</style>

