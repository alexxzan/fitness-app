<template>
  <ion-page>
    <ion-content :fullscreen="true" class="splash-content">
      <div class="splash-container">
        <div class="splash-content-inner">
          <!-- App Logo/Branding -->
          <div class="logo-container">
            <ion-icon :icon="fitness" size="large" color="primary"></ion-icon>
          </div>

          <!-- Loading Indicator -->
          <ion-spinner
            v-if="!error"
            name="crescent"
            color="primary"
          ></ion-spinner>

          <!-- Loading Message -->
          <p class="loading-message" v-if="!error">
            {{ loadingMessage }}
          </p>

          <!-- Progress Bar (optional) -->
          <div v-if="showProgress && !error" class="progress-container">
            <ion-progress-bar
              :value="progress / 100"
              color="primary"
            ></ion-progress-bar>
            <p class="progress-text">{{ Math.round(progress) }}%</p>
          </div>

          <!-- Error State -->
          <div v-if="error" class="error-container">
            <ion-icon
              :icon="alertCircle"
              color="danger"
              size="large"
            ></ion-icon>
            <p class="error-message">{{ error }}</p>
            <ion-button @click="retry" color="primary">
              <ion-icon slot="start" :icon="refresh"></ion-icon>
              Retry
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  IonPage,
  IonContent,
  IonSpinner,
  IonIcon,
  IonProgressBar,
  IonButton,
} from "@ionic/vue";
import { fitness, alertCircle, refresh } from "ionicons/icons";
import { ExerciseInitialization } from "@/features/exercises/services/exercise.initialization";

const router = useRouter();
const loadingMessage = ref("Checking initialization...");
const progress = ref(0);
const showProgress = ref(true);
const error = ref<string | null>(null);

const checkAndInitialize = async () => {
  try {
    error.value = null;
    progress.value = 0;
    loadingMessage.value = "Checking initialization...";

    // Check if already initialized
    const isInitialized = await ExerciseInitialization.isInitialized();

    if (isInitialized) {
      // Already initialized, redirect to home
      console.log("✅ Exercises already initialized, redirecting...");
      router.replace("/home");
      return;
    }

    // Not initialized, run initialization
    loadingMessage.value = "Loading exercise library...";
    await ExerciseInitialization.initialize((currentProgress) => {
      progress.value = currentProgress;

      // Update loading message based on progress
      if (currentProgress < 20) {
        loadingMessage.value = "Loading reference data...";
      } else if (currentProgress < 100) {
        loadingMessage.value = `Loading exercises... ${Math.round(
          currentProgress
        )}%`;
      } else {
        loadingMessage.value = "Almost done...";
      }
    });

    // Navigate to home page after successful initialization
    router.replace("/home");
  } catch (err) {
    console.error("Initialization error:", err);
    error.value =
      err instanceof Error
        ? err.message
        : "Failed to load exercise library. Please try again.";
  }
};

const retry = () => {
  checkAndInitialize();
};

onMounted(() => {
  checkAndInitialize();
});
</script>

<style scoped>
.splash-content {
  --background: var(--color-background);
}

.splash-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--spacing-xl);
  transition: var(--transition-background);
}

.splash-content-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xl);
  max-width: 400px;
  width: 100%;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-base);
  transition: var(--transition-transform);
}

.logo-container ion-icon {
  font-size: var(--icon-size-2xl);
}

.loading-message {
  text-align: center;
  font-size: var(--typography-h5-size);
  font-weight: var(--typography-h5-weight);
  color: var(--color-text-primary);
  margin: 0;
  transition: var(--transition-color);
}

.progress-container {
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.progress-text {
  text-align: center;
  font-size: var(--typography-small-size);
  color: var(--color-text-tertiary);
  margin: 0;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-base);
  text-align: center;
}

.error-message {
  color: var(--color-error);
  font-size: var(--typography-body-size);
  margin: 0;
}
</style>
