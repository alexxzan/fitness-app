<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Diet Setup</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleCancel">
            <ion-icon :icon="close" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <DietQuestionnairePage />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon } from "@ionic/vue";
import { close } from "ionicons/icons";
import { useRouter } from "vue-router";
import DietQuestionnairePage from "@/features/nutrition/components/questionnaire/DietQuestionnairePage.vue";

const router = useRouter();

function handleCancel() {
  router.push("/macros");
}
</script>

