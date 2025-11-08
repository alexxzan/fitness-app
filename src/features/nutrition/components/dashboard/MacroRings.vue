<template>
  <div class="macro-rings-container">
    <div class="macro-rings">
      <!-- Calories Ring -->
      <div class="macro-ring">
        <div class="ring-wrapper">
          <svg class="ring" viewBox="0 0 100 100">
            <circle
              class="ring-background"
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--color-secondary-200)"
              stroke-width="8"
            />
            <circle
              class="ring-progress"
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--color-primary)"
              stroke-width="8"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="caloriesOffset"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div class="ring-content">
            <div class="ring-value">{{ current?.calories || 0 }}</div>
            <div class="ring-label">Calories</div>
            <div class="ring-target">/ {{ targets.calories }}</div>
          </div>
        </div>
      </div>

      <!-- Protein Ring -->
      <div class="macro-ring">
        <div class="ring-wrapper">
          <svg class="ring" viewBox="0 0 100 100">
            <circle
              class="ring-background"
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--color-secondary-200)"
              stroke-width="8"
            />
            <circle
              class="ring-progress"
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--color-info)"
              stroke-width="8"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="proteinOffset"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div class="ring-content">
            <div class="ring-value">{{ Math.round(current?.protein || 0) }}g</div>
            <div class="ring-label">Protein</div>
            <div class="ring-target">/ {{ targets.protein }}g</div>
          </div>
        </div>
      </div>

      <!-- Carbs Ring -->
      <div class="macro-ring">
        <div class="ring-wrapper">
          <svg class="ring" viewBox="0 0 100 100">
            <circle
              class="ring-background"
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--color-secondary-200)"
              stroke-width="8"
            />
            <circle
              class="ring-progress"
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--color-warning)"
              stroke-width="8"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="carbsOffset"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div class="ring-content">
            <div class="ring-value">{{ Math.round(current?.carbs || 0) }}g</div>
            <div class="ring-label">Carbs</div>
            <div class="ring-target">/ {{ targets.carbs }}g</div>
          </div>
        </div>
      </div>

      <!-- Fats Ring -->
      <div class="macro-ring">
        <div class="ring-wrapper">
          <svg class="ring" viewBox="0 0 100 100">
            <circle
              class="ring-background"
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--color-secondary-200)"
              stroke-width="8"
            />
            <circle
              class="ring-progress"
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--color-error)"
              stroke-width="8"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="fatsOffset"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div class="ring-content">
            <div class="ring-value">{{ Math.round(current?.fats || 0) }}g</div>
            <div class="ring-label">Fats</div>
            <div class="ring-target">/ {{ targets.fats }}g</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { MacroTargets } from "@/features/nutrition/types/nutrition.types";

interface Props {
  targets: MacroTargets;
  current?: MacroTargets;
  loading?: boolean;
}

const props = defineProps<Props>();

const circumference = 2 * Math.PI * 45; // radius = 45

const caloriesProgress = computed(() => {
  if (!props.current || props.targets.calories === 0) return 0;
  return Math.min(1, props.current.calories / props.targets.calories);
});

const proteinProgress = computed(() => {
  if (!props.current || props.targets.protein === 0) return 0;
  return Math.min(1, props.current.protein / props.targets.protein);
});

const carbsProgress = computed(() => {
  if (!props.current || props.targets.carbs === 0) return 0;
  return Math.min(1, props.current.carbs / props.targets.carbs);
});

const fatsProgress = computed(() => {
  if (!props.current || props.targets.fats === 0) return 0;
  return Math.min(1, props.current.fats / props.targets.fats);
});

const caloriesOffset = computed(() => circumference * (1 - caloriesProgress.value));
const proteinOffset = computed(() => circumference * (1 - proteinProgress.value));
const carbsOffset = computed(() => circumference * (1 - carbsProgress.value));
const fatsOffset = computed(() => circumference * (1 - fatsProgress.value));
</script>

<style scoped>
.macro-rings-container {
  padding: var(--spacing-lg) var(--spacing-base);
}

.macro-rings {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
}

.macro-ring {
  display: flex;
  justify-content: center;
  align-items: center;
}

.ring-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
}

.ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-background {
  opacity: 0.2;
}

.ring-progress {
  transition: stroke-dashoffset 0.3s ease;
  stroke-linecap: round;
}

.ring-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.ring-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: 1.2;
}

.ring-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-xs);
}

.ring-target {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  margin-top: var(--spacing-xs);
}
</style>

