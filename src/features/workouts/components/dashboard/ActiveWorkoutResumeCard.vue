<template>
  <div v-if="show" class="active-workout-resume-card">
    <AppCard>
      <div class="resume-content">
        <div class="resume-header">
          <div class="resume-icon">
            <ion-icon :icon="playCircle" />
          </div>
          <div class="resume-info">
            <h3 class="workout-name">{{ workout.name }}</h3>
            <p class="workout-progress">{{ progressPercentage }}% Complete</p>
          </div>
        </div>

        <div class="resume-stats">
          <div class="stat">
            <ion-icon :icon="time" />
            <span>{{ timeElapsed }}</span>
          </div>
          <div class="stat">
            <ion-icon :icon="barbell" />
            <span>{{ exercisesCount }} exercises</span>
          </div>
        </div>

        <ion-button
          class="resume-button"
          expand="block"
          @click="$emit('resume')"
        >
          <ion-icon :icon="play" slot="start" />
          Resume Workout
        </ion-button>
      </div>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonButton, IonIcon } from '@ionic/vue'
import { playCircle, play, time, barbell } from 'ionicons/icons'
import type { Workout } from '../../types/workout.types'
import AppCard from '@/components/atoms/AppCard.vue'

interface Props {
  show?: boolean
  workout?: Workout
  progressPercentage?: number
  timeElapsed?: string
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  workout: () => ({
    id: '',
    name: 'Upper Body Workout',
    type: 'regular',
    exercises: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }),
  progressPercentage: 45,
  timeElapsed: '23 min'
})

const emit = defineEmits<{
  resume: []
}>()

const exercisesCount = computed(() => {
  return props.workout?.exercises?.length || 0
})
</script>

<style scoped>
.active-workout-resume-card {
  margin-bottom: var(--spacing-xl);
  padding: 0 var(--spacing-base);
}

.resume-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
}

.resume-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
}

.resume-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    var(--color-primary-500) 0%,
    var(--color-primary-600) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-primary);
}

.resume-icon ion-icon {
  font-size: 28px;
}

.resume-info {
  flex: 1;
  min-width: 0;
}

.workout-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  line-height: var(--line-height-tight);
}

.workout-progress {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.resume-stats {
  display: flex;
  gap: var(--spacing-lg);
  padding: var(--spacing-sm) 0;
}

.resume-stats .stat {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.resume-stats .stat ion-icon {
  font-size: 16px;
  color: var(--color-text-tertiary);
}

.resume-button {
  --background: linear-gradient(
    135deg,
    var(--color-primary-500) 0%,
    var(--color-primary-600) 100%
  );
  --color: var(--color-text-primary);
  --padding-top: var(--spacing-md);
  --padding-bottom: var(--spacing-md);
  margin-top: var(--spacing-xs);
}
</style>

