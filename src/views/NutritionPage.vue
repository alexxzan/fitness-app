<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Nutrition</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="nutrition-page">
        <!-- Macro Rings Section -->
        <MacroRings
          v-if="macroTargets"
          :targets="macroTargets"
          :current="todayNutrition"
          :loading="isLoadingNutrition"
        />

        <!-- Quick Stats -->
        <QuickStats
          :adherence-score="adherenceScore"
          :calories-remaining="caloriesRemaining"
          :protein-remaining="proteinRemaining"
        />

        <!-- Today's Food Log -->
        <div class="section">
          <div class="section-header">
            <h2 class="section-title">Today's Log</h2>
            <ion-button fill="clear" size="small" @click="openFoodSearch">
              <ion-icon :icon="add" slot="icon-only" />
            </ion-button>
          </div>
          <DailyLogList
            :logs="todayLogsWithFoods"
            :loading="isLoadingLogs || isLoadingFoods"
            @edit="handleEditLog"
            @delete="handleDeleteLog"
          />
        </div>

        <!-- Target Display -->
        <TargetDisplay
          v-if="activeTarget"
          :target="activeTarget"
          @edit="openTargetSetup"
        />

        <!-- Insights Panel -->
        <InsightsPanel :insights="insights" />
      </div>

      <!-- Floating Action Button -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="openFoodSearch">
          <ion-icon :icon="add" />
        </ion-fab-button>
      </ion-fab>

      <!-- Modals -->
      <FoodSearchModal
        :is-open="showFoodSearch"
        @close="showFoodSearch = false"
        @food-selected="handleFoodSelected"
      />

      <TargetSetupModal
        :is-open="showTargetSetup"
        @close="showTargetSetup = false"
        @target-set="handleTargetSet"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
} from "@ionic/vue";
import { add } from "ionicons/icons";
import { useFoodLog } from "@/features/nutrition/composables/useFoodLog";
import { useNutritionTargets } from "@/features/nutrition/composables/useNutritionTargets";
import { AnalyticsService } from "@/features/nutrition/services/analytics.service";
import { FoodRepository } from "@/features/nutrition/repositories/food.repository";
import MacroRings from "@/features/nutrition/components/dashboard/MacroRings.vue";
import QuickStats from "@/features/nutrition/components/dashboard/QuickStats.vue";
import DailyLogList from "@/features/nutrition/components/dashboard/DailyLogList.vue";
import TargetDisplay from "@/features/nutrition/components/coaching/TargetDisplay.vue";
import InsightsPanel from "@/features/nutrition/components/analytics/InsightsPanel.vue";
import FoodSearchModal from "@/features/nutrition/components/logging/FoodSearchModal.vue";
import TargetSetupModal from "@/features/nutrition/components/coaching/TargetSetupModal.vue";
import type { FoodLog, Food } from "@/features/nutrition/types/food.types";

const {
  isLoading: isLoadingLogs,
  todayLogs,
  todayNutrition,
  loadTodayLogs,
  logFood,
  deleteFoodLog,
  calculateTodayNutrition,
} = useFoodLog();

// Remove the async computed property usage - we'll load foods separately

const {
  isLoading: isLoadingTargets,
  activeTarget,
  macroTargets,
  loadActiveTarget,
} = useNutritionTargets();

const showFoodSearch = ref(false);
const showTargetSetup = ref(false);
const adherenceScore = ref<number | null>(null);
const insights = ref<string[]>([]);
const todayLogsWithFoods = ref<Array<FoodLog & { food: Food | null }>>([]);
const isLoadingFoods = ref(false);

const isLoadingNutrition = computed(
  () => isLoadingLogs.value || isLoadingTargets.value
);

const caloriesRemaining = computed(() => {
  if (!macroTargets.value || !todayNutrition.value) return null;
  return Math.max(
    0,
    macroTargets.value.calories - todayNutrition.value.calories
  );
});

const proteinRemaining = computed(() => {
  if (!macroTargets.value || !todayNutrition.value) return null;
  return Math.max(0, macroTargets.value.protein - todayNutrition.value.protein);
});

onMounted(async () => {
  await loadTodayLogs();
  await loadActiveTarget();
  await loadTodayLogsWithFoods();
  await loadTodayNutrition();
  await loadInsights();
});

async function loadTodayNutrition() {
  try {
    const today = new Date().toISOString().split("T")[0];
    const summary = await AnalyticsService.getDailySummary(today);
    adherenceScore.value = summary.adherenceScore || null;
  } catch (error) {
    console.error("Failed to load today's nutrition:", error);
  }
}

async function loadInsights() {
  try {
    const today = new Date().toISOString().split("T")[0];
    insights.value = await AnalyticsService.generateInsights(today);
  } catch (error) {
    console.error("Failed to load insights:", error);
  }
}

async function loadTodayLogsWithFoods() {
  isLoadingFoods.value = true;
  try {
    const logs = todayLogs.value;
    const logsWithFoods = await Promise.all(
      logs.map(async (log) => {
        const food = await FoodRepository.getById(log.foodId);
        return { ...log, food };
      })
    );
    todayLogsWithFoods.value = logsWithFoods;
  } catch (error) {
    console.error("Failed to load foods for logs:", error);
  } finally {
    isLoadingFoods.value = false;
  }
}

watch(
  todayLogs,
  async () => {
    await loadTodayLogsWithFoods();
  },
  { immediate: true }
);

function openFoodSearch() {
  showFoodSearch.value = true;
}

function openTargetSetup() {
  showTargetSetup.value = true;
}

async function handleFoodSelected(food: Food, quantity: number) {
  try {
    await logFood(food.id, quantity);
    await calculateTodayNutrition();
    await loadTodayNutrition();
    await loadInsights();
    showFoodSearch.value = false;
  } catch (error) {
    console.error("Failed to log food:", error);
  }
}

async function handleDeleteLog(id: string) {
  try {
    await deleteFoodLog(id);
    await calculateTodayNutrition();
    await loadTodayNutrition();
    await loadInsights();
  } catch (error) {
    console.error("Failed to delete log:", error);
  }
}

function handleEditLog(log: FoodLog & { food: Food | null }) {
  // TODO: Implement edit functionality
  console.log("Edit log:", log);
}

async function handleTargetSet() {
  await loadActiveTarget();
  showTargetSetup.value = false;
}
</script>

<style scoped>
.nutrition-page {
  padding-bottom: var(--spacing-5xl);
}

.section {
  margin-bottom: var(--spacing-xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--spacing-base);
  margin-bottom: var(--spacing-base);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}
</style>
