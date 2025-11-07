/// <reference types="@capacitor/keyboard" />

import type { CapacitorConfig } from "@capacitor/cli";
import { KeyboardResize } from "@capacitor/keyboard";

const config: CapacitorConfig = {
  appId: "com.alexchorak.fitnessapp",
  appName: "fitness-app",
  webDir: "dist",
  // Only enable server config for development (when using live reload)
  // Comment out or remove the server config for production builds
  // server: {
  //   url: "http://192.168.178.206:5173",
  //   cleartext: true,
  // },
  plugins: {
    Keyboard: {
      resize: KeyboardResize.Body,
      resizeOnFullScreen: true,
    },
  },
};

export default config;
