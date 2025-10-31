<template>
  <ion-button
    :color="color"
    :expand="expand"
    :fill="fill"
    :disabled="disabled"
    :size="size"
    @click="$emit('click', $event)"
  >
    <slot />
  </ion-button>
</template>

<script setup lang="ts">
import { IonButton } from '@ionic/vue'

interface Props {
  color?: string
  expand?: 'full' | 'block'
  fill?: 'clear' | 'outline' | 'solid' | 'default'
  disabled?: boolean
  size?: 'small' | 'default' | 'large'
}

withDefaults(defineProps<Props>(), {
  color: 'primary',
  fill: 'solid',
  disabled: false,
  size: 'default'
})

defineEmits<{
  click: [event: Event]
}>()
</script>

