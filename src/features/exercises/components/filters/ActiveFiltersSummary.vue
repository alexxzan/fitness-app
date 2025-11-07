<template>
  <div v-if="activeFilterCount > 0" class="active-filters-summary">
    <div class="active-filters-chips">
      <ion-chip
        v-for="bodyPart in selectedBodyParts"
        :key="`bodyPart-${bodyPart}`"
        color="primary"
        class="filter-chip"
        @click="$emit('remove-filter', 'bodyParts', bodyPart)"
      >
        <ion-label>{{ formatName(bodyPart) }}</ion-label>
        <ion-icon :icon="close" />
      </ion-chip>
      <ion-chip
        v-for="equipment in selectedEquipments"
        :key="`equipment-${equipment}`"
        color="primary"
        class="filter-chip"
        @click="$emit('remove-filter', 'equipments', equipment)"
      >
        <ion-label>{{ formatName(equipment) }}</ion-label>
        <ion-icon :icon="close" />
      </ion-chip>
      <ion-chip
        v-for="muscle in selectedTargetMuscles"
        :key="`muscle-${muscle}`"
        color="primary"
        class="filter-chip"
        @click="$emit('remove-filter', 'targetMuscles', muscle)"
      >
        <ion-label>{{ formatName(muscle) }}</ion-label>
        <ion-icon :icon="close" />
      </ion-chip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { IonChip, IonLabel, IonIcon } from "@ionic/vue";
import { close } from "ionicons/icons";

interface Props {
  selectedBodyParts: string[];
  selectedEquipments: string[];
  selectedTargetMuscles: string[];
}

const props = defineProps<Props>();

defineEmits<{
  (
    e: "remove-filter",
    category: "bodyParts" | "equipments" | "targetMuscles",
    name: string
  ): void;
}>();

const activeFilterCount = computed(() => {
  return (
    props.selectedBodyParts.length +
    props.selectedEquipments.length +
    props.selectedTargetMuscles.length
  );
});

function formatName(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
</script>

<style scoped>
.active-filters-summary {
  padding: var(--spacing-sm) var(--spacing-base);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.active-filters-chips {
  display: flex;
  gap: var(--spacing-xs);
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 2px;
}

.filter-chip {
  cursor: pointer;
  transition: var(--transition-all);
  flex-shrink: 0;
  white-space: nowrap;
}

.filter-chip:hover {
  opacity: var(--opacity-hover);
}

.filter-chip ion-icon {
  margin-left: var(--spacing-xs);
}
</style>
