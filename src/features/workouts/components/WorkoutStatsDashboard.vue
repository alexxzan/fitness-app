<template>
  <div class="workout-stats-dashboard">
    <h2 class="section-title">Overview</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <ion-icon :icon="barbell" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ totalWorkouts }}</div>
          <div class="stat-label">Total Workouts</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <ion-icon :icon="fitness" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ totalVolume }}</div>
          <div class="stat-label">Total Volume (kg)</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <ion-icon :icon="flame" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ currentStreak }}</div>
          <div class="stat-label">Day Streak</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <ion-icon :icon="calendar" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ thisWeekWorkouts }}</div>
          <div class="stat-label">This Week</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue'
import { barbell, fitness, flame, calendar } from 'ionicons/icons'

interface Props {
  totalWorkouts?: number
  totalVolume?: number
  currentStreak?: number
  thisWeekWorkouts?: number
}

withDefaults(defineProps<Props>(), {
  totalWorkouts: 24,
  totalVolume: 2450,
  currentStreak: 5,
  thisWeekWorkouts: 3
})
</script>

<style scoped>
.workout-stats-dashboard {
  margin-bottom: var(--spacing-xl);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-base) 0;
  padding: 0 var(--spacing-base);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-base);
  padding: 0 var(--spacing-base);
}

.stat-card {
  background: var(--card-background);
  border-radius: var(--radius-card);
  padding: var(--spacing-base);
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  border: var(--card-border-width) solid var(--card-border-color);
  transition: var(--transition-shadow);
}

.stat-card:active {
  box-shadow: var(--shadow-card-hover);
}

.stat-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-button);
  background: linear-gradient(
    135deg,
    var(--color-primary-500) 0%,
    var(--color-primary-600) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-primary);
}

.stat-icon ion-icon {
  font-size: 24px;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: 2px;
  line-height: var(--line-height-normal);
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>

