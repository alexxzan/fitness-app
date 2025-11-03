<template>
  <label class="app-checkbox" :class="{ 'app-checkbox--checked': checked, 'app-checkbox--disabled': disabled }">
    <input
      type="checkbox"
      :checked="checked"
      :disabled="disabled"
      @change="handleChange"
      class="app-checkbox__input"
    />
    <span class="app-checkbox__checkmark">
      <ion-icon v-if="checked" :icon="checkmark" class="app-checkbox__icon" />
    </span>
  </label>
</template>

<script setup lang="ts">
import { IonIcon } from "@ionic/vue";
import { checkmark } from "ionicons/icons";

interface Props {
  checked: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits<{
  "update:checked": [value: boolean];
}>();

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement;
  emit("update:checked", target.checked);
}
</script>

<style scoped>
.app-checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  cursor: pointer;
  position: relative;
  margin: 0;
}

.app-checkbox--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.app-checkbox__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  cursor: pointer;
}

.app-checkbox__checkmark {
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;
}

.app-checkbox--checked .app-checkbox__checkmark {
  background-color: var(--color-primary-500);
  border-color: var(--color-primary-500);
}

.app-checkbox:not(.app-checkbox--disabled):hover .app-checkbox__checkmark {
  border-color: var(--color-primary-400);
}

.app-checkbox--checked:not(.app-checkbox--disabled):hover .app-checkbox__checkmark {
  background-color: var(--color-primary-400);
}

.app-checkbox__icon {
  font-size: 18px;
  color: white;
  position: absolute;
}
</style>

