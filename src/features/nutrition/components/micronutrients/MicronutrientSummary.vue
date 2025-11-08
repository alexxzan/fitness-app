<template>
  <div class="micronutrient-summary">
    <div class="section-header">
      <h2 class="section-title">Micronutrients</h2>
      <ion-button fill="clear" size="small" @click="showDetails = !showDetails">
        <ion-icon :icon="showDetails ? chevronUp : chevronDown" slot="icon-only" />
      </ion-button>
    </div>
    <div v-if="isLoading" class="loading-state">
      <ion-spinner />
    </div>
    <div v-else-if="summary" class="summary-content">
      <div class="summary-grid">
        <div
          v-for="(percentage, name) in summary.percentages"
          :key="name"
          class="micronutrient-item"
          :class="{ 'low': percentage < 50, 'good': percentage >= 100 }"
        >
          <div class="micronutrient-name">{{ formatName(name) }}</div>
          <div class="micronutrient-bar">
            <div
              class="micronutrient-fill"
              :style="{ width: `${Math.min(percentage, 100)}%` }"
            />
          </div>
          <div class="micronutrient-percentage">{{ Math.round(percentage) }}%</div>
        </div>
      </div>
      <div v-if="showDetails" class="details-section">
        <h3>Daily Values</h3>
        <div class="details-grid">
          <div
            v-for="(value, name) in summary.values"
            :key="name"
            class="detail-item"
          >
            <span class="detail-label">{{ formatName(name) }}</span>
            <span class="detail-value">{{ formatValue(name, value || 0) }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <p>No micronutrient data available</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { IonButton, IonIcon, IonSpinner } from "@ionic/vue";
import { chevronUp, chevronDown } from "ionicons/icons";
import { useMicronutrients } from "@/features/nutrition/composables/useMicronutrients";
import type { MicronutrientSummary } from "@/features/nutrition/types/micronutrients.types";

const { isLoading, calculateToday, dailyValues, dailyPercentages } = useMicronutrients();
const summary = ref<MicronutrientSummary | null>(null);
const showDetails = ref(false);

onMounted(async () => {
  summary.value = await calculateToday();
});

function formatName(name: string): string {
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function formatValue(name: string, value: number): string {
  // Determine unit based on micronutrient name
  if (name.includes("vitamin") || name.includes("folate") || name.includes("biotin") || name.includes("selenium") || name.includes("chromium") || name.includes("molybdenum") || name.includes("iodine")) {
    return `${Math.round(value)} mcg`;
  }
  if (name.includes("calcium") || name.includes("iron") || name.includes("magnesium") || name.includes("phosphorus") || name.includes("potassium") || name.includes("sodium") || name.includes("zinc") || name.includes("copper") || name.includes("manganese")) {
    return `${Math.round(value)} mg`;
  }
  if (name.includes("fiber") || name.includes("sugar") || name.includes("Fat")) {
    return `${Math.round(value)} g`;
  }
  return `${Math.round(value)}`;
}
</script>

<style scoped>
.micronutrient-summary {
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

.loading-state,
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
}

.summary-content {
  background: var(--card-background);
  border-radius: var(--radius-card);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-card);
  border: var(--card-border-width) solid var(--card-border-color);
}

.summary-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
}

.micronutrient-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.micronutrient-name {
  flex: 0 0 120px;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.micronutrient-bar {
  flex: 1;
  height: 8px;
  background: var(--color-secondary-200);
  border-radius: 4px;
  overflow: hidden;
}

.micronutrient-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

.micronutrient-item.low .micronutrient-fill {
  background: var(--color-error);
}

.micronutrient-item.good .micronutrient-fill {
  background: var(--color-success);
}

.micronutrient-percentage {
  flex: 0 0 50px;
  text-align: right;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.details-section {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.details-section h3 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-base) 0;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.detail-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.detail-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}
</style>

