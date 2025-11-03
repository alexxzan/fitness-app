<template>
  <ion-action-sheet
    :is-open="isOpen"
    :header="header"
    :buttons="menuButtons"
    @did-dismiss="handleDismiss"
  />
</template>

<script setup lang="ts">
import { IonActionSheet } from "@ionic/vue";
import { computed } from "vue";

export interface ContentMenuItem {
  text: string;
  handler: () => void;
  role?: "destructive" | "cancel" | "selected" | undefined;
  icon?: string;
}

interface Props {
  isOpen: boolean;
  items: ContentMenuItem[];
  header?: string;
  showCancel?: boolean;
  cancelText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  header: "",
  showCancel: true,
  cancelText: "Cancel",
});

const emit = defineEmits<{
  dismiss: [];
}>();

const menuButtons = computed(() => {
  const buttons = [...props.items];

  if (props.showCancel) {
    buttons.push({
      text: props.cancelText,
      role: "cancel",
      handler: () => {},
    });
  }

  return buttons;
});

function handleDismiss() {
  emit("dismiss");
}
</script>

<style scoped>
/* Action sheet styling is handled by Ionic */
</style>

