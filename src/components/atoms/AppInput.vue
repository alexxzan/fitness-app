<template>
  <ion-input
    :value="modelValue"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :clear-on-edit="clearOnEdit"
    @ion-input="handleInput"
    @ion-blur="$emit('blur', $event)"
  />
</template>

<script setup lang="ts">
import { IonInput } from '@ionic/vue'

interface Props {
  modelValue: string | number | null | undefined
  type?: 'text' | 'number' | 'email' | 'password' | 'tel' | 'url'
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  clearOnEdit?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  readonly: false,
  clearOnEdit: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null | undefined]
  blur: [event: Event]
}>()

function handleInput(event: Event) {
  const target = event.target as HTMLIonInputElement
  emit('update:modelValue', target.value)
}
</script>

<style scoped>
ion-input {
  --padding-start: var(--input-padding-x);
  --padding-end: var(--input-padding-x);
  --padding-top: var(--input-padding-y);
  --padding-bottom: var(--input-padding-y);
  --min-height: var(--input-height-base);
  --height: var(--input-height-base);
  --background: var(--input-background);
  --border-width: var(--input-border-width);
  --border-style: solid;
  --border-color: var(--input-border-color);
  --border-radius: var(--radius-input);
  --font-size: var(--input-font-size);
  --transition: var(--transition-border);
}

ion-input:focus {
  --border-color: var(--input-border-color-focus);
}

ion-input[aria-invalid="true"],
ion-input.error {
  --border-color: var(--input-border-color-error);
}

ion-input:disabled {
  --background: var(--input-background-disabled);
  --opacity: var(--opacity-disabled);
}

ion-input:focus-visible {
  outline: var(--focus-ring);
  outline-offset: var(--focus-ring-offset);
}
</style>

