<template>
  <div class="exercise-filters">
    <!-- Filter Category Selector -->
    <ion-segment v-model="activeFilterCategory" @ionChange="onCategoryChange">
      <ion-segment-button value="bodyParts">
        <ion-label>Body Parts</ion-label>
      </ion-segment-button>
      <ion-segment-button value="equipment">
        <ion-label>Equipment</ion-label>
      </ion-segment-button>
      <ion-segment-button value="muscles">
        <ion-label>Muscles</ion-label>
      </ion-segment-button>
    </ion-segment>

    <!-- Active Filters Summary -->
    <div v-if="activeFilterCount > 0" class="filter-summary">
      <ion-chip>
        <ion-label>{{ activeFilterCount }} active filter(s)</ion-label>
      </ion-chip>
      <ion-button
        fill="clear"
        size="small"
        @click="clearAllFilters"
      >
        Clear All
      </ion-button>
    </div>

    <!-- Filter Chips Container -->
    <div class="filters-container">
      <!-- Body Parts Filters -->
      <div v-if="activeFilterCategory === 'bodyParts'" class="filter-group">
        <ion-chip
          v-for="bodyPart in bodyParts"
          :key="bodyPart.name"
          :color="isSelected('bodyParts', bodyPart.name) ? 'primary' : undefined"
          @click="toggleFilter('bodyParts', bodyPart.name)"
        >
          <ion-label>{{ formatName(bodyPart.name) }}</ion-label>
        </ion-chip>
      </div>

      <!-- Equipment Filters -->
      <div v-if="activeFilterCategory === 'equipment'" class="filter-group">
        <ion-chip
          v-for="equipment in equipmentList"
          :key="equipment.name"
          :color="isSelected('equipment', equipment.name) ? 'primary' : undefined"
          @click="toggleFilter('equipment', equipment.name)"
        >
          <ion-label>{{ formatName(equipment.name) }}</ion-label>
        </ion-chip>
      </div>

      <!-- Muscles Filters -->
      <div v-if="activeFilterCategory === 'muscles'" class="filter-group">
        <ion-chip
          v-for="muscle in muscles"
          :key="muscle.name"
          :color="isSelected('muscles', muscle.name) ? 'primary' : undefined"
          @click="toggleFilter('muscles', muscle.name)"
        >
          <ion-label>{{ formatName(muscle.name) }}</ion-label>
        </ion-chip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonChip,
  IonButton
} from '@ionic/vue'
import bodyPartsData from '../../data/bodyparts.json'
import equipmentData from '../../data/equipment.json'
import musclesData from '../../data/muscles.json'
import type { BodyPart, Equipment, Muscle } from '../../types/exercise.types'

interface Props {
  selectedBodyParts?: string[]
  selectedEquipments?: string[]
  selectedTargetMuscles?: string[]
}

interface Emits {
  (e: 'update:selectedBodyParts', value: string[]): void
  (e: 'update:selectedEquipments', value: string[]): void
  (e: 'update:selectedTargetMuscles', value: string[]): void
  (e: 'filters-changed'): void
}

const props = withDefaults(defineProps<Props>(), {
  selectedBodyParts: () => [],
  selectedEquipments: () => [],
  selectedTargetMuscles: () => []
})

const emit = defineEmits<Emits>()

const activeFilterCategory = ref<'bodyParts' | 'equipment' | 'muscles'>('bodyParts')
const bodyParts = ref<BodyPart[]>(bodyPartsData as BodyPart[])
const equipmentList = ref<Equipment[]>(equipmentData as Equipment[])
const muscles = ref<Muscle[]>(musclesData as Muscle[])

const activeFilterCount = computed(() => {
  return (
    props.selectedBodyParts.length +
    props.selectedEquipments.length +
    props.selectedTargetMuscles.length
  )
})

function formatName(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function isSelected(category: string, name: string): boolean {
  switch (category) {
    case 'bodyParts':
      return props.selectedBodyParts.includes(name)
    case 'equipment':
      return props.selectedEquipments.includes(name)
    case 'muscles':
      return props.selectedTargetMuscles.includes(name)
    default:
      return false
  }
}

function toggleFilter(category: string, name: string) {
  switch (category) {
    case 'bodyParts': {
      const newSelection = [...props.selectedBodyParts]
      const index = newSelection.indexOf(name)
      if (index > -1) {
        newSelection.splice(index, 1)
      } else {
        newSelection.push(name)
      }
      emit('update:selectedBodyParts', newSelection)
      break
    }
    case 'equipment': {
      const newSelection = [...props.selectedEquipments]
      const index = newSelection.indexOf(name)
      if (index > -1) {
        newSelection.splice(index, 1)
      } else {
        newSelection.push(name)
      }
      emit('update:selectedEquipments', newSelection)
      break
    }
    case 'muscles': {
      const newSelection = [...props.selectedTargetMuscles]
      const index = newSelection.indexOf(name)
      if (index > -1) {
        newSelection.splice(index, 1)
      } else {
        newSelection.push(name)
      }
      emit('update:selectedTargetMuscles', newSelection)
      break
    }
  }
  emit('filters-changed')
}

function clearAllFilters() {
  emit('update:selectedBodyParts', [])
  emit('update:selectedEquipments', [])
  emit('update:selectedTargetMuscles', [])
  emit('filters-changed')
}

function onCategoryChange(event: CustomEvent) {
  activeFilterCategory.value = event.detail.value
}
</script>

<style scoped>
.exercise-filters {
  padding: var(--spacing-base);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.filter-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) 0;
}

.filters-container {
  margin-top: var(--spacing-md);
  max-height: 300px;
  overflow-y: auto;
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) 0;
}

ion-chip {
  cursor: pointer;
  transition: var(--transition-all);
}

ion-chip:hover {
  opacity: var(--opacity-hover);
}

ion-chip[color="primary"] {
  --background: var(--color-primary);
  --color: var(--color-text-inverse);
}
</style>

