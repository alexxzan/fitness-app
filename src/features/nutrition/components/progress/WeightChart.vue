<template>
  <div class="weight-chart">
    <div class="chart-header">
      <h3 class="chart-title">Weight Trend</h3>
      <ion-select v-model="selectedPeriod" @ionChange="loadData">
        <ion-select-option value="7">7 days</ion-select-option>
        <ion-select-option value="30">30 days</ion-select-option>
        <ion-select-option value="90">90 days</ion-select-option>
      </ion-select>
    </div>
    <div v-if="loading" class="loading-state">
      <ion-spinner />
    </div>
    <div v-else-if="weightData.length === 0" class="empty-state">
      <p>No weight data available</p>
    </div>
    <div v-else class="chart-content">
      <div class="chart-stats">
        <div class="stat">
          <div class="stat-label">Current</div>
          <div class="stat-value">{{ formatWeight(currentWeight) }}</div>
        </div>
        <div class="stat" v-if="weightChange !== null">
          <div class="stat-label">Change</div>
          <div class="stat-value" :class="{ 'positive': weightChange > 0, 'negative': weightChange < 0 }">
            {{ weightChange > 0 ? '+' : '' }}{{ formatWeight(weightChange) }}
          </div>
        </div>
        <div class="stat" v-if="averageWeight !== null">
          <div class="stat-label">Average</div>
          <div class="stat-value">{{ formatWeight(averageWeight) }}</div>
        </div>
      </div>
      <div class="chart-visualization">
        <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" class="chart-svg">
          <polyline
            :points="chartPoints"
            fill="none"
            stroke="var(--color-primary)"
            stroke-width="2"
          />
          <circle
            v-for="(point, index) in chartPointsArray"
            :key="index"
            :cx="point.x"
            :cy="point.y"
            r="3"
            fill="var(--color-primary)"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { IonSelect, IonSelectOption, IonSpinner } from "@ionic/vue";
import { BodyMetricsRepository } from "@/features/nutrition/repositories/body-metrics.repository";
import type { WeightTrend } from "@/features/nutrition/types/body-metrics.types";

const selectedPeriod = ref("30");
const loading = ref(false);
const weightData = ref<WeightTrend[]>([]);

const chartWidth = 300;
const chartHeight = 150;
const padding = 20;

const currentWeight = computed(() => {
  return weightData.value.length > 0 ? weightData.value[weightData.value.length - 1].weight : null;
});

const weightChange = computed(() => {
  if (weightData.value.length < 2) return null;
  const first = weightData.value[0].weight;
  const last = weightData.value[weightData.value.length - 1].weight;
  return last - first;
});

const averageWeight = computed(() => {
  if (weightData.value.length === 0) return null;
  const sum = weightData.value.reduce((acc, item) => acc + item.weight, 0);
  return sum / weightData.value.length;
});

const chartPointsArray = computed(() => {
  if (weightData.value.length === 0) return [];
  
  const weights = weightData.value.map((d) => d.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const weightRange = maxWeight - minWeight || 1;

  const points = weightData.value.map((item, index) => {
    const x = padding + (index / (weightData.value.length - 1 || 1)) * (chartWidth - padding * 2);
    const y = chartHeight - padding - ((item.weight - minWeight) / weightRange) * (chartHeight - padding * 2);
    return { x, y };
  });

  return points;
});

const chartPoints = computed(() => {
  return chartPointsArray.value.map((p) => `${p.x},${p.y}`).join(" ");
});

onMounted(() => {
  loadData();
});

async function loadData() {
  loading.value = true;
  try {
    const days = parseInt(selectedPeriod.value);
    const trends = await BodyMetricsRepository.getWeightTrend(days);
    weightData.value = trends;
  } catch (error) {
    console.error("Failed to load weight data:", error);
  } finally {
    loading.value = false;
  }
}

function formatWeight(weight: number | null): string {
  if (weight === null) return "—";
  return `${weight.toFixed(1)} kg`;
}
</script>

<style scoped>
.weight-chart {
  background: var(--card-background);
  border-radius: var(--radius-card);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-card);
  border: var(--card-border-width) solid var(--card-border-color);
  margin-bottom: var(--spacing-xl);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.chart-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.loading-state,
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
}

.chart-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-base);
  margin-bottom: var(--spacing-lg);
}

.stat {
  text-align: center;
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.stat-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.stat-value.positive {
  color: var(--color-success);
}

.stat-value.negative {
  color: var(--color-error);
}

.chart-visualization {
  width: 100%;
  height: 150px;
  overflow: hidden;
}

.chart-svg {
  width: 100%;
  height: 100%;
}
</style>

