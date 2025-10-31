<template>
  <ion-item>
    <ion-label position="stacked">{{ label }}</ion-label>
    <ion-input
      :value="modelValue"
      type="number"
      :placeholder="placeholder"
      :min="min"
      :max="max"
      :disabled="disabled"
      @ion-input="handleInput"
    />
    <span v-if="unit" slot="end" class="unit">{{ unit }}</span>
  </ion-item>
</template>

<script setup lang="ts">
import { IonItem, IonLabel, IonInput } from '@ionic/vue'

interface Props {
  modelValue: number | null | undefined
  label: string
  placeholder?: string
  unit?: string
  min?: number
  max?: number
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

function handleInput(event: Event) {
  const target = event.target as HTMLIonInputElement
  const value = target.value
  emit('update:modelValue', value ? Number(value) : null)
}
</script>

<style scoped>
.unit {
  color: var(--color-text-tertiary);
  margin-left: var(--spacing-sm);
  font-size: var(--typography-small-size);
}
</style>

