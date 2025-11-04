<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { IonApp, IonRouterOutlet } from "@ionic/vue";
import { useTheme } from "@/shared/composables/useTheme";

// Initialize theme on app startup
const { loadTheme } = useTheme();

onMounted(() => {
  loadTheme();
});
</script>
