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
      <p v-if="!hasRoutineChanges">Are you sure you want to finish this workout?</p>
      <div v-else class="routine-changes-prompt">
        <p class="prompt-message">
          You've modified this workout. Save changes to the routine?
        </p>
      </div>
      <div class="button-group">
        <template v-if="hasRoutineChanges">
          <AppButton expand="block" @click="$emit('finish', true)">
            Save to Routine
          </AppButton>
          <AppButton expand="block" fill="outline" @click="$emit('finish', false)">
            Don't Save
          </AppButton>
          <AppButton
            expand="block"
            fill="clear"
            @click="$emit('cancel')"
          >
            Cancel
          </AppButton>
        </template>
        <template v-else>
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
        </template>
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
  hasRoutineChanges?: boolean
}

defineProps<Props>()

defineEmits<{
  finish: [saveToRoutine?: boolean]
  cancel: []
}>()
</script>

<style scoped>
.routine-changes-prompt {
  margin-bottom: var(--spacing-base);
}

.prompt-message {
  font-size: var(--typography-body-size);
  color: var(--color-text-primary);
  margin: 0;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}
</style>

