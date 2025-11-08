<template>
  <div
    v-if="isActive"
    class="rest-timer-bottom"
    :class="{ 'rest-timer-bottom--visible': isActive }"
  >
    <div class="timer-content">
      <div class="timer-info">
        <div class="exercise-name">{{ exerciseName }}</div>
        <div class="timer-display">{{ formattedTime }}</div>
      </div>
      <div class="timer-controls">
        <button
          class="control-button control-button--subtract"
          @click="adjustTime(-15)"
          aria-label="Subtract 15 seconds"
        >
          <ion-icon :icon="remove" />
          <span>15s</span>
        </button>
        <button
          class="control-button control-button--skip"
          @click="skip"
          aria-label="Skip rest"
        >
          <ion-icon :icon="close" />
          <span>Skip</span>
        </button>
        <button
          class="control-button control-button--add"
          @click="adjustTime(15)"
          aria-label="Add 15 seconds"
        >
          <ion-icon :icon="add" />
          <span>15s</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { IonIcon } from "@ionic/vue";
import { add, remove, close } from "ionicons/icons";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { playRestTimerCompleteNotification } from "@/shared/utils/audio-notification";

interface Props {
  isActive: boolean;
  timeRemaining: number;
  exerciseName: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  adjustTime: [delta: number];
  skip: [];
}>();

const formattedTime = computed(() => {
  const mins = Math.floor(props.timeRemaining / 60);
  const secs = props.timeRemaining % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
});

// Watch for timer completion (when timeRemaining goes from > 0 to 0)
watch(
  () => props.timeRemaining,
  (newTime, oldTime) => {
    // Only play sound if timer was active, had time remaining, and now reached 0
    if (
      props.isActive &&
      oldTime !== undefined &&
      oldTime > 0 &&
      newTime === 0
    ) {
      playRestTimerCompleteNotification().catch((error) => {
        // Silently fail if audio notification is not available
        console.debug("Audio notification not available:", error);
      });
    }
  }
);

async function adjustTime(delta: number) {
  emit("adjustTime", delta);
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (error) {
    // Haptics not available
  }
}

async function skip() {
  emit("skip");
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch (error) {
    // Haptics not available
  }
}
</script>

<style scoped>
.rest-timer-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  background: linear-gradient(
    135deg,
    var(--color-primary-600) 0%,
    var(--color-primary-500) 50%,
    var(--color-primary-400) 100%
  );
  border-top: none;
  box-shadow: 0 -4px 16px rgba(29, 185, 84, 0.3);
  z-index: 999; /* Below FAB (usually 1000+) */
  transform: translateY(100%);
  transition: transform 0.3s ease-out;
  padding-bottom: env(safe-area-inset-bottom);
}

.rest-timer-bottom--visible {
  transform: translateY(0);
}

.timer-content {
  padding: var(--spacing-base) var(--spacing-base);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-base);
  max-width: 100%;
}

.timer-info {
  flex: 1;
  min-width: 0;
}

.exercise-name {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: var(--typography-body-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.timer-display {
  font-size: var(--typography-h4-size);
  font-weight: var(--typography-h3-weight);
  font-variant-numeric: tabular-nums;
  color: #ffffff;
  letter-spacing: 0.05em;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.timer-controls {
  display: flex;
  gap: var(--spacing-sm);
  flex-shrink: 0;
  align-items: center;
}

.control-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: var(--spacing-xs);
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: var(--radius-full);
  color: var(--color-gray-900);
  cursor: pointer;
  transition: all 0.2s var(--ease-out);
  width: 52px;
  height: 52px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.control-button:hover {
  background: #ffffff;
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
}

.control-button:active {
  transform: translateY(-1px) scale(0.98);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.control-button--add {
  background: rgba(255, 255, 255, 0.95);
}

.control-button--add:hover {
  background: #ffffff;
}

.control-button--subtract {
  background: rgba(255, 255, 255, 0.95);
}

.control-button--subtract:hover {
  background: #ffffff;
}

.control-button--skip {
  background: var(--color-error-500);
  color: #ffffff;
  width: 56px;
  height: 56px;
}

.control-button--skip:hover {
  background: var(--color-error-600);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}

.control-button--skip:active {
  transform: translateY(-1px) scale(0.98);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.control-button ion-icon {
  font-size: 20px;
  color: inherit;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.control-button--skip ion-icon {
  font-size: 22px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}

.control-button span {
  font-size: 9px;
  font-weight: var(--typography-body-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: inherit;
  margin-top: -2px;
}

.control-button--skip span {
  font-size: 9px;
  font-weight: var(--typography-body-weight-bold);
  letter-spacing: 0.8px;
}
</style>
