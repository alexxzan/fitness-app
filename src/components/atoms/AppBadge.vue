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

