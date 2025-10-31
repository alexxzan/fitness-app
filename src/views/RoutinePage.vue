<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Routines</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="showAddModal = true">
            <ion-icon :icon="add" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div v-if="routines.length === 0" class="empty-state">
        <p>No routines yet. Create one to get started!</p>
      </div>

      <ion-list v-else>
        <ion-item
          v-for="routine in routines"
          :key="routine.id"
          button
          @click="viewRoutine(routine)"
        >
          <ion-label>
            <h2>{{ routine.name }}</h2>
            <p>{{ routine.exercises.length }} exercises</p>
            <p v-if="routine.description">{{ routine.description }}</p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>

    <!-- Add Routine Modal -->
    <ion-modal :is-open="showAddModal" @did-dismiss="showAddModal = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Create Routine</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showAddModal = false">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <p>Routine creation coming soon...</p>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonModal
} from '@ionic/vue'
import { add } from 'ionicons/icons'
import { WorkoutRepository } from '@/features/workouts/repositories/workout.repository'
import type { WorkoutRoutine } from '@/features/workouts/types/workout.types'

const routines = ref<WorkoutRoutine[]>([])
const showAddModal = ref(false)

onMounted(async () => {
  await loadRoutines()
})

async function loadRoutines() {
  routines.value = await WorkoutRepository.getAllRoutines()
}

function viewRoutine(routine: WorkoutRoutine) {
  // Navigate to routine detail/edit page (to be implemented)
  console.log('View routine:', routine)
}
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--ion-color-medium);
}
</style>

