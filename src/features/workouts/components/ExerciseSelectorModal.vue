<template>
  <ion-modal
    :is-open="isOpen"
    @did-dismiss="$emit('close')"
  >
    <ion-header>
      <ion-toolbar>
        <ion-title>Add Exercise</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('close')">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ExerciseSelector
        :exercises="exercises"
        @select="handleSelect"
      />
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
} from '@ionic/vue'
import ExerciseSelector from '@/features/exercises/components/ExerciseSelector.vue'
import type { Exercise } from '@/features/exercises/types/exercise.types'

interface Props {
  isOpen: boolean
  exercises: Exercise[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [exercise: Exercise]
  close: []
}>()

function handleSelect(exercise: Exercise) {
  emit('select', exercise)
}
</script>

