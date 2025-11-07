<template>
  <ion-modal
    :is-open="isOpen"
    @did-dismiss="$emit('cancel')"
  >
    <ion-header>
      <ion-toolbar>
        <ion-title>Start Interval Workout</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('cancel')">Cancel</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <IntervalWorkoutConfig
        ref="intervalConfigRef"
        @start="handleStart"
        @cancel="$emit('cancel')"
        @open-exercise-selector="$emit('openExerciseSelector')"
      />
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
} from '@ionic/vue'
import IntervalWorkoutConfig from './IntervalWorkoutConfig.vue'

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  start: [config: {
    name: string
    workDuration: number
    restDuration: number
    rounds: number
    exercises: any[]
  }]
  cancel: []
  openExerciseSelector: []
}>()

const intervalConfigRef = ref<InstanceType<typeof IntervalWorkoutConfig> | null>(null)

function handleStart(config: {
  name: string
  workDuration: number
  restDuration: number
  rounds: number
  exercises: any[]
}) {
  emit('start', config)
}

// Expose method for parent component to add exercises
function addExercise(exercise: { exerciseId: string, name: string }) {
  intervalConfigRef.value?.addExercise(exercise)
}

defineExpose({
  addExercise
})
</script>

