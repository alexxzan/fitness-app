<template>
  <div class="circular-progress">
    <svg class="progress-ring" :width="size" :height="size">
      <circle
        class="progress-ring-background"
        :cx="center"
        :cy="center"
        :r="radius"
        :stroke-width="strokeWidth"
      />
      <circle
        class="progress-ring-progress"
        :cx="center"
        :cy="center"
        :r="radius"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        :style="{ stroke: color }"
      />
    </svg>
    <div class="progress-content">
      <div class="progress-value">{{ displayValue }}</div>
      <div v-if="label" class="progress-label">{{ label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  unit?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 120,
  strokeWidth: 8,
  color: "var(--color-primary)",
  unit: "",
});

const center = computed(() => props.size / 2);
const radius = computed(() => props.size / 2 - props.strokeWidth / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);
const progress = computed(() => Math.min(props.value / props.max, 1));
const offset = computed(() => circumference.value * (1 - progress.value));

const displayValue = computed(() => {
  const rounded = Math.round(props.value);
  return props.unit ? `${rounded}${props.unit}` : rounded.toString();
});
</script>

<style scoped>
.circular-progress {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-background {
  fill: none;
  stroke: var(--color-background-tertiary);
}

.progress-ring-progress {
  fill: none;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.3s ease;
}

.progress-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-value {
  font-size: var(--typography-heading-size-sm);
  font-weight: var(--typography-weight-bold);
  color: var(--color-text-primary);
}

.progress-label {
  font-size: var(--typography-caption-size);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-xs);
}
</style>

