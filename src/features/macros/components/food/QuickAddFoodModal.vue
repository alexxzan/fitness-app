<template>
  <ion-modal :is-open="isOpen" @did-dismiss="$emit('close')">
    <ion-header>
      <ion-toolbar>
        <ion-title>Quick Add Food</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('close')">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="quick-add-container">
        <!-- Search Bar -->
        <ion-searchbar
          v-model="searchQuery"
          placeholder="Search foods..."
          @ion-input="handleSearch"
          debounce="300"
        ></ion-searchbar>

        <!-- Meal Type Selection -->
        <ion-segment
          v-model="selectedMealType"
          class="meal-type-segment"
        >
          <ion-segment-button value="breakfast">
            <ion-label>Breakfast</ion-label>
          </ion-segment-button>
          <ion-segment-button value="lunch">
            <ion-label>Lunch</ion-label>
          </ion-segment-button>
          <ion-segment-button value="dinner">
            <ion-label>Dinner</ion-label>
          </ion-segment-button>
          <ion-segment-button value="snack">
            <ion-label>Snack</ion-label>
          </ion-segment-button>
        </ion-segment>

        <!-- Recent Foods -->
        <RecentFoodsList
          v-if="recentFoods.length > 0 && !searchQuery"
          :recent-foods="recentFoods"
          @add-food="handleAddRecentFood"
        />

        <!-- Search Results -->
        <ion-list v-if="searchQuery && filteredFoods.length > 0">
          <ion-item
            v-for="food in filteredFoods"
            :key="food.id"
            button
            @click="handleSelectFood(food)"
          >
            <ion-label>
              <h3>{{ food.foodName }}</h3>
              <p>
                {{ Math.round(food.calories) }} kcal | P:
                {{ Math.round(food.protein) }}g | C:
                {{ Math.round(food.carbs) }}g | F:
                {{ Math.round(food.fats) }}g
              </p>
            </ion-label>
            <ion-icon slot="end" :icon="addOutline"></ion-icon>
          </ion-item>
        </ion-list>

        <!-- Empty Search State -->
        <div
          v-if="searchQuery && filteredFoods.length === 0"
          class="empty-search-state"
        >
          <ion-icon :icon="searchOutline" class="empty-icon"></ion-icon>
          <ion-text color="medium">
            <p>No foods found matching "{{ searchQuery }}"</p>
          </ion-text>
          <ion-button fill="outline" @click="showManualEntry = true">
            Add Manually
          </ion-button>
        </div>

        <!-- Manual Entry Form -->
        <ion-card v-if="showManualEntry || (!searchQuery && recentFoods.length === 0)" class="manual-entry-card">
          <ion-card-header>
            <ion-card-title>Add Food Manually</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <FormField
              v-model="foodData.foodName"
              label="Food Name"
              placeholder="e.g., Grilled Chicken Breast"
            />
            <FormField
              v-model="foodData.calories"
              label="Calories"
              type="number"
              placeholder="250"
            />
            <FormField
              v-model="foodData.protein"
              label="Protein (g)"
              type="number"
              placeholder="30"
            />
            <FormField
              v-model="foodData.carbs"
              label="Carbs (g)"
              type="number"
              placeholder="0"
            />
            <FormField
              v-model="foodData.fats"
              label="Fats (g)"
              type="number"
              placeholder="5"
            />
            <ion-button
              expand="block"
              @click="handleSubmitManual"
              :disabled="!canSubmit"
            >
              Add Food
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
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
  IonContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
} from "@ionic/vue";
import { addOutline, searchOutline } from "ionicons/icons";
import FormField from "@/components/molecules/FormField.vue";
import RecentFoodsList from "./RecentFoodsList.vue";
import type { FoodLog, MealType } from "../../types/macro.types";

interface Props {
  isOpen: boolean;
  date?: string;
  recentFoods?: FoodLog[];
  allFoods?: FoodLog[];
  initialMealType?: MealType;
}

const props = withDefaults(defineProps<Props>(), {
  date: () => new Date().toISOString().split("T")[0],
  recentFoods: () => [],
  allFoods: () => [],
  initialMealType: "breakfast",
});

const emit = defineEmits<{
  close: [];
  add: [food: {
    date: string;
    mealType: MealType;
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    notes?: string;
  }];
}>();

const searchQuery = ref("");
const selectedMealType = ref<MealType>("breakfast");
const showManualEntry = ref(false);

const foodData = ref({
  foodName: "",
  calories: 0,
  protein: 0,
  carbs: 0,
  fats: 0,
  notes: "",
});

const canSubmit = computed(() => {
  return foodData.value.foodName.trim() !== "" && foodData.value.calories > 0;
});

const filteredFoods = computed(() => {
  if (!searchQuery.value) return [];
  
  const query = searchQuery.value.toLowerCase();
  return props.allFoods.filter(
    (food) => food.foodName.toLowerCase().includes(query)
  );
});

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    selectedMealType.value = props.initialMealType;
  } else {
    searchQuery.value = "";
    showManualEntry.value = false;
    foodData.value = {
      foodName: "",
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      notes: "",
    };
  }
});

watch(() => props.initialMealType, (newType) => {
  if (props.isOpen && newType) {
    selectedMealType.value = newType;
  }
});

function handleSearch(event: CustomEvent) {
  searchQuery.value = event.detail.value || "";
}

function handleSelectFood(food: FoodLog) {
  emit("add", {
    date: props.date,
    mealType: selectedMealType.value,
    foodName: food.foodName,
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fats: food.fats,
    notes: food.notes,
  });
  emit("close");
}

function handleAddRecentFood(food: FoodLog) {
  emit("add", {
    date: props.date,
    mealType: selectedMealType.value,
    foodName: food.foodName,
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fats: food.fats,
    notes: food.notes,
  });
  emit("close");
}

function handleSubmitManual() {
  if (!canSubmit.value) return;

  emit("add", {
    date: props.date,
    mealType: selectedMealType.value,
    foodName: foodData.value.foodName.trim(),
    calories: Number(foodData.value.calories),
    protein: Number(foodData.value.protein) || 0,
    carbs: Number(foodData.value.carbs) || 0,
    fats: Number(foodData.value.fats) || 0,
    notes: foodData.value.notes || undefined,
  });

  emit("close");
}
</script>

<style scoped>
.quick-add-container {
  padding: var(--spacing-md);
}

.meal-type-segment {
  margin-bottom: var(--spacing-lg);
}

.empty-search-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  gap: var(--spacing-md);
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  color: var(--color-text-tertiary);
  opacity: 0.5;
}

.manual-entry-card {
  margin-top: var(--spacing-lg);
}
</style>

