<template>
  <AppCard :button="true" @click="$emit('click', workout)">
    <ion-card-header>
      <ion-card-title>{{ workout.name }}</ion-card-title>
      <ion-card-subtitle>{{ formattedDate }}</ion-card-subtitle>
    </ion-card-header>
    <ion-card-content>
      <div class="workout-stats">
        <div class="stat-item">
          <ion-icon :icon="barbell" />
          <span>{{ workout.exercises.length }} exercises</span>
        </div>
        <div v-if="totalSets > 0" class="stat-item">
          <ion-icon :icon="layers" />
          <span>{{ totalSets }} sets</span>
        </div>
        <div v-if="duration > 0" class="stat-item">
          <ion-icon :icon="time" />
          <span>{{ duration }} min</span>
        </div>
      </div>
    </ion-card-content>
  </AppCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonIcon } from '@ionic/vue'
import { barbell, layers, time } from 'ionicons/icons'
import type { Workout } from '../types/workout.types'
import AppCard from '@/components/atoms/AppCard.vue'

interface Props {
  workout: Workout
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [workout: Workout]
}>()

const formattedDate = computed(() => {
  const date = new Date(props.workout.createdAt)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
})

const totalSets = computed(() => {
  return props.workout.exercises.reduce((total, ex) => total + ex.sets.length, 0)
})

const duration = computed(() => {
  if (!props.workout.startTime) return 0
  const start = new Date(props.workout.startTime)
  const end = props.workout.endTime ? new Date(props.workout.endTime) : new Date()
  return Math.round((end.getTime() - start.getTime()) / 1000 / 60)
})
</script>

<style scoped>
.workout-stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--ion-color-medium);
  font-size: 0.9em;
}

.stat-item ion-icon {
  font-size: 1.2em;
}
</style>

