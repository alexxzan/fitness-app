<template>
  <ion-card :button="button" @click="$emit('click', $event)">
    <slot />
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard } from '@ionic/vue'

interface Props {
  button?: boolean
}

withDefaults(defineProps<Props>(), {
  button: false
})

defineEmits<{
  click: [event: Event]
}>()
</script>

<style scoped>
ion-card {
  --padding-start: var(--card-padding);
  --padding-end: var(--card-padding);
  --padding-top: var(--card-padding);
  --padding-bottom: var(--card-padding);
  --background: var(--card-background);
  --border-width: var(--card-border-width);
  --border-style: solid;
  --border-color: var(--card-border-color);
  --border-radius: var(--radius-card);
  --box-shadow: var(--shadow-card);
  --transition: var(--transition-shadow);
}

ion-card[button]:hover {
  --box-shadow: var(--shadow-card-hover);
  cursor: pointer;
}

ion-card:focus-visible {
  outline: var(--focus-ring);
  outline-offset: var(--focus-ring-offset);
}
</style>

