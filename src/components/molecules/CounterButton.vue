<template>
  <div class="counter-button">
    <AppButton
      :color="color"
      fill="outline"
      size="small"
      :disabled="disabled || (min !== undefined && modelValue <= min)"
      @click="decrement"
    >
      <ion-icon :icon="remove" />
    </AppButton>
    <span class="counter-value">{{ modelValue }}</span>
    <AppButton
      :color="color"
      fill="outline"
      size="small"
      :disabled="disabled || (max !== undefined && modelValue >= max)"
      @click="increment"
    >
      <ion-icon :icon="add" />
    </AppButton>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from "@ionic/vue";
import { add, remove } from "ionicons/icons";
import AppButton from "@/components/atoms/AppButton.vue";

interface Props {
  modelValue: number;
  min?: number;
  max?: number;
  step?: number;
  color?: string;
  disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  step: 1,
  color: "primary",
  disabled: false,
});

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:modelValue": [value: number];
}>();

function increment() {
  const step = props.step ?? 1;
  const newValue = props.modelValue + step;
  if (props.max === undefined || newValue <= props.max) {
    emit("update:modelValue", newValue);
  }
}

function decrement() {
  const step = props.step ?? 1;
  const newValue = props.modelValue - step;
  if (props.min === undefined || newValue >= props.min) {
    emit("update:modelValue", newValue);
  }
}
</script>

<style scoped>
.counter-button {
  display: flex;
  align-items: center;
  gap: var(--button-gap);
}

.counter-value {
  min-width: var(--spacing-2xl);
  text-align: center;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}
</style>
