<template>
  <div>
    <SearchBar
      v-model="searchQuery"
      placeholder="Search exercises..."
      @clear="handleClear"
    />
    <ion-list>
      <ion-item
        v-for="exercise in filteredExercises"
        :key="exercise.id"
        button
        @click="selectExercise(exercise)"
      >
        <ion-label>
          <h2>{{ exercise.name }}</h2>
          <p>{{ exercise.category }}</p>
        </ion-label>
      </ion-item>
      <ion-item v-if="filteredExercises.length === 0">
        <ion-label>
          <p>No exercises found</p>
        </ion-label>
      </ion-item>
    </ion-list>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { IonList, IonItem, IonLabel } from '@ionic/vue'
import type { Exercise } from '../types/exercise.types'
import SearchBar from '@/components/molecules/SearchBar.vue'

interface Props {
  exercises: Exercise[]
}

const props = defineProps<Props>()
const searchQuery = ref('')

const emit = defineEmits<{
  select: [exercise: Exercise]
}>()

const filteredExercises = computed(() => {
  if (!searchQuery.value) {
    return props.exercises
  }

  const query = searchQuery.value.toLowerCase()
  return props.exercises.filter(ex =>
    ex.name.toLowerCase().includes(query) ||
    ex.description?.toLowerCase().includes(query) ||
    ex.category.toLowerCase().includes(query)
  )
})

function selectExercise(exercise: Exercise) {
  emit('select', exercise)
  searchQuery.value = ''
}

function handleClear() {
  searchQuery.value = ''
}
</script>

