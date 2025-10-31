import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "io.ionic.starter",
  appName: "fitness-app",
  webDir: "dist",
  server: {
    url: "http://192.168.178.206:5173",
    cleartext: true,
  },
};

export default config;
