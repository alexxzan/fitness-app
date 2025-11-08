<template>
  <div class="exercises-section">
    <h2 class="section-title">Exercises</h2>
    <ion-card class="exercises-card" button @click="handleClick">
      <ion-card-content class="exercises-card-content">
        <div class="exercises-card-icon">
          <ion-icon :icon="fitness" />
        </div>
        <div class="exercises-card-text">
          <h3 class="exercises-card-title">Browse Exercises</h3>
          <p class="exercises-card-description">
            Explore and manage your exercise library
          </p>
        </div>
        <ion-icon :icon="chevronForward" class="chevron-icon" />
      </ion-card-content>
    </ion-card>
  </div>
</template>

<script setup lang="ts">
import { IonCard, IonCardContent, IonIcon } from "@ionic/vue";
import { fitness, chevronForward } from "ionicons/icons";
import { useRouter } from "vue-router";

const router = useRouter();

function handleClick() {
  router.push("/exercise-library");
}
</script>

<style scoped>
.exercises-section {
  margin-bottom: var(--spacing-2xl);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-base) 0;
  padding: 0 var(--spacing-base);
}

.exercises-card {
  margin: 0 var(--spacing-base);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  transition: var(--transition-shadow);
}

.exercises-card:active {
  box-shadow: var(--shadow-card-hover);
}

.exercises-card-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
  padding: var(--spacing-base);
}

.exercises-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--color-primary);
  border-radius: var(--radius-button);
  flex-shrink: 0;
}

.exercises-card-icon ion-icon {
  font-size: 24px;
  color: white;
}

.exercises-card-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.exercises-card-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.exercises-card-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.chevron-icon {
  font-size: 20px;
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}
</style>
