<template>
  <AppCard :button="button" @click="$emit('click', exercise)">
    <ion-card-header>
      <ion-card-title>{{ exercise.name }}</ion-card-title>
      <ion-card-subtitle>
        <AppBadge v-for="bodyPart in exercise.bodyParts" :key="bodyPart" color="primary">
          {{ bodyPart }}
        </AppBadge>
      </ion-card-subtitle>
    </ion-card-header>
    <ion-card-content>
      <div v-if="exercise.targetMuscles && exercise.targetMuscles.length > 0" class="tags">
        <AppBadge v-for="muscle in exercise.targetMuscles" :key="muscle" color="secondary">
          {{ muscle }}
        </AppBadge>
      </div>
      <div v-if="exercise.equipments && exercise.equipments.length > 0" class="tags">
        <AppBadge v-for="equipment in exercise.equipments" :key="equipment" color="tertiary">
          {{ equipment }}
        </AppBadge>
      </div>
    </ion-card-content>
  </AppCard>
</template>

<script setup lang="ts">
import { IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent } from '@ionic/vue'
import type { Exercise } from '../types/exercise.types'
import AppCard from '@/components/atoms/AppCard.vue'
import AppBadge from '@/components/atoms/AppBadge.vue'

interface Props {
  exercise: Exercise
  button?: boolean
}

withDefaults(defineProps<Props>(), {
  button: false
})

defineEmits<{
  click: [exercise: Exercise]
}>()
</script>

<style scoped>
.tags {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  flex-wrap: wrap;
}
</style>

