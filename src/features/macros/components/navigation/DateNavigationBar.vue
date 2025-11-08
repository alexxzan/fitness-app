<template>
  <ion-card class="date-navigation-card">
    <ion-card-content>
      <!-- Quick Date Buttons -->
      <ion-segment
        v-model="selectedQuickDate"
        @ionChange="handleQuickDateChange"
        class="quick-date-segment"
      >
        <ion-segment-button value="yesterday">
          <ion-label>Yesterday</ion-label>
        </ion-segment-button>
        <ion-segment-button value="today">
          <ion-label>Today</ion-label>
        </ion-segment-button>
        <ion-segment-button value="tomorrow">
          <ion-label>Tomorrow</ion-label>
        </ion-segment-button>
      </ion-segment>

      <!-- Date Navigation -->
      <div class="date-navigation">
        <ion-button fill="clear" @click="navigateDate(-1)" :disabled="isToday">
          <ion-icon slot="icon-only" :icon="chevronBackOutline"></ion-icon>
        </ion-button>

        <ion-datetime-button
          id="date-picker-button"
          datetime="date-picker"
          class="date-display-button"
          color="primary"
        />

        <ion-button fill="clear" @click="navigateDate(1)" :disabled="isToday">
          <ion-icon slot="icon-only" :icon="chevronForwardOutline"></ion-icon>
        </ion-button>
      </div>
    </ion-card-content>
  </ion-card>

  <!-- Date Picker Modal -->
  <ion-modal
    trigger="date-picker-button"
    :keep-contents-mounted="true"
    class="date-picker-modal"
    color="primary"
  >
    <ion-datetime
      id="date-picker"
      presentation="date"
      :value="currentDate"
      :min="minDate"
      :max="maxDate"
      @ion-change="handleDateChange"
      color="primary"
    />
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  IonCard,
  IonCardContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonButton,
  IonIcon,
  IonDatetimeButton,
  IonModal,
  IonDatetime,
} from "@ionic/vue";
import { chevronBackOutline, chevronForwardOutline } from "ionicons/icons";

interface Props {
  date: string; // ISO date string (YYYY-MM-DD)
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "date-change": [date: string];
}>();

const selectedQuickDate = ref<string>("today");

const today = computed(() => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString().split("T")[0];
});

const minDate = computed(() => {
  // Allow dates up to 1 year in the past
  const min = new Date();
  min.setFullYear(min.getFullYear() - 1);
  min.setHours(0, 0, 0, 0);
  return min.toISOString().split("T")[0];
});

const maxDate = computed(() => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.toISOString().split("T")[0];
});

// Clamp the current date to be within bounds for ion-datetime
const currentDate = computed(() => {
  const dateStr = props.date;
  const min = minDate.value;
  const max = maxDate.value;

  // Clamp to min/max bounds
  if (dateStr < min) {
    return min;
  }
  if (dateStr > max) {
    return max;
  }

  return dateStr;
});

const isToday = computed(() => {
  return props.date === today.value;
});

watch(
  () => props.date,
  (newDate) => {
    const todayStr = today.value;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    if (newDate === todayStr) {
      selectedQuickDate.value = "today";
    } else if (newDate === yesterday.toISOString().split("T")[0]) {
      selectedQuickDate.value = "yesterday";
    } else if (newDate === tomorrow.toISOString().split("T")[0]) {
      selectedQuickDate.value = "tomorrow";
    } else {
      selectedQuickDate.value = "";
    }
  },
  { immediate: true }
);

function navigateDate(days: number) {
  const date = new Date(props.date);
  date.setDate(date.getDate() + days);
  const newDate = date.toISOString().split("T")[0];

  // Clamp to max date (tomorrow)
  const max = maxDate.value;
  const clampedDate = newDate > max ? max : newDate;

  emit("date-change", clampedDate);
}

function handleQuickDateChange(event: CustomEvent) {
  const value = event.detail.value;
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  let targetDate: Date;

  if (value === "today") {
    targetDate = todayDate;
  } else if (value === "yesterday") {
    targetDate = new Date(todayDate);
    targetDate.setDate(targetDate.getDate() - 1);
  } else if (value === "tomorrow") {
    targetDate = new Date(todayDate);
    targetDate.setDate(targetDate.getDate() + 1);
  } else {
    return;
  }

  const dateStr = targetDate.toISOString().split("T")[0];

  // Clamp to max date (tomorrow)
  const max = maxDate.value;
  const clampedDate = dateStr > max ? max : dateStr;

  emit("date-change", clampedDate);
}

function handleDateChange(event: CustomEvent) {
  const date = event.detail.value;
  if (date) {
    let dateStr: string;

    if (typeof date === "string") {
      dateStr = date.split("T")[0];
    } else if (date instanceof Date) {
      dateStr = date.toISOString().split("T")[0];
    } else {
      // Handle ISO date string format
      dateStr = date;
    }

    // Clamp to max date (tomorrow)
    const max = maxDate.value;
    const clampedDate = dateStr > max ? max : dateStr;

    emit("date-change", clampedDate);
  }
}
</script>

<style scoped>
.date-navigation-card {
  margin-bottom: var(--spacing-md);
}

.quick-date-segment {
  margin-bottom: var(--spacing-md);
}

.date-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.date-display-button {
  flex: 1;
  --padding-start: var(--spacing-md);
  --padding-end: var(--spacing-md);
}

/* Date Picker Modal Styling */
.date-picker-modal {
  --backdrop-opacity: 0.5;
}
</style>
