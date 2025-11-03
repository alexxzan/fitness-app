<template>
  <div class="workout-completed">
    <div class="completed-header">
      <div class="success-icon">✓</div>
      <h1 class="title">Workout Completed!</h1>

      <!-- Milestone Badge -->
      <div
        v-if="celebrationStats?.milestone?.isMilestone"
        class="milestone-badge"
      >
        <ion-icon
          :icon="getMilestoneIcon(celebrationStats.milestone.icon)"
          class="milestone-icon"
        ></ion-icon>
        <div class="milestone-content">
          <div class="milestone-label">
            {{ celebrationStats.milestone.label }}
          </div>
          <div class="milestone-message">
            {{ celebrationStats.milestone.message }}
          </div>
        </div>
      </div>

      <!-- Workout Count Badge -->
      <div v-if="celebrationStats" class="workout-count-badge">
        <span class="count-number">#{{ celebrationStats.workoutCount }}</span>
        <span class="count-label">Workout</span>
      </div>
    </div>

    <!-- PR Cards Section -->
    <div
      v-if="celebrationStats && celebrationStats.prs.length > 0"
      class="prs-section"
    >
      <h3 class="section-title">🎉 Personal Records</h3>
      <div class="prs-grid">
        <div
          v-for="(pr, index) in celebrationStats.prs"
          :key="`${pr.exerciseId}-${pr.type}`"
          class="pr-card animate-slide-up"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="pr-header">
            <ion-icon :icon="trophy" class="pr-icon"></ion-icon>
            <div class="pr-exercise">{{ pr.exerciseName }}</div>
          </div>
          <div class="pr-type">{{ getPRTypeLabel(pr.type) }}</div>
          <div class="pr-value">{{ formatPRValue(pr) }}</div>
          <div class="pr-improvement">
            +{{ formatImprovement(pr) }} ({{
              pr.improvementPercent.toFixed(0)
            }}% ↑)
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
      <p>No PRs this time, but keep pushing! 💪</p>
    </div>

    <!-- Positive Comparisons -->
    <div v-if="celebrationStats?.comparisons" class="comparison-section">
      <h3 class="section-title">📈 Improvement</h3>
      <div class="comparison-card">
        <div v-if="celebrationStats.comparisons.volume" class="comparison-item">
          <ion-icon :icon="trendingUp" class="comparison-icon"></ion-icon>
          <div class="comparison-content">
            <div class="comparison-label">Volume</div>
            <div class="comparison-value">
              +{{
                celebrationStats.comparisons.volume.improvement.toFixed(0)
              }}kg
              <span class="comparison-percent">
                ({{
                  celebrationStats.comparisons.volume.improvementPercent.toFixed(
                    0
                  )
                }}% more)
              </span>
            </div>
          </div>
        </div>
        <div
          v-if="celebrationStats.comparisons.duration"
          class="comparison-item"
        >
          <ion-icon :icon="time" class="comparison-icon"></ion-icon>
          <div class="comparison-content">
            <div class="comparison-label">Duration</div>
            <div class="comparison-value">
              {{ celebrationStats.comparisons.duration.improvement }} min faster
              <span class="comparison-percent">
                ({{
                  celebrationStats.comparisons.duration.improvementPercent.toFixed(
                    0
                  )
                }}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Streak & Weekly Stats -->
    <div v-if="celebrationStats" class="motivation-stats">
      <div class="motivation-stat-card">
        <ion-icon :icon="flame" class="stat-icon streak-icon"></ion-icon>
        <div class="stat-content">
          <div class="stat-value-large">{{ celebrationStats.streak }}</div>
          <div class="stat-label-large">Day Streak</div>
        </div>
      </div>
      <div class="motivation-stat-card">
        <ion-icon :icon="calendar" class="stat-icon"></ion-icon>
        <div class="stat-content">
          <div class="stat-value-large">{{ celebrationStats.weeklyCount }}</div>
          <div class="stat-label-large">This Week</div>
        </div>
      </div>
    </div>

    <div class="summary-card">
      <h2 class="workout-name">{{ workout.name }}</h2>
      <p class="workout-date">{{ formattedDate }}</p>

      <div class="stats-grid">
        <!-- Regular Workout Stats -->
        <template v-if="workout.type === 'regular'">
          <div class="stat-item">
            <span class="stat-value">{{ statistics.duration }}</span>
            <span class="stat-label">Minutes</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ statistics.totalSets }}</span>
            <span class="stat-label">Sets</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ statistics.totalReps }}</span>
            <span class="stat-label">Reps</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{
              statistics.totalVolume.toFixed(0)
            }}</span>
            <span class="stat-label">kg Lifted</span>
          </div>
        </template>

        <!-- Interval Workout Stats -->
        <template v-else-if="workout.type === 'interval'">
          <div class="stat-item">
            <span class="stat-value">{{ statistics.duration }}</span>
            <span class="stat-label">Minutes</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{
              workout.intervalProgress?.currentRound || 0
            }}</span>
            <span class="stat-label">Rounds</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{
              workout.intervalProgress?.completedIntervals || 0
            }}</span>
            <span class="stat-label">Intervals</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ statistics.exercisesCount }}</span>
            <span class="stat-label">Exercises</span>
          </div>
        </template>
      </div>

      <!-- Exercises List -->
      <div v-if="exerciseList.length > 0" class="exercises-section">
        <h3 class="section-title">Exercises</h3>
        <div class="exercise-list">
          <div
            v-for="(exercise, index) in exerciseList"
            :key="index"
            class="exercise-item"
          >
            <span class="exercise-bullet">•</span>
            <span class="exercise-name">{{ exercise }}</span>
          </div>
        </div>
      </div>

      <!-- Notes Input -->
      <div class="notes-section">
        <label class="notes-label" for="workout-notes">Workout Notes</label>
        <textarea
          id="workout-notes"
          v-model="notes"
          class="notes-input"
          placeholder="How did it go? Any observations?"
          rows="4"
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
} from "ionicons/icons";
import confetti from "canvas-confetti";
import AppButton from "@/components/atoms/AppButton.vue";
import type { Workout, WorkoutStatistics } from "../types/workout.types";
import { useWorkoutCelebration } from "../composables/useWorkoutCelebration";
import type {
  CelebrationStats,
  PersonalRecord,
} from "../composables/useWorkoutCelebration";

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
  padding: var(--spacing-lg);
  overflow-y: auto;
  background-color: var(--color-background);
}

.completed-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-2xl);
}

.success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(
    135deg,
    var(--color-success-600) 0%,
    var(--color-success-700) 100%
  );
  border-radius: var(--radius-full);
  font-size: var(--font-size-4xl);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-lg);
  animation: scaleIn 0.5s ease-out, pulse 2s ease-in-out 0.5s infinite;
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

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Milestone Badge */
.milestone-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-lg);
  margin-top: var(--spacing-md);
  animation: fadeInScale 0.6s ease-out;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.milestone-icon {
  font-size: 2.5rem;
  color: var(--color-text-primary);
}

.milestone-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.milestone-label {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.milestone-message {
  font-size: var(--typography-body-size);
  color: var(--color-text-primary);
  opacity: 0.9;
}

/* Workout Count Badge */
.workout-count-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  background-color: var(--color-surface);
  border-radius: var(--radius-base);
  border: var(--border-width-thin) solid var(--color-border);
  margin-top: var(--spacing-sm);
}

.count-number {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.count-label {
  font-size: var(--typography-small-size);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

/* PRs Section */
.prs-section {
  margin-bottom: var(--spacing-xl);
}

.prs-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.pr-card {
  padding: var(--spacing-lg);
  background: linear-gradient(
    135deg,
    var(--color-success-600) 0%,
    var(--color-success-700) 100%
  );
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-md);
  color: var(--color-text-primary);
  animation: slideUpFade 0.5s ease-out forwards;
  opacity: 0;
}

@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pr-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.pr-icon {
  font-size: 1.5rem;
  color: #ffd700;
}

.pr-exercise {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.pr-type {
  font-size: var(--typography-small-size);
  opacity: 0.9;
  margin-bottom: var(--spacing-xs);
}

.pr-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-xs);
}

.pr-improvement {
  font-size: var(--typography-small-size);
  opacity: 0.9;
}

/* No PRs Message */
.no-prs-message {
  padding: var(--spacing-lg);
  background-color: var(--color-surface);
  border-radius: var(--radius-card);
  text-align: center;
  margin-bottom: var(--spacing-xl);
  border: var(--border-width-thin) solid var(--color-border);
}

.no-prs-message p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--typography-body-size);
}

/* Comparison Section */
.comparison-section {
  margin-bottom: var(--spacing-xl);
}

.comparison-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background-color: var(--color-surface);
  border-radius: var(--radius-card);
  border: var(--border-width-thin) solid var(--color-border);
  margin-top: var(--spacing-md);
}

.comparison-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.comparison-icon {
  font-size: 2rem;
  color: var(--color-success-600);
}

.comparison-content {
  flex: 1;
}

.comparison-label {
  font-size: var(--typography-small-size);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
  margin-bottom: var(--spacing-xs);
}

.comparison-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.comparison-percent {
  font-size: var(--typography-small-size);
  color: var(--color-text-secondary);
  font-weight: normal;
}

/* Motivation Stats */
.motivation-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.motivation-stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background-color: var(--color-surface);
  border-radius: var(--radius-card);
  border: var(--border-width-thin) solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.stat-icon {
  font-size: 2rem;
  color: var(--color-primary);
}

.streak-icon {
  color: #ff6b6b;
}

.stat-content {
  flex: 1;
}

.stat-value-large {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  line-height: var(--line-height-tight);
}

.stat-label-large {
  font-size: var(--typography-small-size);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
  margin-top: var(--spacing-xs);
}

.title {
  font-size: var(--typography-h2-size);
  font-weight: var(--typography-h2-weight);
  color: var(--color-text-primary);
  margin: 0;
  text-align: center;
}

.summary-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background-color: var(--color-surface);
  border-radius: var(--radius-card);
  border: var(--border-width-thin) solid var(--color-border);
  box-shadow: var(--shadow-card);
}

.workout-name {
  font-size: var(--typography-h3-size);
  font-weight: var(--typography-h3-weight);
  color: var(--color-text-primary);
  margin: 0;
  text-align: center;
}

.workout-date {
  font-size: var(--typography-small-size);
  color: var(--color-text-secondary);
  text-align: center;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-base);
  margin-top: var(--spacing-md);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--color-background-secondary);
  border-radius: var(--radius-base);
  border: var(--border-width-thin) solid var(--color-border);
}

.stat-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  line-height: var(--line-height-tight);
}

.stat-label {
  font-size: var(--typography-small-size);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
  margin-top: var(--spacing-xs);
}

.exercises-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: var(--border-width-thin) solid var(--color-border);
}

.section-title {
  font-size: var(--typography-h4-size);
  font-weight: var(--typography-h4-weight);
  color: var(--color-text-primary);
  margin: 0;
}

.exercise-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.exercise-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.exercise-bullet {
  color: var(--color-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.exercise-name {
  font-size: var(--typography-body-size);
  color: var(--color-text-primary);
}

.notes-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: var(--border-width-thin) solid var(--color-border);
}

.notes-label {
  font-size: var(--typography-body-size);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.notes-input {
  width: 100%;
  padding: var(--spacing-md);
  font-family: var(--font-family-base);
  font-size: var(--typography-body-size);
  color: var(--color-text-primary);
  background-color: var(--color-background);
  border: var(--border-width-thin) solid var(--color-border);
  border-radius: var(--radius-input);
  resize: vertical;
  transition: var(--transition-border);
}

.notes-input:focus {
  outline: none;
  border-color: var(--color-border-focus);
}

.notes-input::placeholder {
  color: var(--color-text-tertiary);
}

.actions {
  margin-top: var(--spacing-xl);
}

/* Tablet and larger */
@media (min-width: 768px) {
  .workout-completed {
    max-width: 600px;
    margin: 0 auto;
    padding: var(--spacing-2xl);
  }

  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .success-icon {
    width: 100px;
    height: 100px;
    font-size: var(--font-size-5xl);
  }

  .prs-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .milestone-badge {
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
