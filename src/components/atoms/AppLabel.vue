<template>
  <ion-label :position="position">
    <slot />
  </ion-label>
</template>

<script setup lang="ts">
import { IonLabel } from '@ionic/vue'

interface Props {
  position?: 'fixed' | 'stacked' | 'floating'
}

withDefaults(defineProps<Props>(), {
  position: undefined
})
</script>

<style scoped>
ion-label {
  --color: var(--color-text-primary);
  font-size: var(--typography-body-size);
  font-weight: var(--typography-body-weight);
  line-height: var(--typography-body-line-height);
}
</style>

