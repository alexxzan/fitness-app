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

