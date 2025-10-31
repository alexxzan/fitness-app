<template>
  <ion-item>
    <ion-label v-if="label" :position="labelPosition">{{ label }}</ion-label>
    <AppInput
      :model-value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      @update:model-value="$emit('update:modelValue', $event)"
      @blur="$emit('blur', $event)"
    />
  </ion-item>
</template>

<script setup lang="ts">
import { IonItem, IonLabel } from "@ionic/vue";
import AppInput from "@/components/atoms/AppInput.vue";

interface Props {
  modelValue: string | number | null | undefined;
  label?: string;
  type?: "text" | "number" | "email" | "password" | "tel" | "url";
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  labelPosition?: "fixed" | "stacked" | "floating";
}

withDefaults(defineProps<Props>(), {
  type: "text",
  disabled: false,
  readonly: false,
  labelPosition: "stacked",
});

defineEmits<{
  "update:modelValue": [value: string | number | null | undefined];
  blur: [event: Event];
}>();
</script>
