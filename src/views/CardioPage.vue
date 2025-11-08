<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Cardio</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="cardio-placeholder">
        <ion-card>
          <ion-card-content>
            <ion-icon :icon="pulse" size="large" />
            <h2>Cardio Screen</h2>
            <p>Coming Soon</p>
          </ion-card-content>
        </ion-card>
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
  IonCard,
  IonCardContent,
  IonIcon,
} from "@ionic/vue";
import { pulse } from "ionicons/icons";
</script>

<style scoped>
.cardio-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: var(--spacing-2xl);
}

.cardio-placeholder ion-card {
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.cardio-placeholder ion-icon {
  color: var(--color-primary);
  margin-bottom: var(--spacing-base);
}

.cardio-placeholder h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: var(--spacing-base) 0 var(--spacing-sm);
}

.cardio-placeholder p {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0;
}
</style>

