<template>
  <ion-accordion-group>
    <ion-accordion :value="mealType">
      <ion-item slot="header" :color="mealColor">
        <ion-icon :icon="mealIcon" slot="start"></ion-icon>
        <ion-label>
          <h2>{{ mealLabel }}</h2>
          <p v-if="mealTotal.calories > 0">
            {{ Math.round(mealTotal.calories) }} kcal
          </p>
          <p v-else class="empty-meal">No items yet</p>
        </ion-label>
        <ion-badge
          v-if="mealTotal.calories > 0"
          slot="end"
          :color="mealColor"
        >
          {{ items.length }}
        </ion-badge>
      </ion-item>
      <div slot="content" class="meal-content">
        <!-- Meal Totals -->
        <ion-card v-if="mealTotal.calories > 0" class="meal-totals-card">
          <ion-card-content>
            <ion-grid>
              <ion-row>
                <ion-col size="6">
                  <div class="macro-stat">
                    <ion-label class="macro-label">Protein</ion-label>
                    <ion-badge color="success">
                      {{ Math.round(mealTotal.protein) }}g
                    </ion-badge>
                  </div>
                </ion-col>
                <ion-col size="6">
                  <div class="macro-stat">
                    <ion-label class="macro-label">Carbs</ion-label>
                    <ion-badge color="warning">
                      {{ Math.round(mealTotal.carbs) }}g
                    </ion-badge>
                  </div>
                </ion-col>
                <ion-col size="6">
                  <div class="macro-stat">
                    <ion-label class="macro-label">Fats</ion-label>
                    <ion-badge color="danger">
                      {{ Math.round(mealTotal.fats) }}g
                    </ion-badge>
                  </div>
                </ion-col>
                <ion-col size="6">
                  <div class="macro-stat">
                    <ion-label class="macro-label">Calories</ion-label>
                    <ion-badge :color="mealColor">
                      {{ Math.round(mealTotal.calories) }}
                    </ion-badge>
                  </div>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-card-content>
        </ion-card>

        <!-- Food Items -->
        <ion-list v-if="items.length > 0">
          <FoodLogItem
            v-for="item in items"
            :key="item.id"
            :food-log="item"
            @edit="$emit('edit', item)"
            @duplicate="$emit('duplicate', item)"
            @delete="$emit('delete', item.id)"
          />
        </ion-list>

        <!-- Empty State -->
        <div v-else class="empty-meal-state">
          <ion-icon :icon="mealIcon" class="empty-icon"></ion-icon>
          <ion-text color="medium">
            <p>No items added yet</p>
          </ion-text>
          <ion-button
            fill="outline"
            size="small"
            @click="$emit('add-food', mealType)"
          >
            Add Food
          </ion-button>
        </div>
      </div>
    </ion-accordion>
  </ion-accordion-group>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  IonAccordion,
  IonAccordionGroup,
  IonItem,
  IonLabel,
  IonIcon,
  IonBadge,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonButton,
  IonText,
} from "@ionic/vue";
import {
  sunnyOutline,
  restaurantOutline,
  moonOutline,
  fastFoodOutline,
} from "ionicons/icons";
import FoodLogItem from "../food/FoodLogItem.vue";
import type { FoodLog, MealType } from "../../types/macro.types";

interface Props {
  mealType: MealType;
  items: FoodLog[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "add-food": [mealType: MealType];
  edit: [foodLog: FoodLog];
  duplicate: [foodLog: FoodLog];
  delete: [id: string];
}>();

const mealConfig = {
  breakfast: {
    label: "Breakfast",
    icon: sunnyOutline,
    color: "warning",
  },
  lunch: {
    label: "Lunch",
    icon: restaurantOutline,
    color: "primary",
  },
  dinner: {
    label: "Dinner",
    icon: moonOutline,
    color: "tertiary",
  },
  snack: {
    label: "Snacks",
    icon: fastFoodOutline,
    color: "medium",
  },
};

const mealLabel = computed(() => mealConfig[props.mealType].label);
const mealIcon = computed(() => mealConfig[props.mealType].icon);
const mealColor = computed(() => mealConfig[props.mealType].color);

const mealTotal = computed(() => {
  return props.items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fats: acc.fats + item.fats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );
});
</script>

<style scoped>
.meal-content {
  padding: var(--spacing-md);
}

.meal-totals-card {
  margin-bottom: var(--spacing-md);
}

.macro-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
}

.macro-label {
  font-size: var(--typography-caption-size);
  color: var(--color-text-secondary);
}

.empty-meal {
  color: var(--color-text-tertiary);
  font-style: italic;
}

.empty-meal-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  gap: var(--spacing-md);
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: var(--color-text-tertiary);
  opacity: 0.5;
}
</style>

