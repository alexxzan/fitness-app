import { Keyboard } from "@capacitor/keyboard";
import { Capacitor } from "@capacitor/core";

/**
 * Global keyboard manager state
 */
let keyboardWillShowListener: any = null;
let keyboardWillHideListener: any = null;
let keyboardDidShowListener: any = null;
let keyboardDidHideListener: any = null;
let isInitialized = false;

/**
 * Initialize keyboard management
 * - Enable accessory bar with Done button on iOS
 * - Set up keyboard event listeners
 */
async function initializeKeyboard() {
  if (isInitialized) {
    return;
  }

  if (!Capacitor.isNativePlatform()) {
    // Web platform - keyboard plugin not needed
    isInitialized = true;
    return;
  }

  try {
    // Show accessory bar with Done button on iOS
    // This is only supported on iPhone devices
    if (Capacitor.getPlatform() === "ios") {
      await Keyboard.setAccessoryBarVisible({ isVisible: true });
    }

    // Set up keyboard event listeners
    setupKeyboardListeners();
    isInitialized = true;
  } catch (error) {
    console.warn("Failed to initialize keyboard:", error);
  }
}

/**
 * Set up keyboard event listeners
 */
function setupKeyboardListeners() {
  // Listen for keyboard show events
  keyboardWillShowListener = Keyboard.addListener(
    "keyboardWillShow",
    (info) => {
      // Keyboard is about to show
      // The Done button will appear automatically on iOS
    }
  );

  keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
    // Keyboard is now visible
  });

  // Listen for keyboard hide events
  keyboardWillHideListener = Keyboard.addListener("keyboardWillHide", () => {
    // Keyboard is about to hide
  });

  keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
    // Keyboard is now hidden
  });
}

/**
 * Dismiss the keyboard programmatically
 */
export async function dismissKeyboard() {
  if (!Capacitor.isNativePlatform()) {
    // On web, blur the active element
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    return;
  }

  try {
    await Keyboard.hide();
  } catch (error) {
    console.warn("Failed to dismiss keyboard:", error);
    // Fallback: blur active element
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }
}

/**
 * Clean up keyboard listeners
 */
function cleanupKeyboard() {
  if (keyboardWillShowListener) {
    keyboardWillShowListener.remove();
    keyboardWillShowListener = null;
  }
  if (keyboardDidShowListener) {
    keyboardDidShowListener.remove();
    keyboardDidShowListener = null;
  }
  if (keyboardWillHideListener) {
    keyboardWillHideListener.remove();
    keyboardWillHideListener = null;
  }
  if (keyboardDidHideListener) {
    keyboardDidHideListener.remove();
    keyboardDidHideListener = null;
  }
  isInitialized = false;
}

/**
 * Composable for managing keyboard behavior in Vue components
 * - Shows accessory bar with Done button on iOS
 * - Handles keyboard dismissal
 * - Supports swipe-down gesture (native iOS behavior)
 */
export function useKeyboard() {
  return {
    dismissKeyboard,
  };
}

/**
 * Initialize global keyboard management
 * Call this in main.ts on app startup
 */
export async function initializeGlobalKeyboard() {
  await initializeKeyboard();
}

/**
 * Cleanup global keyboard management
 * Call this when app is shutting down (optional)
 */
export function cleanupGlobalKeyboard() {
  cleanupKeyboard();
}
