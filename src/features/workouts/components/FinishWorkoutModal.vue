<template>
  <ion-modal
    :is-open="isOpen"
    @did-dismiss="$emit('cancel')"
  >
    <ion-header>
      <ion-toolbar>
        <ion-title>Finish Workout</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p>Are you sure you want to finish this workout?</p>
      <div class="button-group">
        <AppButton expand="block" @click="$emit('finish')">
          Finish
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
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/vue'
import AppButton from '@/components/atoms/AppButton.vue'

interface Props {
  isOpen: boolean
}

defineProps<Props>()

defineEmits<{
  finish: []
  cancel: []
}>()
</script>

<style scoped>
.button-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}
</style>

