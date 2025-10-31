<template>
  <ion-badge :color="color">
    <slot />
  </ion-badge>
</template>

<script setup lang="ts">
import { IonBadge } from '@ionic/vue'

interface Props {
  color?: string
}

withDefaults(defineProps<Props>(), {
  color: 'primary'
})
</script>

<style scoped>
ion-badge {
  --padding-start: var(--badge-padding-x);
  --padding-end: var(--badge-padding-x);
  --padding-top: var(--badge-padding-y);
  --padding-bottom: var(--badge-padding-y);
  --font-size: var(--badge-font-size);
  --font-weight: var(--badge-font-weight);
  --border-radius: var(--radius-badge);
  --min-height: var(--badge-height);
  --height: var(--badge-height);
}
</style>

