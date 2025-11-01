<template>
  <ion-modal
    :is-open="isOpen"
    @did-dismiss="$emit('cancel')"
  >
    <ion-header>
      <ion-toolbar>
        <ion-title>Start Regular Workout</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <FormField
        v-model="workoutName"
        label="Workout Name"
        placeholder="Enter workout name"
      />
      <div class="button-group">
        <AppButton expand="block" @click="handleStart">
          Start
        </AppButton>
        <AppButton
          expand="block"
          fill="outline"
          @click="$emit('cancel')"
        >
          Cancel
        </AppButton>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/vue'
import AppButton from '@/components/atoms/AppButton.vue'
import FormField from '@/components/molecules/FormField.vue'

interface Props {
  isOpen: boolean
  defaultName?: string
}

const props = withDefaults(defineProps<Props>(), {
  defaultName: ''
})

const emit = defineEmits<{
  start: [name: string]
  cancel: []
}>()

const workoutName = ref(props.defaultName || `Workout - ${new Date().toLocaleDateString()}`)

watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    workoutName.value = props.defaultName || `Workout - ${new Date().toLocaleDateString()}`
  }
})

function handleStart() {
  if (!workoutName.value.trim()) return
  emit('start', workoutName.value)
}
</script>

<style scoped>
.button-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}
</style>

