import { ref } from "vue";
import type { AlertButton } from "@/components/molecules/AlertDialog.vue";

export interface AlertOptions {
  header?: string;
  message?: string;
  buttons: AlertButton[];
}

/**
 * Composable for managing alert dialogs
 * Returns reactive state and methods to show/hide alerts
 */
export function useAlert() {
  const isOpen = ref(false);
  const alertOptions = ref<AlertOptions>({
    header: "",
    message: "",
    buttons: [],
  });

  function showAlert(options: AlertOptions) {
    alertOptions.value = options;
    isOpen.value = true;
  }

  function hideAlert() {
    isOpen.value = false;
  }

  /**
   * Convenience method to show a confirmation alert
   */
  function showConfirm(options: {
    header?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
  }) {
    showAlert({
      header: options.header || "Confirm",
      message: options.message,
      buttons: [
        {
          text: options.cancelText || "Cancel",
          role: "cancel",
          handler: options.onCancel,
        },
        {
          text: options.confirmText || "Confirm",
          role: "confirm",
          handler: options.onConfirm,
        },
      ],
    });
  }

  /**
   * Convenience method to show a destructive confirmation alert
   */
  function showDestructiveConfirm(options: {
    header?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
  }) {
    showAlert({
      header: options.header || "Confirm",
      message: options.message,
      buttons: [
        {
          text: options.cancelText || "Cancel",
          role: "cancel",
          handler: options.onCancel,
        },
        {
          text: options.confirmText || "Confirm",
          role: "destructive",
          handler: options.onConfirm,
        },
      ],
    });
  }

  return {
    isOpen,
    alertOptions,
    showAlert,
    hideAlert,
    showConfirm,
    showDestructiveConfirm,
  };
}
