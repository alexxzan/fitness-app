<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/home">
          <ion-icon aria-hidden="true" :icon="home" />
          <ion-label>Home</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="exercises" href="/exercises">
          <ion-icon aria-hidden="true" :icon="pulse" />
          <ion-label>Cardio</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="workout" href="/workout" class="workout-tab">
          <ion-icon aria-hidden="true" :icon="barbell" />
          <ion-label>Workout</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="progress" href="/progress">
          <ion-icon aria-hidden="true" :icon="statsChart" />
          <ion-label>Progress</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="macros" href="/macros">
          <ion-icon aria-hidden="true" :icon="restaurant" />
          <ion-label>Nutrition</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonLabel,
  IonIcon,
  IonPage,
  IonRouterOutlet,
} from "@ionic/vue";
import { home, pulse, barbell, statsChart, restaurant } from "ionicons/icons";
</script>

<style scoped>
.workout-tab {
  --color-selected: var(--color-primary);
  --color: var(--color-text-tertiary);
  transform: scale(1.1);
  margin-bottom: var(--spacing-sm);
  transition: var(--transition-transform);
}

.workout-tab ion-icon {
  font-size: var(--icon-size-xl);
}
</style>
