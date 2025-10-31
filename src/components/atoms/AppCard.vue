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

