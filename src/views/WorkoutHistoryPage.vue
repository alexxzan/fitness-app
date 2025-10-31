<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Workout History</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <SearchBar
        v-model="searchQuery"
        placeholder="Search workouts..."
      />

      <div v-if="isLoading" class="loading">
        <ion-spinner />
      </div>

      <div v-else-if="filteredWorkouts.length === 0" class="empty-state">
        <p>No workouts found</p>
      </div>

      <div v-else class="workout-list">
        <WorkoutCard
          v-for="workout in filteredWorkouts"
          :key="workout.id"
          :workout="workout"
          @click="viewWorkout(workout)"
        />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSpinner
} from '@ionic/vue'
import { useWorkoutHistory } from '@/features/workouts/composables/useWorkoutHistory'
import WorkoutCard from '@/features/workouts/components/WorkoutCard.vue'
import SearchBar from '@/components/molecules/SearchBar.vue'

const router = useRouter()
const { filteredWorkouts, isLoading, searchQuery, loadWorkouts } = useWorkoutHistory()

onMounted(async () => {
  await loadWorkouts()
})

function viewWorkout(workout: any) {
  // Navigate to workout detail page (to be implemented)
  console.log('View workout:', workout)
}
</script>

<style scoped>
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.empty-state {
  text-align: center;
  padding: 32px;
  color: var(--ion-color-medium);
}

.workout-list {
  padding: 16px;
}
</style>

