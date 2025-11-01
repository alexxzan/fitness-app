<template>
  <div class="workout-template-selector">
    <div class="filters">
      <SearchBar
        v-model="searchQuery"
        placeholder="Search templates..."
        @clear="handleClear"
      />
      <div class="difficulty-filters">
        <AppButton
          v-for="difficulty in difficultyOptions"
          :key="difficulty.value"
          :fill="selectedDifficulty === difficulty.value ? 'solid' : 'outline'"
          size="small"
          :color="getDifficultyColor(difficulty.value)"
          @click="toggleDifficulty(difficulty.value)"
        >
          {{ difficulty.label }}
        </AppButton>
      </div>
    </div>

    <ion-list>
      <ion-item
        v-for="template in filteredTemplates"
        :key="template.id"
        button
        @click="selectTemplate(template)"
        class="template-item"
      >
        <ion-label>
          <div class="template-header">
            <h2>{{ template.name }}</h2>
            <div class="template-badges">
              <AppBadge :color="getDifficultyColor(template.difficulty)">
                {{ template.difficulty }}
              </AppBadge>
              <AppBadge color="medium">
                {{ template.durationWeeks }} weeks
              </AppBadge>
            </div>
          </div>
          <p class="template-description">{{ template.description }}</p>
          <p class="template-exercises">
            {{ template.exercises.length }} exercises
          </p>
        </ion-label>
      </ion-item>
      <ion-item v-if="filteredTemplates.length === 0">
        <ion-label>
          <p>No templates found</p>
        </ion-label>
      </ion-item>
    </ion-list>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { IonList, IonItem, IonLabel } from '@ionic/vue'
import type { WorkoutTemplate } from '../types/workout.types'
import SearchBar from '@/components/molecules/SearchBar.vue'
import AppButton from '@/components/atoms/AppButton.vue'
import AppBadge from '@/components/atoms/AppBadge.vue'

interface Props {
  templates: WorkoutTemplate[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [template: WorkoutTemplate]
}>()

const searchQuery = ref('')
const selectedDifficulty = ref<string | null>(null)

const difficultyOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const filteredTemplates = computed(() => {
  let filtered = props.templates

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      template =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query)
    )
  }

  // Filter by difficulty
  if (selectedDifficulty.value) {
    filtered = filtered.filter(
      template => template.difficulty === selectedDifficulty.value
    )
  }

  return filtered
})

function toggleDifficulty(difficulty: string) {
  if (selectedDifficulty.value === difficulty) {
    selectedDifficulty.value = null
  } else {
    selectedDifficulty.value = difficulty
  }
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'beginner':
      return 'success'
    case 'intermediate':
      return 'warning'
    case 'advanced':
      return 'danger'
    default:
      return 'medium'
  }
}

function selectTemplate(template: WorkoutTemplate) {
  emit('select', template)
}

function handleClear() {
  searchQuery.value = ''
}
</script>

<style scoped>
.workout-template-selector {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.filters {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.difficulty-filters {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.template-item {
  margin-bottom: var(--spacing-xs);
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
}

.template-header h2 {
  margin: 0;
  flex: 1;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.template-badges {
  display: flex;
  gap: var(--spacing-xs);
  flex-shrink: 0;
}

.template-description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: var(--spacing-xs) 0;
  line-height: var(--line-height-normal);
}

.template-exercises {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  margin: 0;
}
</style>

