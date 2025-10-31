<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="workout" href="/tabs/workout">
          <ion-icon aria-hidden="true" :icon="barbell" />
          <ion-label>Workout</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="history" href="/tabs/history">
          <ion-icon aria-hidden="true" :icon="time" />
          <ion-label>History</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="exercises" href="/tabs/exercises">
          <ion-icon aria-hidden="true" :icon="fitness" />
          <ion-label>Exercises</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="routines" href="/tabs/routines">
          <ion-icon aria-hidden="true" :icon="list" />
          <ion-label>Routines</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { barbell, time, fitness, list } from 'ionicons/icons';
</script>
