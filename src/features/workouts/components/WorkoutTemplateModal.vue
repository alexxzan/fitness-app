<template>
  <ion-modal
    :is-open="isOpen"
    @did-dismiss="handleDismiss"
  >
    <ion-header>
      <ion-toolbar>
        <ion-title>Select Workout Template</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleDismiss">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <WorkoutTemplateSelector
        :templates="templates"
        @select="handleSelect"
      />
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent } from '@ionic/vue'
import type { WorkoutTemplate } from '../types/workout.types'
import WorkoutTemplateSelector from './WorkoutTemplateSelector.vue'

interface Props {
  isOpen: boolean
  templates: WorkoutTemplate[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [template: WorkoutTemplate]
  dismiss: []
}>()

function handleSelect(template: WorkoutTemplate) {
  emit('select', template)
}

function handleDismiss() {
  emit('dismiss')
}
</script>

