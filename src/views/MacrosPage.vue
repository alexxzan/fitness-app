<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Macros</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="placeholder-container">
        <ion-icon :icon="restaurantOutline" class="placeholder-icon"></ion-icon>
        <h2>Macro Tracking</h2>
        <p>Coming soon...</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
} from "@ionic/vue";
import { restaurantOutline } from "ionicons/icons";
</script>

<style scoped>
.placeholder-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  text-align: center;
  min-height: 50vh;
}

.placeholder-icon {
  font-size: 64px;
  color: var(--color-text-tertiary);
  opacity: 0.5;
  margin-bottom: var(--spacing-lg);
}

.placeholder-container h2 {
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
}

.placeholder-container p {
  color: var(--color-text-secondary);
}
</style>

