<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Exercise Library</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="showAddModal = true">
            <ion-icon :icon="add" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <SearchBar
        v-model="searchQuery"
        placeholder="Search exercises..."
      />

      <ion-segment v-model="selectedCategory" @ionChange="handleCategoryChange">
        <ion-segment-button value="">All</ion-segment-button>
        <ion-segment-button
          v-for="category in categories"
          :key="category"
          :value="category"
        >
          {{ category }}
        </ion-segment-button>
      </ion-segment>

      <div v-if="isLoading" class="loading">
        <ion-spinner />
      </div>

      <div v-else-if="filteredExercises.length === 0" class="empty-state">
        <p>No exercises found</p>
      </div>

      <div v-else class="exercise-list">
        <ExerciseCard
          v-for="exercise in filteredExercises"
          :key="exercise.id"
          :exercise="exercise"
          @click="viewExercise(exercise)"
        />
      </div>
    </ion-content>

    <!-- Add Exercise Modal -->
    <ion-modal :is-open="showAddModal" @did-dismiss="showAddModal = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Add Exercise</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showAddModal = false">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <FormField
          v-model="newExercise.name"
          label="Exercise Name"
          placeholder="e.g., Bench Press"
        />
        <ion-item>
          <ion-label position="stacked">Category</ion-label>
          <ion-select v-model="newExercise.category" placeholder="Select category">
            <ion-select-option value="chest">Chest</ion-select-option>
            <ion-select-option value="back">Back</ion-select-option>
            <ion-select-option value="shoulders">Shoulders</ion-select-option>
            <ion-select-option value="arms">Arms</ion-select-option>
            <ion-select-option value="legs">Legs</ion-select-option>
            <ion-select-option value="core">Core</ion-select-option>
            <ion-select-option value="cardio">Cardio</ion-select-option>
            <ion-select-option value="full-body">Full Body</ion-select-option>
            <ion-select-option value="other">Other</ion-select-option>
          </ion-select>
        </ion-item>
        <FormField
          v-model="newExercise.description"
          label="Description"
          placeholder="Optional description"
        />
        <div class="button-group">
          <AppButton expand="block" @click="handleAddExercise">Add Exercise</AppButton>
          <AppButton expand="block" fill="outline" @click="showAddModal = false">Cancel</AppButton>
        </div>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonModal,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption
} from '@ionic/vue'
import { add } from 'ionicons/icons'
import { useExerciseLibrary } from '@/features/exercises/composables/useExerciseLibrary'
import { useExercise } from '@/features/exercises/composables/useExercise'
import type { ExerciseCategory } from '@/features/exercises/types/exercise.types'
import ExerciseCard from '@/features/exercises/components/ExerciseCard.vue'
import SearchBar from '@/components/molecules/SearchBar.vue'
import FormField from '@/components/molecules/FormField.vue'
import AppButton from '@/components/atoms/AppButton.vue'

const {
  exercises,
  filteredExercises,
  isLoading,
  searchQuery,
  selectedCategory,
  categories,
  loadExercises
} = useExerciseLibrary()

const { createExercise } = useExercise()

const showAddModal = ref(false)
const newExercise = ref<{
  name: string
  category: ExerciseCategory
  description?: string
}>({
  name: '',
  category: 'other',
  description: ''
})

onMounted(async () => {
  await loadExercises()
})

function handleCategoryChange(event: CustomEvent) {
  selectedCategory.value = event.detail.value || undefined
}

async function handleAddExercise() {
  if (!newExercise.value.name.trim()) return

  try {
    await createExercise({
      name: newExercise.value.name.trim(),
      category: newExercise.value.category,
      description: newExercise.value.description?.trim()
    })
    await loadExercises()
    newExercise.value = {
      name: '',
      category: 'other',
      description: ''
    }
    showAddModal.value = false
  } catch (error) {
    console.error('Failed to create exercise:', error)
  }
}

function viewExercise(exercise: any) {
  // Navigate to exercise detail page (to be implemented)
  console.log('View exercise:', exercise)
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
  padding: var(--spacing-xl);
  color: var(--ion-color-medium);
}

.exercise-list {
  padding: var(--spacing-base);
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}
</style>

