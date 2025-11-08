<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Macros</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <!-- Questionnaire Modal -->
      <MacroQuestionnaireModal
        key="questionnaire-modal"
        :is-open="showQuestionnaire"
        @close="showQuestionnaire = false"
        @complete="handleQuestionnaireComplete"
      />

      <!-- Quick Add Food Modal -->
      <QuickAddFoodModal
        key="quick-add-modal"
        :is-open="showQuickAddModal"
        :date="selectedDate"
        :recent-foods="recentFoods"
        :all-foods="allFoods"
        :initial-meal-type="quickAddMealType"
        @close="showQuickAddModal = false"
        @add="handleAddFood"
      />

      <!-- Add Food Modal (Full Form) -->
      <AddFoodModal
        key="add-food-modal"
        :is-open="showAddFoodModal"
        :date="selectedDate"
        @close="showAddFoodModal = false"
        @add="handleAddFood"
      />

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <ion-spinner></ion-spinner>
      </div>

      <!-- Main Content -->
      <div v-else class="macros-container">
        <!-- Show questionnaire if no profile -->
        <div v-if="!hasProfile" class="empty-state">
          <ion-icon :icon="restaurantOutline" class="empty-icon"></ion-icon>
          <h2>Welcome to Macro Tracking!</h2>
          <p>Let's set up your personalized diet plan.</p>
          <ion-button @click="showQuestionnaire = true">Get Started</ion-button>
        </div>

        <!-- Main tracking interface -->
        <div v-else>
          <!-- Date Navigation -->
          <DateNavigationBar
            :date="selectedDate"
            @date-change="handleDateChange"
          />

          <!-- Macro Plan Summary -->
          <ion-card v-if="macroPlan" class="plan-summary-card">
            <ion-card-header>
              <ion-card-title>
                <ion-icon :icon="flagOutline" slot="start"></ion-icon>
                Daily Targets
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-grid>
                <ion-row>
                  <ion-col size="6">
                    <div class="target-item">
                      <ion-label class="target-label">Calories</ion-label>
                      <ion-badge color="primary" class="target-value">
                        {{ Math.round(macroPlan.dailyCalories) }}
                      </ion-badge>
                    </div>
                  </ion-col>
                  <ion-col size="6">
                    <div class="target-item">
                      <ion-label class="target-label">Protein</ion-label>
                      <ion-badge color="success" class="target-value">
                        {{ Math.round(macroPlan.protein) }}g
                      </ion-badge>
                    </div>
                  </ion-col>
                  <ion-col size="6">
                    <div class="target-item">
                      <ion-label class="target-label">Carbs</ion-label>
                      <ion-badge color="warning" class="target-value">
                        {{ Math.round(macroPlan.carbs) }}g
                      </ion-badge>
                    </div>
                  </ion-col>
                  <ion-col size="6">
                    <div class="target-item">
                      <ion-label class="target-label">Fats</ion-label>
                      <ion-badge color="danger" class="target-value">
                        {{ Math.round(macroPlan.fats) }}g
                      </ion-badge>
                    </div>
                  </ion-col>
                </ion-row>
              </ion-grid>
            </ion-card-content>
          </ion-card>

          <!-- Progress Visualization -->
          <ion-card v-if="dailySummary" class="progress-card">
            <ion-card-header>
              <ion-card-title>
                <ion-icon :icon="statsChart" slot="start"></ion-icon>
                Today's Progress
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <!-- Linear Progress Bars -->
              <div class="progress-bars">
                <MacroProgressBar
                  label="Calories"
                  :value="dailySummary.consumed.calories"
                  :max="dailySummary.target.calories"
                  color="primary"
                />
                <MacroProgressBar
                  label="Protein"
                  :value="dailySummary.consumed.protein"
                  :max="dailySummary.target.protein"
                  unit="g"
                  color="success"
                />
                <MacroProgressBar
                  label="Carbs"
                  :value="dailySummary.consumed.carbs"
                  :max="dailySummary.target.carbs"
                  unit="g"
                  color="warning"
                />
                <MacroProgressBar
                  label="Fats"
                  :value="dailySummary.consumed.fats"
                  :max="dailySummary.target.fats"
                  unit="g"
                  color="danger"
                />
              </div>

              <!-- Remaining Summary -->
              <ion-grid class="remaining-summary">
                <ion-row>
                  <ion-col>
                    <div class="remaining-item">
                      <ion-label>Remaining Calories</ion-label>
                      <ion-badge
                        :color="dailySummary.remaining.calories > 0 ? 'primary' : 'danger'"
                      >
                        {{ Math.round(dailySummary.remaining.calories) }}
                      </ion-badge>
                    </div>
                  </ion-col>
                </ion-row>
              </ion-grid>
            </ion-card-content>
          </ion-card>

          <!-- Circular Progress (Alternative View) -->
          <ion-card v-if="dailySummary" class="circular-progress-card">
            <ion-card-header>
              <ion-card-title>Macro Breakdown</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <div class="progress-grid">
                <CircularProgress
                  :value="dailySummary.consumed.calories"
                  :max="dailySummary.target.calories"
                  label="Calories"
                  color="var(--color-primary)"
                />
                <CircularProgress
                  :value="dailySummary.consumed.protein"
                  :max="dailySummary.target.protein"
                  label="Protein"
                  color="var(--color-success)"
                  unit="g"
                />
                <CircularProgress
                  :value="dailySummary.consumed.carbs"
                  :max="dailySummary.target.carbs"
                  label="Carbs"
                  color="var(--color-warning)"
                  unit="g"
                />
                <CircularProgress
                  :value="dailySummary.consumed.fats"
                  :max="dailySummary.target.fats"
                  label="Fats"
                  color="var(--color-danger)"
                  unit="g"
                />
              </div>
            </ion-card-content>
          </ion-card>

          <!-- Recent Foods -->
          <RecentFoodsList
            v-if="recentFoods.length > 0"
            :recent-foods="recentFoods"
            @add-food="handleAddRecentFood"
          />

          <!-- Meal Sections -->
          <div class="meals-container">
            <MealSection
              v-for="mealType in mealTypes"
              :key="mealType"
              :meal-type="mealType"
              :items="foodLogsByMeal[mealType]"
              @add-food="handleAddFoodToMeal"
              @edit="handleEditFood"
              @duplicate="handleDuplicateFood"
              @delete="handleDeleteFood"
            />
          </div>

          <!-- Water Tracking -->
          <ion-card class="water-card">
            <ion-card-header>
              <ion-card-title>
                <ion-icon :icon="water" slot="start"></ion-icon>
                Water Intake
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <div class="water-tracking">
                <div class="water-progress-container">
                  <ion-progress-bar
                    :value="waterProgress"
                    color="primary"
                    class="water-progress-bar"
                  ></ion-progress-bar>
                  <div class="water-amount">
                    <ion-text>
                      <strong>{{ Math.round(dailySummary?.waterConsumed || 0) }}ml</strong>
                    </ion-text>
                    <ion-text color="medium">
                      / {{ Math.round(dailySummary?.waterGoal || 0) }}ml
                    </ion-text>
                  </div>
                </div>
                <div class="water-actions">
                  <ion-button
                    v-for="amount in [250, 500, 750]"
                    :key="`water-btn-${amount}`"
                    fill="outline"
                    @click="handleAddWater(amount)"
                  >
                    <ion-icon slot="start" :icon="addOutline"></ion-icon>
                    +{{ amount }}ml
                  </ion-button>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>

      <!-- Floating Action Button -->
      <ion-fab
        v-if="hasProfile"
        vertical="bottom"
        horizontal="end"
        slot="fixed"
      >
        <ion-fab-button @click="showQuickAddModal = true">
          <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  IonIcon,
  IonLabel,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonText,
  IonProgressBar,
  IonFab,
  IonFabButton,
} from "@ionic/vue";
import {
  restaurantOutline,
  flagOutline,
  statsChart,
  water,
  addOutline,
} from "ionicons/icons";
import { useMacroTracking } from "@/features/macros/composables/useMacroTracking";
import MacroQuestionnaireModal from "@/features/macros/components/questionnaire/MacroQuestionnaireModal.vue";
import AddFoodModal from "@/features/macros/components/food/AddFoodModal.vue";
import QuickAddFoodModal from "@/features/macros/components/food/QuickAddFoodModal.vue";
import CircularProgress from "@/features/macros/components/progress/CircularProgress.vue";
import MacroProgressBar from "@/features/macros/components/progress/MacroProgressBar.vue";
import DateNavigationBar from "@/features/macros/components/navigation/DateNavigationBar.vue";
import RecentFoodsList from "@/features/macros/components/food/RecentFoodsList.vue";
import MealSection from "@/features/macros/components/meals/MealSection.vue";
import type { UserProfile, MealType, FoodLog } from "@/features/macros/types/macro.types";

const {
  userProfile,
  macroPlan,
  foodLogs,
  selectedDate,
  isLoading,
  hasProfile,
  dailySummary,
  foodLogsByMeal,
  recentFoods,
  allFoods,
  saveProfile,
  addFoodLog,
  updateFoodLog,
  deleteFoodLog,
  addWaterLog,
  setSelectedDate,
} = useMacroTracking();

const showQuestionnaire = ref(false);
const showAddFoodModal = ref(false);
const showQuickAddModal = ref(false);
const quickAddMealType = ref<MealType>("breakfast");

const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

const waterProgress = computed(() => {
  if (!dailySummary.value || dailySummary.value.waterGoal === 0) return 0;
  return Math.min(
    dailySummary.value.waterConsumed / dailySummary.value.waterGoal,
    1
  );
});

function handleQuestionnaireComplete(profile: UserProfile) {
  saveProfile(profile);
  showQuestionnaire.value = false;
}

function handleAddFood(food: Parameters<typeof addFoodLog>[0]) {
  addFoodLog(food);
  showQuickAddModal.value = false;
  showAddFoodModal.value = false;
}

function handleAddRecentFood(foodLog: FoodLog) {
  handleAddFood({
    date: selectedDate.value,
    mealType: foodLog.mealType,
    foodName: foodLog.foodName,
    calories: foodLog.calories,
    protein: foodLog.protein,
    carbs: foodLog.carbs,
    fats: foodLog.fats,
    notes: foodLog.notes,
  });
}

function handleAddFoodToMeal(mealType: MealType) {
  quickAddMealType.value = mealType;
  showQuickAddModal.value = true;
}

function handleEditFood(foodLog: FoodLog) {
  // For now, open the add modal with pre-filled data
  // In the future, we could create an EditFoodModal
  showAddFoodModal.value = true;
}

function handleDuplicateFood(foodLog: FoodLog) {
  handleAddFood({
    date: selectedDate.value,
    mealType: foodLog.mealType,
    foodName: foodLog.foodName,
    calories: foodLog.calories,
    protein: foodLog.protein,
    carbs: foodLog.carbs,
    fats: foodLog.fats,
    notes: foodLog.notes,
  });
}

function handleDeleteFood(id: string) {
  deleteFoodLog(id);
}

function handleAddWater(amount: number) {
  addWaterLog(amount);
}

function handleDateChange(date: string) {
  setSelectedDate(date);
}

onMounted(async () => {
  await nextTick();
  if (!hasProfile.value) {
    showQuestionnaire.value = true;
  }
});
</script>

<style scoped>
.macros-container {
  padding: var(--spacing-md);
  padding-bottom: calc(var(--spacing-md) + 80px); /* Space for FAB */
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  text-align: center;
  min-height: 50vh;
}

.empty-icon {
  font-size: 64px;
  color: var(--color-text-tertiary);
  opacity: 0.5;
  margin-bottom: var(--spacing-lg);
}

.empty-state h2 {
  margin-bottom: var(--spacing-md);
}

.empty-state p {
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-secondary);
}

.plan-summary-card,
.progress-card,
.circular-progress-card {
  margin-bottom: var(--spacing-md);
}

.target-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  background: var(--color-background-secondary);
  border-radius: var(--radius-card);
}

.target-label {
  font-size: var(--typography-caption-size);
  color: var(--color-text-secondary);
}

.target-value {
  font-size: var(--typography-heading-size-md);
  font-weight: var(--typography-weight-bold);
}

.progress-bars {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.remaining-summary {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.remaining-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--typography-body-size);
}

.progress-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
  justify-items: center;
}

.meals-container {
  margin-bottom: var(--spacing-md);
}

.water-card {
  margin-bottom: var(--spacing-md);
}

.water-tracking {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.water-progress-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.water-progress-bar {
  height: 12px;
  border-radius: var(--radius-full);
}

.water-amount {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-xs);
  font-size: var(--typography-body-size);
}

.water-actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: center;
  flex-wrap: wrap;
}
</style>
