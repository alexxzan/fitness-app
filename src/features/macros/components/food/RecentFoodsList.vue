<template>
  <ion-card v-if="recentFoods.length > 0" class="recent-foods-card">
    <ion-card-header>
      <ion-card-title>
        <ion-icon :icon="timeOutline" slot="start"></ion-icon>
        Recent Foods
      </ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <div class="recent-foods-chips">
        <ion-chip
          v-for="food in displayedFoods"
          :key="food.id"
          @click="$emit('add-food', food)"
          class="food-chip"
        >
          <ion-label>{{ food.foodName }}</ion-label>
          <ion-icon :icon="addOutline"></ion-icon>
        </ion-chip>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonChip, IonLabel, IonIcon } from "@ionic/vue";
import { timeOutline, addOutline } from "ionicons/icons";
import type { FoodLog } from "../../types/macro.types";

interface Props {
  recentFoods: FoodLog[];
  maxItems?: number;
}

const props = withDefaults(defineProps<Props>(), {
  maxItems: 10,
});

const emit = defineEmits<{
  "add-food": [foodLog: FoodLog];
}>();

const displayedFoods = computed(() => {
  return props.recentFoods.slice(0, props.maxItems);
});
</script>

<style scoped>
.recent-foods-card {
  margin-bottom: var(--spacing-md);
}

.recent-foods-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.food-chip {
  cursor: pointer;
  transition: var(--transition-all);
}

.food-chip:hover {
  opacity: var(--opacity-hover);
}
</style>

