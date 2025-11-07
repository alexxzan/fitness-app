<template>
  <div class="workout-completed">
    <!-- Header Section -->
    <div class="completed-header">
      <div class="success-icon-wrapper">
        <div class="success-icon">
          <ion-icon :icon="checkmarkCircle" class="checkmark-icon"></ion-icon>
        </div>
      </div>
      <h1 class="title">Workout Completed!</h1>
      <div v-if="celebrationStats" class="workout-count-badge">
        <span class="count-number">#{{ celebrationStats.workoutCount }}</span>
        <span class="count-label">Total Workouts</span>
      </div>
    </div>

    <!-- Milestone Badge (if applicable) -->
    <div
      v-if="celebrationStats?.milestone?.isMilestone"
      class="milestone-badge"
    >
      <div class="milestone-icon-wrapper">
        <ion-icon
          :icon="getMilestoneIcon(celebrationStats.milestone.icon)"
          class="milestone-icon"
        ></ion-icon>
      </div>
      <div class="milestone-content">
        <div class="milestone-label">
          {{ celebrationStats.milestone.label }}
        </div>
        <div class="milestone-message">
          {{ celebrationStats.milestone.message }}
        </div>
      </div>
    </div>

    <!-- Quick Stats Row -->
    <div v-if="celebrationStats" class="quick-stats-row">
      <div class="quick-stat-card">
        <div class="quick-stat-icon-wrapper streak">
          <ion-icon :icon="flame" class="quick-stat-icon"></ion-icon>
        </div>
        <div class="quick-stat-content">
          <div class="quick-stat-value">{{ celebrationStats.streak }}</div>
          <div class="quick-stat-label">Day Streak</div>
        </div>
      </div>
      <div class="quick-stat-card">
        <div class="quick-stat-icon-wrapper weekly">
          <ion-icon :icon="calendar" class="quick-stat-icon"></ion-icon>
        </div>
        <div class="quick-stat-content">
          <div class="quick-stat-value">{{ celebrationStats.weeklyCount }}</div>
          <div class="quick-stat-label">This Week</div>
        </div>
      </div>
    </div>

    <!-- PR Cards Section -->
    <div
      v-if="celebrationStats && celebrationStats.prs.length > 0"
      class="prs-section"
    >
      <div class="section-header">
        <ion-icon :icon="trophy" class="section-header-icon"></ion-icon>
        <h3 class="section-title">Personal Records</h3>
      </div>
      <div class="prs-grid">
        <div
          v-for="(pr, index) in celebrationStats.prs"
          :key="`${pr.exerciseId}-${pr.type}`"
          class="pr-card animate-slide-up"
          :style="{ animationDelay: `${index * 0.05}s` }"
        >
          <div class="pr-icon-wrapper">
            <ion-icon :icon="trophy" class="pr-icon"></ion-icon>
          </div>
          <div class="pr-content">
            <div class="pr-exercise">{{ pr.exerciseName }}</div>
            <div class="pr-type">{{ getPRTypeLabel(pr.type) }}</div>
            <div class="pr-value-row">
              <span class="pr-value">{{ formatPRValue(pr) }}</span>
              <span class="pr-improvement"> +{{ formatImprovement(pr) }} </span>
            </div>
            <div class="pr-percent">
              {{ pr.improvementPercent.toFixed(0) }}% improvement
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No PRs Message -->
    <div
      v-if="
        celebrationStats &&
        celebrationStats.prs.length === 0 &&
        workout.type === 'regular'
      "
      class="no-prs-message"
    >
      <ion-icon :icon="fitnessOutline" class="no-prs-icon"></ion-icon>
      <p>No PRs this time, but keep pushing!</p>
    </div>

    <!-- Positive Comparisons -->
    <div v-if="celebrationStats?.comparisons" class="comparison-section">
      <div class="section-header">
        <ion-icon :icon="trendingUp" class="section-header-icon"></ion-icon>
        <h3 class="section-title">Improvement</h3>
      </div>
      <div class="comparison-grid">
        <div v-if="celebrationStats.comparisons.volume" class="comparison-card">
          <div class="comparison-icon-wrapper">
            <ion-icon :icon="barbell" class="comparison-icon"></ion-icon>
          </div>
          <div class="comparison-content">
            <div class="comparison-label">Volume</div>
            <div class="comparison-value">
              +{{
                celebrationStats.comparisons.volume.improvement.toFixed(0)
              }}kg
            </div>
            <div class="comparison-percent">
              {{
                celebrationStats.comparisons.volume.improvementPercent.toFixed(
                  0
                )
              }}% more
            </div>
          </div>
        </div>
        <div
          v-if="celebrationStats.comparisons.duration"
          class="comparison-card"
        >
          <div class="comparison-icon-wrapper">
            <ion-icon :icon="time" class="comparison-icon"></ion-icon>
          </div>
          <div class="comparison-content">
            <div class="comparison-label">Duration</div>
            <div class="comparison-value">
              {{ celebrationStats.comparisons.duration.improvement }} min faster
            </div>
            <div class="comparison-percent">
              {{
                celebrationStats.comparisons.duration.improvementPercent.toFixed(
                  0
                )
              }}% faster
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Card -->
    <div class="summary-card">
      <div class="summary-header">
        <ion-icon
          :icon="clipboardOutline"
          class="summary-header-icon"
        ></ion-icon>
        <div>
          <h2 class="workout-name">{{ workout.name }}</h2>
          <p class="workout-date">{{ formattedDate }}</p>
        </div>
      </div>

      <div class="stats-grid">
        <!-- Regular Workout Stats -->
        <template v-if="workout.type === 'regular'">
          <div class="stat-item">
            <ion-icon :icon="time" class="stat-item-icon"></ion-icon>
            <div class="stat-item-content">
              <span class="stat-value">{{ statistics.duration }}</span>
              <span class="stat-label">Minutes</span>
            </div>
          </div>
          <div class="stat-item">
            <ion-icon :icon="apps" class="stat-item-icon"></ion-icon>
            <div class="stat-item-content">
              <span class="stat-value">{{ statistics.totalSets }}</span>
              <span class="stat-label">Sets</span>
            </div>
          </div>
          <div class="stat-item">
            <ion-icon :icon="repeat" class="stat-item-icon"></ion-icon>
            <div class="stat-item-content">
              <span class="stat-value">{{ statistics.totalReps }}</span>
              <span class="stat-label">Reps</span>
            </div>
          </div>
          <div class="stat-item">
            <ion-icon :icon="barbell" class="stat-item-icon"></ion-icon>
            <div class="stat-item-content">
              <span class="stat-value">{{
                statistics.totalVolume.toFixed(0)
              }}</span>
              <span class="stat-label">kg Lifted</span>
            </div>
          </div>
        </template>

        <!-- Interval Workout Stats -->
        <template v-else-if="workout.type === 'interval'">
          <div class="stat-item">
            <ion-icon :icon="time" class="stat-item-icon"></ion-icon>
            <div class="stat-item-content">
              <span class="stat-value">{{ statistics.duration }}</span>
              <span class="stat-label">Minutes</span>
            </div>
          </div>
          <div class="stat-item">
            <ion-icon :icon="refresh" class="stat-item-icon"></ion-icon>
            <div class="stat-item-content">
              <span class="stat-value">{{
                workout.intervalProgress?.currentRound || 0
              }}</span>
              <span class="stat-label">Rounds</span>
            </div>
          </div>
          <div class="stat-item">
            <ion-icon :icon="pulse" class="stat-item-icon"></ion-icon>
            <div class="stat-item-content">
              <span class="stat-value">{{
                workout.intervalProgress?.completedIntervals || 0
              }}</span>
              <span class="stat-label">Intervals</span>
            </div>
          </div>
          <div class="stat-item">
            <ion-icon :icon="fitnessOutline" class="stat-item-icon"></ion-icon>
            <div class="stat-item-content">
              <span class="stat-value">{{ statistics.exercisesCount }}</span>
              <span class="stat-label">Exercises</span>
            </div>
          </div>
        </template>
      </div>

      <!-- Exercises List -->
      <div v-if="exerciseList.length > 0" class="exercises-section">
        <div class="section-header">
          <ion-icon :icon="listOutline" class="section-header-icon"></ion-icon>
          <h3 class="section-title">Exercises</h3>
        </div>
        <div class="exercise-list">
          <div
            v-for="(exercise, index) in exerciseList"
            :key="index"
            class="exercise-item"
          >
            <div class="exercise-bullet-wrapper">
              <ion-icon
                :icon="fitnessOutline"
                class="exercise-bullet-icon"
              ></ion-icon>
            </div>
            <span class="exercise-name">{{ exercise }}</span>
          </div>
        </div>
      </div>

      <!-- Notes Input -->
      <div class="notes-section">
        <div class="section-header">
          <ion-icon
            :icon="createOutline"
            class="section-header-icon"
          ></ion-icon>
          <label class="notes-label" for="workout-notes">Workout Notes</label>
        </div>
        <textarea
          id="workout-notes"
          v-model="notes"
          class="notes-input"
          placeholder="How did it go? Any observations?"
          rows="3"
        ></textarea>
      </div>
    </div>

    <div class="actions">
      <AppButton expand="block" @click="handleDone"> Done </AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { IonIcon } from "@ionic/vue";
import {
  trophy,
  trendingUp,
  time,
  flame,
  calendar,
  star,
  medal,
  checkmarkCircle,
  barbell,
  fitnessOutline,
  clipboardOutline,
  apps,
  repeat,
  refresh,
  pulse,
  listOutline,
  createOutline,
} from "ionicons/icons";
import confetti from "canvas-confetti";
import AppButton from "@/components/atoms/AppButton.vue";
import type { Workout, WorkoutStatistics } from "../../types/workout.types";
import {
  useWorkoutCelebration,
} from "../../composables/useWorkoutCelebration";
import type {
  CelebrationStats,
  PersonalRecord,
} from "../../composables/useWorkoutCelebration";

interface Props {
  workout: Workout;
  statistics: WorkoutStatistics;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  done: [notes: string];
}>();

const notes = ref(props.workout.notes || "");
const celebrationStats = ref<CelebrationStats | null>(null);
const { getCelebrationStats, isLoading } = useWorkoutCelebration();

const formattedDate = computed(() => {
  const date = props.workout.endTime
    ? new Date(props.workout.endTime)
    : new Date();
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

const exerciseList = computed(() => {
  if (props.workout.type === "regular") {
    return props.workout.exercises.map((ex) => ex.exerciseName);
  } else if (
    props.workout.type === "interval" &&
    props.workout.intervalConfig
  ) {
    return props.workout.intervalConfig.exercises.map((ex) => ex.exerciseName);
  }
  return [];
});

function getMilestoneIcon(iconName: string) {
  switch (iconName) {
    case "star":
      return star;
    case "trophy":
      return trophy;
    case "medal":
      return medal;
    default:
      return trophy;
  }
}

function getPRTypeLabel(type: string): string {
  switch (type) {
    case "weight":
      return "Max Weight";
    case "reps":
      return "Max Reps";
    case "volume":
      return "Max Volume";
    default:
      return type;
  }
}

function formatPRValue(pr: PersonalRecord): string {
  if (pr.type === "weight") {
    return `${pr.value}kg`;
  } else if (pr.type === "reps") {
    return `${pr.value} reps`;
  } else {
    return `${pr.value.toFixed(0)}kg`;
  }
}

function formatImprovement(pr: PersonalRecord): string {
  if (pr.type === "weight") {
    return `${pr.improvement}kg`;
  } else if (pr.type === "reps") {
    return `${pr.improvement} reps`;
  } else {
    return `${pr.improvement.toFixed(0)}kg`;
  }
}

function triggerConfetti(type: "milestone" | "pr" = "pr") {
  const duration = 3000;
  const colors =
    type === "milestone"
      ? ["#FFD700", "#FFA500", "#FF6B6B", "#4ECDC4", "#45B7D1"]
      : ["#10B981", "#059669", "#34D399", "#6EE7B7"];

  const confettiConfig = {
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: colors,
  };

  confetti(confettiConfig);

  // Additional bursts for milestones
  if (type === "milestone") {
    setTimeout(() => {
      confetti({
        ...confettiConfig,
        angle: 60,
        origin: { x: 0 },
      });
      confetti({
        ...confettiConfig,
        angle: 120,
        origin: { x: 1 },
      });
    }, 250);
  }
}

async function loadCelebrationStats() {
  try {
    const stats = await getCelebrationStats(props.workout);
    celebrationStats.value = stats;

    // Trigger confetti for milestones
    if (stats.milestone?.isMilestone) {
      setTimeout(() => triggerConfetti("milestone"), 500);
    }

    // Trigger confetti for PRs
    if (stats.prs.length > 0) {
      setTimeout(
        () => triggerConfetti("pr"),
        stats.milestone?.isMilestone ? 2000 : 500
      );
    }
  } catch (error) {
    console.error("Failed to load celebration stats:", error);
  }
}

function handleDone() {
  emit("done", notes.value);
}

onMounted(() => {
  loadCelebrationStats();
});
</script>

<style scoped>
.workout-completed {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: var(--spacing-base);
  overflow-y: auto;
  background-color: var(--color-background);
  gap: var(--spacing-md);
}

.completed-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-base);
}

.success-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-xs);
}

.success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: linear-gradient(
    135deg,
    var(--color-success-500) 0%,
    var(--color-success-600) 100%
  );
  border-radius: var(--radius-full);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  animation: scaleIn 0.4s ease-out;
}

.checkmark-icon {
  font-size: 2rem;
  color: white;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
  text-align: center;
}

/* Workout Count Badge */
.workout-count-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-base);
  background-color: var(--color-primary-50);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-primary-200);
  margin-top: var(--spacing-xs);
}

.count-number {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-700);
}

.count-label {
  font-size: var(--typography-small-size);
  color: var(--color-primary-600);
  font-weight: var(--font-weight-medium);
}

/* Milestone Badge */
.milestone-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
  padding: var(--spacing-base);
  background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
  border-radius: var(--radius-card);
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
  animation: fadeInScale 0.5s ease-out;
  margin-bottom: var(--spacing-md);
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.milestone-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-base);
  flex-shrink: 0;
}

.milestone-icon {
  font-size: 1.5rem;
  color: white;
}

.milestone-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.milestone-label {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: white;
}

.milestone-message {
  font-size: var(--typography-small-size);
  color: white;
  opacity: 0.95;
}

/* Section Header */
.section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.section-header-icon {
  font-size: 1.25rem;
  color: var(--color-primary-600);
}

.section-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

/* Quick Stats Row */
.quick-stats-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.quick-stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-base);
  background-color: var(--color-surface);
  border-radius: var(--radius-card);
  border: 1px solid var(--color-border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.quick-stat-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-base);
  flex-shrink: 0;
}

.quick-stat-icon-wrapper.streak {
  background-color: rgba(255, 107, 107, 0.1);
}

.quick-stat-icon-wrapper.weekly {
  background-color: rgba(29, 185, 84, 0.1);
}

.quick-stat-icon {
  font-size: 1.25rem;
}

.quick-stat-icon-wrapper.streak .quick-stat-icon {
  color: #ff6b6b;
}

.quick-stat-icon-wrapper.weekly .quick-stat-icon {
  color: var(--color-primary-600);
}

.quick-stat-content {
  flex: 1;
  min-width: 0;
}

.quick-stat-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: 1.2;
}

.quick-stat-label {
  font-size: var(--typography-small-size);
  color: var(--color-text-secondary);
  margin-top: 2px;
}

/* PRs Section */
.prs-section {
  margin-bottom: var(--spacing-md);
}

.prs-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.pr-card {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-base);
  background: linear-gradient(
    135deg,
    var(--color-success-500) 0%,
    var(--color-success-600) 100%
  );
  border-radius: var(--radius-card);
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.2);
  color: white;
  animation: slideUpFade 0.4s ease-out forwards;
  opacity: 0;
}

@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pr-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-base);
  flex-shrink: 0;
}

.pr-icon {
  font-size: 1.25rem;
  color: white;
}

.pr-content {
  flex: 1;
  min-width: 0;
}

.pr-exercise {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pr-type {
  font-size: var(--typography-small-size);
  opacity: 0.9;
  margin-bottom: var(--spacing-xs);
}

.pr-value-row {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);
  margin-bottom: 4px;
}

.pr-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
}

.pr-improvement {
  font-size: var(--font-size-sm);
  opacity: 0.95;
}

.pr-percent {
  font-size: var(--typography-small-size);
  opacity: 0.85;
}

/* No PRs Message */
.no-prs-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-base);
  background-color: var(--color-surface);
  border-radius: var(--radius-card);
  text-align: center;
  margin-bottom: var(--spacing-md);
  border: 1px solid var(--color-border);
}

.no-prs-icon {
  font-size: 2rem;
  color: var(--color-text-tertiary);
}

.no-prs-message p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--typography-body-size);
}

/* Comparison Section */
.comparison-section {
  margin-bottom: var(--spacing-md);
}

.comparison-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.comparison-card {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-base);
  background-color: var(--color-surface);
  border-radius: var(--radius-card);
  border: 1px solid var(--color-border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.comparison-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: var(--color-primary-50);
  border-radius: var(--radius-base);
  flex-shrink: 0;
}

.comparison-icon {
  font-size: 1.25rem;
  color: var(--color-primary-600);
}

.comparison-content {
  flex: 1;
  min-width: 0;
}

.comparison-label {
  font-size: var(--typography-small-size);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  margin-bottom: 4px;
}

.comparison-value {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.comparison-percent {
  font-size: var(--typography-small-size);
  color: var(--color-primary-600);
}

/* Summary Card */
.summary-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
  padding: var(--spacing-base);
  background-color: var(--color-surface);
  border-radius: var(--radius-card);
  border: 1px solid var(--color-border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: var(--spacing-md);
}

.summary-header {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
}

.summary-header-icon {
  font-size: 1.25rem;
  color: var(--color-primary-600);
  margin-top: 2px;
  flex-shrink: 0;
}

.workout-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 4px 0;
}

.workout-date {
  font-size: var(--typography-small-size);
  color: var(--color-text-secondary);
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: var(--color-background-secondary);
  border-radius: var(--radius-base);
  border: 1px solid var(--color-border);
}

.stat-item-icon {
  font-size: 1.125rem;
  color: var(--color-primary-600);
  flex-shrink: 0;
}

.stat-item-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.stat-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: var(--typography-small-size);
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.exercises-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--color-border);
}

.exercise-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-xs);
}

.exercise-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) 0;
}

.exercise-bullet-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.exercise-bullet-icon {
  font-size: 0.875rem;
  color: var(--color-primary-600);
}

.exercise-name {
  font-size: var(--typography-body-size);
  color: var(--color-text-primary);
}

.notes-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--color-border);
}

.notes-label {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.notes-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-base);
  font-family: var(--font-family-base);
  font-size: var(--typography-body-size);
  color: var(--color-text-primary);
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  resize: vertical;
  transition: border-color 0.2s ease;
  margin-top: var(--spacing-xs);
}

.notes-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
}

.notes-input::placeholder {
  color: var(--color-text-tertiary);
}

.actions {
  margin-top: var(--spacing-base);
  padding-bottom: var(--spacing-base);
}

/* Tablet and larger */
@media (min-width: 768px) {
  .workout-completed {
    max-width: 600px;
    margin: 0 auto;
    padding: var(--spacing-lg);
  }

  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .prs-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .comparison-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
