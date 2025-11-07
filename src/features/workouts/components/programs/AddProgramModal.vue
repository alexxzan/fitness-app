<template>
  <!-- Action Sheet for Program Selection -->
  <ion-action-sheet
    :is-open="isOpen && showActionSheet"
    header="Add Workout Program"
    :buttons="actionSheetButtons"
    @did-dismiss="handleActionSheetDismiss"
  />

  <!-- Template Selection Modal -->
  <WorkoutTemplateModal
    :is-open="isOpen && showTemplateList"
    :templates="templates"
    @select="handleSelectTemplate"
    @dismiss="handleClose"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { IonActionSheet } from "@ionic/vue";
import { useRoutine } from "../../composables/useRoutine";
import type { WorkoutTemplate } from "../../types/workout.types";
import WorkoutTemplateModal from "../routines/WorkoutTemplateModal.vue";

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
  selectTemplate: [template: WorkoutTemplate];
  createCustom: [];
}>();

const { templates } = useRoutine();
const showActionSheet = ref(true);
const showTemplateList = ref(false);

// Reset state when modal opens/closes
watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      showActionSheet.value = true;
      showTemplateList.value = false;
    } else {
      showActionSheet.value = false;
      showTemplateList.value = false;
    }
  }
);

const actionSheetButtons = computed(() => [
  {
    text: "Create Custom Program",
    handler: () => {
      showActionSheet.value = false;
      emit("createCustom");
      handleClose();
    },
  },
  {
    text: "Browse Templates",
    handler: () => {
      showActionSheet.value = false;
      showTemplateList.value = true;
    },
  },
  {
    text: "Cancel",
    role: "cancel",
    handler: () => {
      handleClose();
    },
  },
]);

function handleActionSheetDismiss() {
  // Only close everything if template list is not showing
  // If template list is showing, user selected "Browse Templates" and we should keep it open
  if (!showTemplateList.value) {
    handleClose();
  } else {
    // Just hide the action sheet, keep template list open
    showActionSheet.value = false;
  }
}

function handleClose() {
  showActionSheet.value = false;
  showTemplateList.value = false;
  emit("close");
}

function handleSelectTemplate(template: WorkoutTemplate) {
  emit("selectTemplate", template);
  handleClose();
}
</script>
