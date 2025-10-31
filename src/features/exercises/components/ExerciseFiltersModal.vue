<template>
  <ion-modal :is-open="isOpen" @did-dismiss="handleCancel">
    <ion-header>
      <ion-toolbar>
        <ion-title>Filters</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleCancel">
            <ion-icon :icon="close" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="filter-modal-content">
      <!-- Filter Category Selector -->
      <ion-segment
        v-model="activeFilterCategory"
        @ionChange="onCategoryChange"
        class="filter-category-selector"
      >
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

      <!-- Filter List Container -->
      <div class="filters-container">
        <!-- Body Parts Filters -->
        <ion-list
          v-if="activeFilterCategory === 'bodyParts'"
          class="filter-list"
        >
          <template v-for="(group, letter) in groupedBodyParts" :key="letter">
            <ion-item-divider>
              <ion-label>{{ letter.toUpperCase() }}</ion-label>
            </ion-item-divider>
            <ion-item
              v-for="bodyPart in group"
              :key="bodyPart.name"
              button
              :class="{
                'filter-item-selected': isSelected('bodyParts', bodyPart.name),
              }"
              @click="toggleFilter('bodyParts', bodyPart.name)"
            >
              <ion-label>{{ formatName(bodyPart.name) }}</ion-label>
            </ion-item>
          </template>
        </ion-list>

        <!-- Equipment Filters -->
        <ion-list
          v-if="activeFilterCategory === 'equipment'"
          class="filter-list"
        >
          <template v-for="(group, letter) in groupedEquipment" :key="letter">
            <ion-item-divider>
              <ion-label>{{ letter.toUpperCase() }}</ion-label>
            </ion-item-divider>
            <ion-item
              v-for="equipment in group"
              :key="equipment.name"
              button
              :class="{
                'filter-item-selected': isSelected('equipment', equipment.name),
              }"
              @click="toggleFilter('equipment', equipment.name)"
            >
              <ion-label>{{ formatName(equipment.name) }}</ion-label>
            </ion-item>
          </template>
        </ion-list>

        <!-- Muscles Filters -->
        <ion-list v-if="activeFilterCategory === 'muscles'" class="filter-list">
          <template v-for="(group, letter) in groupedMuscles" :key="letter">
            <ion-item-divider>
              <ion-label>{{ letter.toUpperCase() }}</ion-label>
            </ion-item-divider>
            <ion-item
              v-for="muscle in group"
              :key="muscle.name"
              button
              :class="{
                'filter-item-selected': isSelected('muscles', muscle.name),
              }"
              @click="toggleFilter('muscles', muscle.name)"
            >
              <ion-label>{{ formatName(muscle.name) }}</ion-label>
            </ion-item>
          </template>
        </ion-list>
      </div>
    </ion-content>

    <!-- Action Buttons -->
    <ion-footer>
      <ion-toolbar>
        <div class="footer-buttons">
          <ion-button fill="outline" expand="block" @click="handleClearAll">
            Clear All
          </ion-button>
          <ion-button color="primary" expand="block" @click="handleApply">
            Apply
          </ion-button>
        </div>
      </ion-toolbar>
    </ion-footer>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonFooter,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonChip,
  IonList,
  IonItem,
  IonItemDivider,
} from "@ionic/vue";
import { close } from "ionicons/icons";
import bodyPartsData from "../data/bodyparts.json";
import equipmentData from "../data/equipment.json";
import musclesData from "../data/muscles.json";
import type { BodyPart, Equipment, Muscle } from "../types/exercise.types";

interface Props {
  isOpen: boolean;
  selectedBodyParts?: string[];
  selectedEquipments?: string[];
  selectedTargetMuscles?: string[];
}

interface Emits {
  (
    e: "apply",
    filters: {
      bodyParts: string[];
      equipments: string[];
      targetMuscles: string[];
    }
  ): void;
  (e: "cancel"): void;
}

const props = withDefaults(defineProps<Props>(), {
  selectedBodyParts: () => [],
  selectedEquipments: () => [],
  selectedTargetMuscles: () => [],
});

const emit = defineEmits<Emits>();

// Pending filter state (not applied until Apply is clicked)
const pendingBodyParts = ref<string[]>([]);
const pendingEquipments = ref<string[]>([]);
const pendingTargetMuscles = ref<string[]>([]);

// Initialize pending filters from props when modal opens
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      pendingBodyParts.value = [...props.selectedBodyParts];
      pendingEquipments.value = [...props.selectedEquipments];
      pendingTargetMuscles.value = [...props.selectedTargetMuscles];
    }
  }
);

const activeFilterCategory = ref<"bodyParts" | "equipment" | "muscles">(
  "bodyParts"
);
const bodyPartsDataRaw = ref<BodyPart[]>(bodyPartsData as BodyPart[]);
const equipmentDataRaw = ref<Equipment[]>(equipmentData as Equipment[]);
const musclesDataRaw = ref<Muscle[]>(musclesData as Muscle[]);

// Sorted alphabetically by name
const bodyParts = computed(() => {
  return [...bodyPartsDataRaw.value].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
});

const equipmentList = computed(() => {
  return [...equipmentDataRaw.value].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
});

const muscles = computed(() => {
  return [...musclesDataRaw.value].sort((a, b) => a.name.localeCompare(b.name));
});

// Group items by first letter
function groupByFirstLetter<T extends { name: string }>(
  items: T[]
): Record<string, T[]> {
  const grouped: Record<string, T[]> = {};
  for (const item of items) {
    const firstLetter = item.name.charAt(0).toLowerCase();
    if (!grouped[firstLetter]) {
      grouped[firstLetter] = [];
    }
    grouped[firstLetter].push(item);
  }
  return grouped;
}

const groupedBodyParts = computed(() => groupByFirstLetter(bodyParts.value));
const groupedEquipment = computed(() =>
  groupByFirstLetter(equipmentList.value)
);
const groupedMuscles = computed(() => groupByFirstLetter(muscles.value));

const pendingFilterCount = computed(() => {
  return (
    pendingBodyParts.value.length +
    pendingEquipments.value.length +
    pendingTargetMuscles.value.length
  );
});

function formatName(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function isSelected(category: string, name: string): boolean {
  switch (category) {
    case "bodyParts":
      return pendingBodyParts.value.includes(name);
    case "equipment":
      return pendingEquipments.value.includes(name);
    case "muscles":
      return pendingTargetMuscles.value.includes(name);
    default:
      return false;
  }
}

function toggleFilter(category: string, name: string) {
  switch (category) {
    case "bodyParts": {
      const index = pendingBodyParts.value.indexOf(name);
      if (index > -1) {
        pendingBodyParts.value.splice(index, 1);
      } else {
        pendingBodyParts.value.push(name);
      }
      break;
    }
    case "equipment": {
      const index = pendingEquipments.value.indexOf(name);
      if (index > -1) {
        pendingEquipments.value.splice(index, 1);
      } else {
        pendingEquipments.value.push(name);
      }
      break;
    }
    case "muscles": {
      const index = pendingTargetMuscles.value.indexOf(name);
      if (index > -1) {
        pendingTargetMuscles.value.splice(index, 1);
      } else {
        pendingTargetMuscles.value.push(name);
      }
      break;
    }
  }
}

function handleClearAll() {
  pendingBodyParts.value = [];
  pendingEquipments.value = [];
  pendingTargetMuscles.value = [];
}

function handleApply() {
  emit("apply", {
    bodyParts: [...pendingBodyParts.value],
    equipments: [...pendingEquipments.value],
    targetMuscles: [...pendingTargetMuscles.value],
  });
}

function handleCancel() {
  // Reset pending filters to current applied filters
  pendingBodyParts.value = [...props.selectedBodyParts];
  pendingEquipments.value = [...props.selectedEquipments];
  pendingTargetMuscles.value = [...props.selectedTargetMuscles];
  emit("cancel");
}

function onCategoryChange(event: CustomEvent) {
  activeFilterCategory.value = event.detail.value;
}
</script>

<style scoped>
.filter-modal-content {
  --padding-start: var(--spacing-base);
  --padding-end: var(--spacing-base);
  --padding-top: var(--spacing-base);
  --padding-bottom: var(--spacing-base);
}

.filter-category-selector {
  margin-top: var(--spacing-base);
}

.filter-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--color-border);
}

.filters-container {
  margin-top: var(--spacing-md);
  min-height: 300px;
}

.filter-list {
  background: transparent;
  padding: 0;
}

ion-item-divider {
  --background: var(--color-surface-variant, var(--color-surface));
  --color: var(--color-text-secondary);
  --padding-start: var(--spacing-base);
  --padding-end: var(--spacing-base);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

ion-item {
  --padding-start: var(--spacing-base);
  --padding-end: var(--spacing-base);
  cursor: pointer;
  transition: var(--transition-all);
}

.filter-item-selected {
  --background: var(--color-primary);
  --color: var(--color-text-inverse);
  --background-activated: var(--color-primary-shade, var(--color-primary));
}

.filter-item-selected ion-label {
  color: var(--color-text-inverse);
  font-weight: var(--font-weight-semibold);
}

.footer-buttons {
  display: flex;
  gap: var(--spacing-base);
  padding: var(--spacing-base);
}

.footer-buttons ion-button {
  flex: 1;
}
</style>
