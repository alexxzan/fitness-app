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

      <!-- Add Food Modal -->
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
          <h2>Welcome to Macro Tracking!</h2>
          <p>Let's set up your personalized diet plan.</p>
          <AppButton @click="showQuestionnaire = true">Get Started</AppButton>
        </div>

        <!-- Main tracking interface -->
        <div v-else>
          <!-- Date selector -->
          <ion-item button @click="showDatePicker = true">
            <ion-label>Date</ion-label>
            <ion-label slot="end">{{ formatDate(selectedDate) }}</ion-label>
          </ion-item>
          
          <!-- Date Picker Modal -->
          <ion-modal
            key="date-picker-modal"
            :is-open="showDatePicker"
            @did-dismiss="showDatePicker = false"
          >
            <ion-header>
              <ion-toolbar>
                <ion-title>Select Date</ion-title>
                <ion-buttons slot="end">
                  <ion-button @click="showDatePicker = false">Done</ion-button>
                </ion-buttons>
              </ion-toolbar>
            </ion-header>
            <ion-content>
              <ion-datetime
                presentation="date"
                :value="selectedDate"
                @ion-change="handleDateChange"
              ></ion-datetime>
            </ion-content>
          </ion-modal>

          <!-- Macro Plan Summary -->
          <ion-card v-if="macroPlan" class="plan-summary">
            <ion-card-header>
              <ion-card-title>Your Daily Targets</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <div class="targets-grid">
                <div class="target-item">
                  <div class="target-label">Calories</div>
                  <div class="target-value">{{ Math.round(macroPlan.dailyCalories) }}</div>
                </div>
                <div class="target-item">
                  <div class="target-label">Protein</div>
                  <div class="target-value">{{ Math.round(macroPlan.protein) }}g</div>
                </div>
                <div class="target-item">
                  <div class="target-label">Carbs</div>
                  <div class="target-value">{{ Math.round(macroPlan.carbs) }}g</div>
                </div>
                <div class="target-item">
                  <div class="target-label">Fats</div>
                  <div class="target-value">{{ Math.round(macroPlan.fats) }}g</div>
                </div>
              </div>
            </ion-card-content>
          </ion-card>

          <!-- Progress Visualization -->
          <ion-card v-if="dailySummary" class="progress-card">
            <ion-card-header>
              <ion-card-title>Today's Progress</ion-card-title>
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
              <div class="remaining-summary">
                <div class="remaining-item">
                  <span>Remaining Calories:</span>
                  <strong>{{ Math.round(dailySummary.remaining.calories) }}</strong>
                </div>
                <div class="remaining-item">
                  <span>Water:</span>
                  <strong>{{ Math.round(dailySummary.waterConsumed) }}ml / {{ Math.round(dailySummary.waterGoal) }}ml</strong>
                </div>
              </div>
            </ion-card-content>
          </ion-card>

          <!-- Food Logs -->
          <ion-card class="food-logs-card">
            <ion-card-header>
              <ion-card-title>Food Log</ion-card-title>
              <AppButton
                slot="end"
                size="small"
                @click="showAddFoodModal = true"
              >
                Add Food
              </AppButton>
            </ion-card-header>
            <ion-card-content>
              <ion-list v-if="foodLogs.length > 0">
                <ion-item
                  v-for="log in foodLogs"
                  :key="`food-log-${log.id}`"
                  class="food-log-item"
                >
                  <ion-label>
                    <h3>{{ log.foodName }}</h3>
                    <p>{{ log.mealType }}</p>
                    <p>
                      {{ Math.round(log.calories) }} kcal | P: {{ Math.round(log.protein) }}g |
                      C: {{ Math.round(log.carbs) }}g | F: {{ Math.round(log.fats) }}g
                    </p>
                  </ion-label>
                  <ion-button
                    slot="end"
                    fill="clear"
                    color="danger"
                    @click="handleDeleteFood(log.id)"
                  >
                    <ion-icon :icon="trashOutline"></ion-icon>
                  </ion-button>
                </ion-item>
              </ion-list>
              <div v-else class="empty-food-log">
                <p>No food logged yet today.</p>
                <AppButton fill="outline" @click="showAddFoodModal = true">
                  Add Your First Meal
                </AppButton>
              </div>
            </ion-card-content>
          </ion-card>

          <!-- Water Tracking -->
          <ion-card class="water-card">
            <ion-card-header>
              <ion-card-title>Water Intake</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <div class="water-tracking">
                <div class="water-progress">
                  <div
                    class="water-bar"
                    :style="{
                      width: dailySummary
                        ? `${(dailySummary.waterConsumed / dailySummary.waterGoal) * 100}%`
                        : '0%',
                    }"
                  ></div>
                </div>
                <div class="water-actions">
                  <AppButton
                    v-for="amount in [250, 500, 750]"
                    :key="`water-btn-${amount}`"
                    size="small"
                    fill="outline"
                    @click="handleAddWater(amount)"
                  >
                    +{{ amount }}ml
                  </AppButton>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
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
  IonItem,
  IonLabel,
  IonList,
  IonButton,
  IonIcon,
  IonSpinner,
  IonModal,
  IonDatetime,
  IonButtons,
} from "@ionic/vue";
import { trashOutline } from "ionicons/icons";
import AppButton from "@/components/atoms/AppButton.vue";
import { useMacroTracking } from "@/features/macros/composables/useMacroTracking";
import MacroQuestionnaireModal from "@/features/macros/components/questionnaire/MacroQuestionnaireModal.vue";
import AddFoodModal from "@/features/macros/components/food/AddFoodModal.vue";
import CircularProgress from "@/features/macros/components/progress/CircularProgress.vue";
import type { UserProfile } from "@/features/macros/types/macro.types";

const {
  userProfile,
  macroPlan,
  foodLogs,
  selectedDate,
  isLoading,
  hasProfile,
  dailySummary,
  saveProfile,
  addFoodLog,
  deleteFoodLog,
  addWaterLog,
  setSelectedDate,
} = useMacroTracking();

const showQuestionnaire = ref(false);
const showAddFoodModal = ref(false);
const showDatePicker = ref(false);

function handleQuestionnaireComplete(profile: UserProfile) {
  saveProfile(profile);
  showQuestionnaire.value = false;
}

function handleAddFood(food: Parameters<typeof addFoodLog>[0]) {
  addFoodLog(food);
}

function handleDeleteFood(id: string) {
  deleteFoodLog(id);
}

function handleAddWater(amount: number) {
  addWaterLog(amount);
}

function handleDateChange(event: CustomEvent) {
  const date = event.detail.value;
  if (date) {
    setSelectedDate(date.split("T")[0]);
    showDatePicker.value = false;
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString();
  }
}

onMounted(async () => {
  // Wait for reactive state to be fully initialized
  await nextTick();
  // Check profile status after initialization
  if (!hasProfile.value) {
    showQuestionnaire.value = true;
  }
});
</script>

<style scoped>
.macros-container {
  padding: var(--spacing-md);
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
  padding: var(--spacing-xl);
  text-align: center;
  min-height: 50vh;
}

.empty-state h2 {
  margin-bottom: var(--spacing-md);
}

.empty-state p {
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-secondary);
}

.plan-summary {
  margin-bottom: var(--spacing-md);
}

.targets-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.target-item {
  text-align: center;
  padding: var(--spacing-md);
  background: var(--color-background-secondary);
  border-radius: var(--radius-card);
}

.target-label {
  font-size: var(--typography-caption-size);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.target-value {
  font-size: var(--typography-heading-size-md);
  font-weight: var(--typography-weight-bold);
  color: var(--color-text-primary);
}

.progress-card {
  margin-bottom: var(--spacing-md);
}

.progress-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  justify-items: center;
}

.remaining-summary {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.remaining-item {
  display: flex;
  justify-content: space-between;
  font-size: var(--typography-body-size);
}

.food-logs-card {
  margin-bottom: var(--spacing-md);
}

.empty-food-log {
  text-align: center;
  padding: var(--spacing-xl);
}

.food-log-item {
  --padding-start: var(--spacing-md);
  --padding-end: var(--spacing-md);
}

.water-card {
  margin-bottom: var(--spacing-md);
}

.water-tracking {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.water-progress {
  width: 100%;
  height: 24px;
  background: var(--color-background-tertiary);
  border-radius: var(--radius-button);
  overflow: hidden;
}

.water-bar {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

.water-actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: center;
}
</style>
