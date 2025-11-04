import type { CapacitorConfig } from "@capacitor/cli";

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
};

export default config;
