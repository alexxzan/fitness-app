<template>
  <div class="questionnaire-step">
    <div class="step-header">
      <ion-icon :icon="icon" class="step-icon" />
      <h2 class="step-title">{{ title }}</h2>
      <p v-if="description" class="step-description">{{ description }}</p>
    </div>
    <div class="step-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from "@ionic/vue";

interface Props {
  title: string;
  description?: string;
  icon: any; // Icon from ionicons/icons
}

defineProps<Props>();
</script>

<style scoped>
.questionnaire-step {
  padding: var(--spacing-base);
}

.step-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.step-icon {
  font-size: 48px;
  color: var(--color-primary);
  margin-bottom: var(--spacing-base);
}

.step-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.step-description {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

.step-content {
  max-width: 600px;
  margin: 0 auto;
}
</style>

