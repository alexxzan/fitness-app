<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/tabs/home">
          <ion-icon aria-hidden="true" :icon="home" />
          <ion-label>Home</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="exercises" href="/tabs/exercises">
          <ion-icon aria-hidden="true" :icon="fitness" />
          <ion-label>Exercises</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="workout" href="/tabs/workout" class="workout-tab">
          <ion-icon aria-hidden="true" :icon="barbell" />
          <ion-label>Workout</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="progress" href="/tabs/progress">
          <ion-icon aria-hidden="true" :icon="statsChart" />
          <ion-label>Progress</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="macros" href="/tabs/macros">
          <ion-icon aria-hidden="true" :icon="restaurant" />
          <ion-label>Macros</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { home, fitness, barbell, statsChart, restaurant } from 'ionicons/icons';
</script>

<style scoped>
.workout-tab {
  --color-selected: var(--ion-color-primary);
  --color: var(--ion-color-medium);
  transform: scale(1.1);
  margin-bottom: 8px;
}

.workout-tab ion-icon {
  font-size: 28px;
}
</style>
