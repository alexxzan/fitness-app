<template>
  <ion-searchbar
    :value="modelValue"
    :placeholder="placeholder"
    :show-cancel-button="showCancelButton"
    :debounce="debounce"
    @ion-input="handleInput"
    @ion-clear="$emit('clear')"
  />
</template>

<script setup lang="ts">
import { IonSearchbar } from "@ionic/vue";

interface Props {
  modelValue: string;
  placeholder?: string;
  showCancelButton?: "never" | "focus" | "always";
  debounce?: number;
}

withDefaults(defineProps<Props>(), {
  placeholder: "Search...",
  showCancelButton: "focus",
  debounce: 300,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  clear: [];
}>();

function handleInput(event: Event) {
  const target = event.target as HTMLIonSearchbarElement;
  emit("update:modelValue", target.value || "");
}
</script>
