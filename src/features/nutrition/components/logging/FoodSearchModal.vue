<template>
  <ion-modal :is-open="isOpen" @didDismiss="$emit('close')">
    <ion-header>
      <ion-toolbar>
        <ion-title>Add Food</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('close')">
            <ion-icon :icon="close" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="food-search-modal">
        <!-- Search Bar -->
        <div class="search-section">
          <ion-searchbar
            v-model="searchQuery"
            placeholder="Search foods..."
            @ionInput="handleSearch"
            :debounce="300"
          />
          <ion-button expand="block" fill="outline" @click="showBarcodeScanner = true">
            <ion-icon :icon="barcode" slot="start" />
            Scan Barcode
          </ion-button>
        </div>

        <!-- Search Results -->
        <div v-if="isLoading" class="loading-state">
          <ion-spinner />
        </div>
        <div v-else-if="searchResults.length > 0" class="results-list">
          <ion-item
            v-for="food in searchResults"
            :key="food.id"
            button
            @click="selectFood(food)"
          >
            <ion-label>
              <h3>{{ food.name }}</h3>
              <p v-if="food.brand">{{ food.brand }}</p>
              <p class="nutrition-preview">
                {{ food.calories }} cal • {{ food.protein }}g P • {{ food.carbs }}g C • {{ food.fats }}g F
              </p>
            </ion-label>
            <ion-icon :icon="chevronForward" slot="end" />
          </ion-item>
        </div>
        <div v-else-if="searchQuery.length > 0" class="empty-state">
          <p>No foods found</p>
        </div>
        <div v-else class="empty-state">
          <p>Search for foods or scan a barcode</p>
        </div>

        <!-- Quantity Selector Modal -->
        <ion-modal :is-open="showQuantitySelector" @didDismiss="showQuantitySelector = false">
          <ion-header>
            <ion-toolbar>
              <ion-title>{{ selectedFood?.name }}</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="showQuantitySelector = false">
                  <ion-icon :icon="close" slot="icon-only" />
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content>
            <div class="quantity-selector">
              <div class="food-info">
                <h3>{{ selectedFood?.name }}</h3>
                <p v-if="selectedFood?.brand">{{ selectedFood.brand }}</p>
                <p class="serving-size">Serving size: {{ parseServingSize(selectedFood?.servingSize) }}</p>
              </div>
              <div class="quantity-input">
                <ion-label>Quantity (servings)</ion-label>
                <ion-input
                  v-model.number="quantity"
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="1.0"
                />
              </div>
              <div class="nutrition-preview" v-if="selectedFood">
                <h4>Nutrition ({{ quantity }} serving{{ quantity !== 1 ? 's' : '' }})</h4>
                <div class="nutrition-grid">
                  <div class="nutrition-item">
                    <span class="label">Calories</span>
                    <span class="value">{{ Math.round(selectedFood.calories * quantity) }}</span>
                  </div>
                  <div class="nutrition-item">
                    <span class="label">Protein</span>
                    <span class="value">{{ Math.round(selectedFood.protein * quantity) }}g</span>
                  </div>
                  <div class="nutrition-item">
                    <span class="label">Carbs</span>
                    <span class="value">{{ Math.round(selectedFood.carbs * quantity) }}g</span>
                  </div>
                  <div class="nutrition-item">
                    <span class="label">Fats</span>
                    <span class="value">{{ Math.round(selectedFood.fats * quantity) }}g</span>
                  </div>
                </div>
              </div>
              <ion-button expand="block" @click="confirmSelection" :disabled="!quantity || quantity <= 0">
                Add Food
              </ion-button>
            </div>
          </ion-content>
        </ion-modal>

        <!-- Barcode Scanner -->
        <BarcodeScanner
          :is-open="showBarcodeScanner"
          @close="showBarcodeScanner = false"
          @barcode-scanned="handleBarcodeScanned"
        />
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonSearchbar,
  IonItem,
  IonLabel,
  IonIcon,
  IonSpinner,
  IonInput,
} from "@ionic/vue";
import { close, chevronForward, barcode } from "ionicons/icons";
import { useFoodSearch } from "@/features/nutrition/composables/useFoodSearch";
import BarcodeScanner from "./BarcodeScanner.vue";
import type { Food } from "@/features/nutrition/types/food.types";

interface Props {
  isOpen: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  foodSelected: [food: Food, quantity: number];
}>();

const { isLoading, searchResults, search, searchByBarcode } = useFoodSearch();
const searchQuery = ref("");
const showQuantitySelector = ref(false);
const showBarcodeScanner = ref(false);
const selectedFood = ref<Food | null>(null);
const quantity = ref(1);

watch(() => props.isOpen, (newVal) => {
  if (!newVal) {
    searchQuery.value = "";
    showQuantitySelector.value = false;
    showBarcodeScanner.value = false;
    selectedFood.value = null;
    quantity.value = 1;
  }
});

async function handleSearch(event: any) {
  const query = event.detail.value || "";
  if (query.length > 0) {
    await search({ query });
  }
}

function selectFood(food: Food) {
  selectedFood.value = food;
  quantity.value = 1;
  showQuantitySelector.value = true;
}

async function handleBarcodeScanned(barcode: string) {
  showBarcodeScanner.value = false;
  const food = await searchByBarcode(barcode);
  if (food) {
    selectFood(food);
  }
}

function confirmSelection() {
  if (selectedFood.value && quantity.value > 0) {
    emit("foodSelected", selectedFood.value, quantity.value);
    showQuantitySelector.value = false;
  }
}

function parseServingSize(servingSize?: string): string {
  if (!servingSize) return "1 serving";
  try {
    const parsed = JSON.parse(servingSize);
    return `${parsed.amount} ${parsed.unit}`;
  } catch {
    return servingSize;
  }
}
</script>

<style scoped>
.food-search-modal {
  padding-bottom: var(--spacing-xl);
}

.search-section {
  padding: var(--spacing-base);
  border-bottom: 1px solid var(--color-border);
}

.loading-state,
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-2xl);
  color: var(--color-text-secondary);
}

.results-list {
  padding: var(--spacing-sm) 0;
}

.results-list ion-item {
  --padding-start: var(--spacing-base);
  --padding-end: var(--spacing-base);
}

.results-list h3 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.results-list p {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: var(--spacing-xs) 0;
}

.nutrition-preview {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.quantity-selector {
  padding: var(--spacing-xl);
}

.food-info {
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.food-info h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.food-info p {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: var(--spacing-xs) 0;
}

.serving-size {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.quantity-input {
  margin-bottom: var(--spacing-xl);
}

.quantity-input ion-label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.nutrition-preview {
  margin-bottom: var(--spacing-xl);
}

.nutrition-preview h4 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-base) 0;
}

.nutrition-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-base);
}

.nutrition-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.nutrition-item .label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.nutrition-item .value {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}
</style>

