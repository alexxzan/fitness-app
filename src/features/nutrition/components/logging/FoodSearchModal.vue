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
          <ion-button
            expand="block"
            fill="outline"
            @click="showBarcodeScanner = true"
          >
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
                {{ food.calories }} cal • {{ food.protein }}g P •
                {{ food.carbs }}g C • {{ food.fats }}g F
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
        <ion-modal
          :is-open="showQuantitySelector"
          @didDismiss="showQuantitySelector = false"
        >
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
                <p class="serving-size">
                  Serving size:
                  {{ parseServingSize(selectedFood?.servingSize) }}
                </p>
              </div>
              <div class="input-mode-selector">
                <ion-segment v-model="inputMode" @ionChange="handleModeChange">
                  <ion-segment-button value="servings">
                    <ion-label>Servings</ion-label>
                  </ion-segment-button>
                  <ion-segment-button value="grams">
                    <ion-label>Grams</ion-label>
                  </ion-segment-button>
                </ion-segment>
              </div>
              <div class="quantity-input">
                <ion-label v-if="inputMode === 'servings'"
                  >Quantity (servings)</ion-label
                >
                <ion-label v-else>Weight (grams)</ion-label>
                <ion-input
                  v-model.number="inputValue"
                  type="number"
                  :min="inputMode === 'servings' ? '0.1' : '1'"
                  :step="inputMode === 'servings' ? '0.1' : '1'"
                  :placeholder="inputMode === 'servings' ? '1.0' : '100'"
                />
              </div>
              <div class="nutrition-preview" v-if="selectedFood">
                <h4 v-if="inputMode === 'servings'">
                  Nutrition ({{ inputValue }} serving{{
                    inputValue !== 1 ? "s" : ""
                  }})
                </h4>
                <h4 v-else>Nutrition ({{ inputValue }}g)</h4>
                <div class="nutrition-grid">
                  <div class="nutrition-item">
                    <span class="label">Calories</span>
                    <span class="value">{{
                      Math.round(selectedFood.calories * multiplier)
                    }}</span>
                  </div>
                  <div class="nutrition-item">
                    <span class="label">Protein</span>
                    <span class="value"
                      >{{
                        Math.round(selectedFood.protein * multiplier * 10) / 10
                      }}g</span
                    >
                  </div>
                  <div class="nutrition-item">
                    <span class="label">Carbs</span>
                    <span class="value"
                      >{{
                        Math.round(selectedFood.carbs * multiplier * 10) / 10
                      }}g</span
                    >
                  </div>
                  <div class="nutrition-item">
                    <span class="label">Fats</span>
                    <span class="value"
                      >{{
                        Math.round(selectedFood.fats * multiplier * 10) / 10
                      }}g</span
                    >
                  </div>
                </div>
              </div>
              <ion-button
                expand="block"
                @click="confirmSelection"
                :disabled="!inputValue || inputValue <= 0"
              >
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
import { ref, watch, computed } from "vue";
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
  IonSegment,
  IonSegmentButton,
} from "@ionic/vue";
import { close, chevronForward, barcode } from "ionicons/icons";
import { useFoodSearch } from "@/features/nutrition/composables/useFoodSearch";
import BarcodeScanner from "./BarcodeScanner.vue";
import type { Food, ServingSize } from "@/features/nutrition/types/food.types";

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
const inputMode = ref<"servings" | "grams">("servings");
const inputValue = ref(1);
const previousMode = ref<"servings" | "grams">("servings");

watch(
  () => props.isOpen,
  (newVal) => {
    if (!newVal) {
      searchQuery.value = "";
      showQuantitySelector.value = false;
      showBarcodeScanner.value = false;
      selectedFood.value = null;
      inputValue.value = 1;
      inputMode.value = "servings";
      previousMode.value = "servings";
    }
  }
);

// Computed property to get serving size as object
const servingSize = computed((): ServingSize | null => {
  if (!selectedFood.value?.servingSize) return null;
  try {
    return JSON.parse(selectedFood.value.servingSize);
  } catch {
    return null;
  }
});

// Computed property to calculate multiplier based on input mode
const multiplier = computed((): number => {
  if (!selectedFood.value || !inputValue.value || inputValue.value <= 0)
    return 0;

  if (inputMode.value === "servings") {
    return inputValue.value;
  } else {
    // Input is in grams, need to convert to servings
    const serving = servingSize.value;
    if (!serving) return inputValue.value; // Fallback to treating as servings if no serving size

    // If serving size is in grams, calculate ratio
    if (
      serving.unit.toLowerCase() === "g" ||
      serving.unit.toLowerCase() === "gram" ||
      serving.unit.toLowerCase() === "grams"
    ) {
      return inputValue.value / serving.amount;
    }

    // For other units, we can't directly convert to grams
    // In this case, we'll assume 1 serving = serving.amount of the unit
    // and try to convert if possible (this is a limitation)
    // For now, we'll show a message or fallback
    return inputValue.value / serving.amount;
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
  inputValue.value = 1;
  inputMode.value = "servings";
  previousMode.value = "servings";
  showQuantitySelector.value = true;
}

function handleModeChange() {
  // When switching modes, convert the current value from the previous mode
  if (!selectedFood.value || !servingSize.value) {
    inputValue.value = inputMode.value === "servings" ? 1 : 100;
    previousMode.value = inputMode.value;
    return;
  }

  const serving = servingSize.value;
  const isGramsUnit =
    serving.unit.toLowerCase() === "g" ||
    serving.unit.toLowerCase() === "gram" ||
    serving.unit.toLowerCase() === "grams";

  if (previousMode.value === "servings" && inputMode.value === "grams") {
    // Converting from servings to grams
    if (isGramsUnit) {
      inputValue.value = Math.round(inputValue.value * serving.amount);
    } else {
      // Can't convert accurately, set a default
      inputValue.value = 100;
    }
  } else if (previousMode.value === "grams" && inputMode.value === "servings") {
    // Converting from grams to servings
    if (isGramsUnit) {
      inputValue.value =
        Math.round((inputValue.value / serving.amount) * 10) / 10;
      if (inputValue.value === 0) inputValue.value = 0.1; // Ensure minimum value
    } else {
      // Can't convert accurately, set default
      inputValue.value = 1;
    }
  }

  previousMode.value = inputMode.value;
}

async function handleBarcodeScanned(barcode: string) {
  showBarcodeScanner.value = false;
  const food = await searchByBarcode(barcode);
  if (food) {
    selectFood(food);
  }
}

function confirmSelection() {
  if (selectedFood.value && inputValue.value > 0 && multiplier.value > 0) {
    // Always emit the quantity in servings (multiplier)
    emit("foodSelected", selectedFood.value, multiplier.value);
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

.input-mode-selector {
  margin-bottom: var(--spacing-lg);
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
