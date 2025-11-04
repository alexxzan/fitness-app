<template>
  <div
    v-if="isOpen"
    class="rest-time-picker-overlay"
    :class="{ 'rest-time-picker-overlay--visible': isOpen }"
    @click.self="handleDismiss"
  >
    <div class="rest-time-picker-modal">
      <div class="picker-header">
        <h3 class="picker-title">Rest Time</h3>
        <button class="picker-close" @click="handleDismiss" aria-label="Close">
          <ion-icon :icon="close" />
        </button>
      </div>
      <div class="picker-content">
        <div class="picker-values">
          <button
            v-for="(option, index) in restTimeOptions"
            :key="option.value"
            class="picker-option"
            :class="{
              'picker-option--selected': option.value === selectedValue,
            }"
            @click="handleOptionClick(index)"
          >
            {{ option.text }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { IonIcon } from "@ionic/vue";
import { close } from "ionicons/icons";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

interface Props {
  isOpen: boolean;
  selectedValue: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  update: [value: number];
  dismiss: [];
}>();

// Format seconds to MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

// Rest time options (15-second increments from 00:15 to 05:00)
const restTimeOptions = computed(() => {
  const options = [];
  for (let i = 15; i <= 300; i += 15) {
    options.push({
      text: formatTime(i),
      value: i,
    });
  }
  return options;
});

async function handleOptionClick(index: number) {
  const selectedOption = restTimeOptions.value[index];
  if (selectedOption) {
    emit("update", selectedOption.value);
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      // Haptics not available
    }
  }
}

function handleDismiss() {
  emit("dismiss");
}
</script>

<style scoped>
.rest-time-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  opacity: 0;
  transition: opacity 0.3s ease-out;
  pointer-events: none;
}

.rest-time-picker-overlay--visible {
  opacity: 1;
  pointer-events: auto;
}

.rest-time-picker-modal {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50vh;
  max-height: 50vh;
  min-height: 50vh;
  background: var(--color-surface);
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.2);
  transform: translateY(100%);
  transition: transform 0.3s ease-out;
  padding-bottom: env(safe-area-inset-bottom);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 10001;
}

.rest-time-picker-overlay--visible .rest-time-picker-modal {
  transform: translateY(0);
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-base);
  border-bottom: var(--border-width-thin) solid var(--color-border);
  flex-shrink: 0;
}

.picker-title {
  font-size: var(--typography-h3-size);
  font-weight: var(--typography-h3-weight);
  color: var(--color-text-primary);
  margin: 0;
}

.picker-close {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.picker-close:hover {
  background: var(--color-background-elevated);
  color: var(--color-text-primary);
}

.picker-close:active {
  transform: scale(0.95);
}

.picker-close ion-icon {
  font-size: 24px;
}

.picker-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-base);
}

.picker-values {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.picker-option {
  padding: var(--spacing-base);
  background: var(--color-background-elevated);
  border: var(--border-width-thin) solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--typography-body-size);
  font-weight: var(--typography-body-weight-medium);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  min-height: 44px;
}

.picker-option:hover {
  background: var(--color-primary-100);
  border-color: var(--color-primary-300);
  color: var(--color-primary-700);
}

.picker-option--selected {
  background: var(--color-primary-500);
  border-color: var(--color-primary-600);
  color: white;
  font-weight: var(--typography-body-weight-semibold);
}

.picker-option--selected:hover {
  background: var(--color-primary-600);
  border-color: var(--color-primary-700);
}
</style>

