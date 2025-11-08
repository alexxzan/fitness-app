<template>
  <div class="macro-progress-bar">
    <div class="progress-header">
      <ion-label>
        <h3>{{ label }}</h3>
      </ion-label>
      <div class="progress-values">
        <ion-text :color="getProgressColor()">
          <strong>{{ Math.round(value) }}{{ unit }}</strong>
        </ion-text>
        <ion-text color="medium" class="target-value">
          / {{ Math.round(max) }}{{ unit }}
        </ion-text>
      </div>
    </div>
    <ion-progress-bar
      :value="progress"
      :color="getProgressColor()"
      class="progress-bar"
    ></ion-progress-bar>
    <div class="progress-footer">
      <ion-text
        v-if="remaining > 0"
        color="medium"
        class="remaining-text"
      >
        {{ remainingLabel }}: {{ Math.round(remaining) }}{{ unit }}
      </ion-text>
      <ion-text
        v-else-if="remaining < 0"
        color="danger"
        class="over-text"
      >
        Over by {{ Math.round(Math.abs(remaining)) }}{{ unit }}
      </ion-text>
      <ion-text v-else color="success" class="complete-text">
        Complete!
      </ion-text>
      <ion-badge
        :color="getProgressColor()"
        class="percentage-badge"
      >
        {{ Math.round(progress * 100) }}%
      </ion-badge>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  IonProgressBar,
  IonLabel,
  IonText,
  IonBadge,
} from "@ionic/vue";

interface Props {
  label: string;
  value: number;
  max: number;
  unit?: string;
  color?: string;
  remainingLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  unit: "",
  remainingLabel: "Remaining",
});

const progress = computed(() => {
  if (props.max === 0) return 0;
  return Math.min(Math.max(props.value / props.max, 0), 1);
});

const remaining = computed(() => props.max - props.value);

function getProgressColor(): string {
  if (props.color) return props.color;
  
  const progressValue = progress.value;
  if (progressValue >= 1) return "danger";
  if (progressValue >= 0.9) return "warning";
  return "success";
}
</script>

<style scoped>
.macro-progress-bar {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--color-background-secondary);
  border-radius: var(--radius-card);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-header h3 {
  margin: 0;
  font-size: var(--typography-body-size);
  font-weight: var(--typography-weight-medium);
}

.progress-values {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-xs);
}

.target-value {
  font-size: var(--typography-caption-size);
}

.progress-bar {
  height: 8px;
  border-radius: var(--radius-full);
}

.progress-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--typography-caption-size);
}

.remaining-text,
.over-text,
.complete-text {
  font-size: var(--typography-caption-size);
}

.percentage-badge {
  font-size: var(--typography-caption-size);
}
</style>

