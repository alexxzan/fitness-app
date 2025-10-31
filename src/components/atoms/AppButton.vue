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

<style scoped>
ion-button {
  --height: var(--button-height-base);
  --padding-start: var(--button-padding-x-base);
  --padding-end: var(--button-padding-x-base);
  --padding-top: var(--button-padding-y-base);
  --padding-bottom: var(--button-padding-y-base);
  --border-radius: var(--radius-button);
  --font-size: var(--button-font-size-base);
  --transition: var(--transition-all);
  --box-shadow: var(--shadow-button);
}

ion-button[size="small"] {
  --height: var(--button-height-sm);
  --padding-start: var(--button-padding-x-sm);
  --padding-end: var(--button-padding-x-sm);
  --padding-top: var(--button-padding-y-sm);
  --padding-bottom: var(--button-padding-y-sm);
  --font-size: var(--button-font-size-sm);
}

ion-button[size="large"] {
  --height: var(--button-height-lg);
  --padding-start: var(--button-padding-x-lg);
  --padding-end: var(--button-padding-x-lg);
  --padding-top: var(--button-padding-y-lg);
  --padding-bottom: var(--button-padding-y-lg);
  --font-size: var(--button-font-size-lg);
}

ion-button:not(:disabled):active {
  --box-shadow: var(--shadow-button-active);
}

ion-button:focus-visible {
  outline: var(--focus-ring);
  outline-offset: var(--focus-ring-offset);
}
</style>

