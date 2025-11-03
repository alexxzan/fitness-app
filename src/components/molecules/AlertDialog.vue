<template>
  <ion-modal :is-open="isOpen" @did-dismiss="handleDismiss">
    <div class="alert-dialog">
      <div class="alert-content">
        <div v-if="header" class="alert-header">
          <h2 class="alert-title">{{ header }}</h2>
        </div>
        <div v-if="message" class="alert-message">
          <p>{{ message }}</p>
        </div>
        <div class="alert-buttons">
          <AppButton
            v-for="(button, index) in buttons"
            :key="index"
            :expand="buttons.length === 1 ? 'block' : undefined"
            :fill="
              button.role === 'cancel' || button.role === 'destructive'
                ? 'outline'
                : 'solid'
            "
            :color="getButtonColor(button)"
            @click="handleButtonClick(button)"
            class="alert-button"
          >
            {{ button.text }}
          </AppButton>
        </div>
      </div>
    </div>
  </ion-modal>
</template>

<script setup lang="ts">
import { IonModal } from "@ionic/vue";
import AppButton from "@/components/atoms/AppButton.vue";

export interface AlertButton {
  text: string;
  role?: "cancel" | "destructive" | "confirm" | string;
  handler?: () => void | Promise<void>;
}

interface Props {
  isOpen: boolean;
  header?: string;
  message?: string;
  buttons: AlertButton[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  dismiss: [];
}>();

function handleDismiss() {
  emit("dismiss");
}

function getButtonColor(button: AlertButton): string {
  if (button.role === "destructive") {
    return "danger";
  }
  if (button.role === "cancel") {
    return "medium";
  }
  return "primary";
}

async function handleButtonClick(button: AlertButton) {
  if (button.handler) {
    await button.handler();
  }
  emit("dismiss");
}
</script>

<style scoped>
.alert-dialog {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--spacing-base);
  background-color: rgba(0, 0, 0, 0.5);
}

.alert-content {
  width: 100%;
  max-width: 400px;
  background-color: var(--color-gray-700);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1);
  animation: slide-up 0.3s ease-out;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alert-header {
  margin-bottom: var(--spacing-base);
}

.alert-title {
  font-size: var(--typography-h3-size);
  font-weight: var(--typography-h3-weight);
  color: var(--color-text-primary);
  margin: 0;
  text-align: center;
}

.alert-message {
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.alert-message p {
  font-size: var(--typography-body-size);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

.alert-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.alert-button {
  min-height: 48px;
}

@media (min-width: 768px) {
  .alert-content {
    padding: var(--spacing-2xl);
  }
}
</style>

