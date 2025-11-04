<template>
  <ion-page>
    <ion-content :fullscreen="true" class="splash-content">
      <div class="splash-container">
        <div class="splash-content-inner">
          <!-- App Logo/Branding -->
          <div class="logo-container" :class="{ 'animate-in': !error }">
            <ion-icon :icon="fitness" class="logo-icon"></ion-icon>
          </div>

          <!-- Loading State -->
          <div v-if="!error" class="loading-state">
            <ion-spinner
              name="crescent"
              color="primary"
              class="spinner"
            ></ion-spinner>
            <p class="loading-text">{{ loadingMessage }}</p>
          </div>

          <!-- Error State -->
          <div v-if="error" class="error-state">
            <ion-icon
              :icon="alertCircle"
              color="danger"
              class="error-icon"
            ></ion-icon>
            <p class="error-title">Something went wrong</p>
            <p class="error-message">{{ error }}</p>
            <ion-button
              @click="retry"
              color="primary"
              class="retry-button"
              fill="outline"
            >
              <ion-icon slot="start" :icon="refresh"></ion-icon>
              Try Again
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
import { WorkoutTemplatesInitialization } from "@/features/workouts/services/workout-templates.initialization";

const router = useRouter();
const loadingMessage = ref("Getting ready...");
const error = ref<string | null>(null);

const checkAndInitialize = async () => {
  const startTime = Date.now();
  const MIN_DISPLAY_TIME = 1500; // Minimum 1.5 seconds for UX

  try {
    error.value = null;
    loadingMessage.value = "Getting ready...";

    // Check if already initialized
    const exercisesInitialized = await ExerciseInitialization.isInitialized();
    const templatesInitialized =
      await WorkoutTemplatesInitialization.isInitialized();

    if (exercisesInitialized && templatesInitialized) {
      // Already initialized, show brief message then redirect
      loadingMessage.value = "Almost there...";
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_DISPLAY_TIME - elapsed);
      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }
      console.log("✅ Already initialized, redirecting...");
      router.replace("/workout");
      return;
    }

    // Not fully initialized, run initialization with clean messages

    // Initialize exercises
    if (!exercisesInitialized) {
      loadingMessage.value = "Loading exercises...";
      await ExerciseInitialization.initialize(() => {
        // Progress updates handled silently - keep message clean
      });
    }

    // Initialize workout templates
    if (!templatesInitialized) {
      loadingMessage.value = "Loading workouts...";
      await WorkoutTemplatesInitialization.initialize(() => {
        // Progress updates handled silently - keep message clean
      });
    }

    // Final message before redirect
    loadingMessage.value = "Almost there...";

    // Ensure minimum display time
    const elapsed = Date.now() - startTime;
    const remainingTime = Math.max(0, MIN_DISPLAY_TIME - elapsed);
    if (remainingTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
    }

    // Navigate after successful initialization
    router.replace("/workout");
  } catch (err) {
    console.error("Initialization error:", err);
    error.value =
      err instanceof Error
        ? err.message
        : "Failed to initialize app. Please try again.";
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
}

.splash-content-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3xl);
  width: 100%;
  max-width: 320px;
}

/* Logo Container */
.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.logo-container.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.logo-icon {
  font-size: 64px;
  color: var(--color-primary);
  filter: drop-shadow(0 2px 8px rgba(29, 185, 84, 0.3));
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  opacity: 0;
  animation: fadeIn 0.5s ease-out 0.3s forwards;
}

.spinner {
  --color: var(--color-primary);
  width: 40px;
  height: 40px;
}

.loading-text {
  text-align: center;
  font-size: 16px;
  font-weight: 400;
  color: var(--color-text-secondary);
  margin: 0;
  letter-spacing: 0.3px;
  transition: color 0.3s ease;
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  text-align: center;
  opacity: 0;
  animation: fadeIn 0.5s ease-out forwards;
}

.error-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-sm);
}

.error-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.error-message {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
  max-width: 280px;
}

.retry-button {
  margin-top: var(--spacing-base);
  --border-width: 1.5px;
  --border-radius: 8px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.2px;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .logo-icon {
    font-size: 56px;
  }

  .loading-text {
    font-size: 15px;
  }

  .splash-content-inner {
    gap: var(--spacing-2xl);
  }
}
</style>
