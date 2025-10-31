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

